import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { BusinessException } from 'src/shared/exceptions';
import * as bcrypt from 'bcryptjs';
import { Prisma, SysDept, SysPost, SysRole, SysUser } from '@prisma/client';
import { toDto, toDtoPage } from 'src/shared/utils/index';
import { PaginationHelper } from 'src/shared/utils/pagination.helper';
import { UserResponseDto } from '../dto/responses';

import { CacheEnum, DelFlagEnum, DataScopeEnum } from 'src/shared/enums/index';
import { Transactional } from 'src/core/decorators/transactional.decorator';
import { Idempotent } from 'src/core/decorators/idempotent.decorator';
import { Lock } from 'src/core/decorators/lock.decorator';
import { SYS_USER_TYPE } from 'src/shared/constants/index';
import { Result, ResponseCode } from 'src/shared/response';
import { CreateUserDto, UpdateUserDto, ListUserDto, ChangeUserStatusDto } from '../dto/index';

import { DeptService } from '../../dept/dept.service';
import { UserType } from '../dto/user';
import { Cacheable, CacheEvict } from 'src/core/decorators/redis.decorator';
import { PrismaService } from 'src/infrastructure/prisma';
import { UserRepository } from '../user.repository';
import { RoleService } from '../../role/role.service';

/** 用户实体与部门信息的联合类型 */
type UserWithDept = SysUser & { dept?: SysDept | null };
/** 用户实体与关联信息（部门、角色、岗位）的联合类型 */
type UserWithRelations = UserWithDept & { roles?: SysRole[]; posts?: SysPost[] };

/**
 * 用户 CRUD 服务
 *
 * 提供用户相关的 CRUD 操作，包括：
 * - 用户创建、查询、更新、删除
 * - 用户状态变更
 *
 * @class UserCrudService
 */
@Injectable()
export class UserCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepo: UserRepository,
    private readonly roleService: RoleService,
    @Inject(forwardRef(() => DeptService))
    private readonly deptService: DeptService,
  ) {}

  // ==================== 私有辅助方法 ====================

  /**
   * 为用户列表附加部门信息
   */
  async attachDeptInfo(users: SysUser[]): Promise<UserWithDept[]> {
    if (!users.length) {
      return users;
    }
    const deptIds = Array.from(
      new Set(
        users
          .map((item) => item.deptId)
          .filter((deptId): deptId is number => typeof deptId === 'number' && !Number.isNaN(deptId)),
      ),
    );
    if (!deptIds.length) {
      return users;
    }
    const depts = await this.prisma.sysDept.findMany({
      where: {
        deptId: { in: deptIds },
        delFlag: DelFlagEnum.NORMAL,
      },
    });
    const deptMap = new Map<number, SysDept>(depts.map((dept) => [dept.deptId, dept]));
    return users.map((item) => ({
      ...item,
      dept: deptMap.get(item.deptId) ?? null,
    }));
  }

  /**
   * 构建数据权限过滤条件
   */
  async buildDataScopeConditions(currentUser?: UserType['user']): Promise<Prisma.SysUserWhereInput[]> {
    if (!currentUser) {
      return [];
    }
    const deptIdSet = new Set<number>();
    let dataScopeAll = false;
    let dataScopeSelf = false;
    const roles = currentUser.roles ?? [];

    const customRoleIds: number[] = [];
    const deptScopes = new Set<DataScopeEnum>();

    for (const role of roles) {
      switch (role.dataScope) {
        case DataScopeEnum.DATA_SCOPE_ALL:
          dataScopeAll = true;
          break;
        case DataScopeEnum.DATA_SCOPE_CUSTOM:
          customRoleIds.push(role.roleId);
          break;
        case DataScopeEnum.DATA_SCOPE_DEPT:
        case DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD:
          deptScopes.add(role.dataScope);
          break;
        case DataScopeEnum.DATA_SCOPE_SELF:
          dataScopeSelf = true;
          break;
        default:
          break;
      }
      if (dataScopeAll) {
        break;
      }
    }

    if (dataScopeAll) {
      return [];
    }

    if (customRoleIds.length > 0) {
      const roleDeptRows = await this.prisma.sysRoleDept.findMany({
        where: { roleId: { in: customRoleIds } },
        select: { deptId: true },
      });
      roleDeptRows.forEach((row) => deptIdSet.add(row.deptId));
    }

    for (const scope of deptScopes) {
      const deptIds = await this.deptService.findDeptIdsByDataScope(currentUser.deptId, scope);
      deptIds.forEach((id) => deptIdSet.add(+id));
    }

    if (deptIdSet.size > 0) {
      return [{ deptId: { in: Array.from(deptIdSet) } }];
    }

    if (dataScopeSelf) {
      return [{ userId: currentUser.userId }];
    }

    return [];
  }

  // ==================== 用户 CRUD 操作 ====================

  /**
   * 创建新用户
   */
  @Idempotent({
    timeout: 5,
    keyResolver: '{body.userName}',
    message: '用户正在创建中，请勿重复提交',
  })
  @Transactional()
  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    if (createUserDto.password) {
      createUserDto.password = bcrypt.hashSync(createUserDto.password, salt);
    }
    const {
      postIds = [],
      roleIds = [],
      ...userPayload
    } = createUserDto as CreateUserDto & { postIds?: number[]; roleIds?: number[] };

    const user = await this.userRepo.create({
      ...userPayload,
      userType: SYS_USER_TYPE.CUSTOM,
      phonenumber: userPayload.phonenumber ?? '',
      sex: userPayload.sex ?? '0',
      status: userPayload.status ?? '0',
      avatar: '',
      delFlag: DelFlagEnum.NORMAL,
      loginIp: '',
    });

    if (postIds.length > 0) {
      await this.prisma.sysUserPost.createMany({
        data: postIds.map((postId) => ({ userId: user.userId, postId })),
        skipDuplicates: true,
      });
    }

    if (roleIds.length > 0) {
      await this.prisma.sysUserRole.createMany({
        data: roleIds.map((roleId) => ({ userId: user.userId, roleId })),
        skipDuplicates: true,
      });
    }

    return Result.ok();
  }

  /**
   * 分页查询用户列表
   */
  async findAll(query: ListUserDto, user: UserType['user']) {
    const where: Prisma.SysUserWhereInput = {
      delFlag: DelFlagEnum.NORMAL,
    };

    const andConditions: Prisma.SysUserWhereInput[] = await this.buildDataScopeConditions(user);

    if (query.deptId) {
      const deptIds = await this.deptService.findDeptIdsByDataScope(
        +query.deptId,
        DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD,
      );
      andConditions.push({
        deptId: { in: deptIds.map((item) => +item) },
      });
    }

    if (andConditions.length) {
      where.AND = andConditions;
    }

    if (query.userName) {
      where.userName = PaginationHelper.buildStringFilter(query.userName);
    }

    if (query.phonenumber) {
      where.phonenumber = PaginationHelper.buildStringFilter(query.phonenumber);
    }

    if (query.status) {
      where.status = query.status;
    }

    const createTime = PaginationHelper.buildDateRange(query.params);
    if (createTime) {
      where.createTime = createTime;
    }

    const { skip, take } = PaginationHelper.getPagination(query);

    const { rows: list, total } = await PaginationHelper.paginateWithTransaction<SysUser>(
      this.prisma,
      'sysUser',
      { where, skip, take, orderBy: { createTime: 'desc' } },
      { where },
    );

    const listWithDept = await this.attachDeptInfo(list);

    const rows = listWithDept.map((user) => ({
      ...user,
      deptName: user.dept?.deptName || '',
    }));

    return Result.ok(toDtoPage(UserResponseDto, { rows, total }));
  }

  /**
   * 根据用户ID查询用户详情
   */
  @Cacheable(CacheEnum.SYS_USER_KEY, '{userId}')
  async findOne(userId: number) {
    const data = await this.userRepo.findById(userId);

    if (!data) {
      return Result.ok(null);
    }

    const [dept, postList, allPosts, roleIds, allRoles] = await Promise.all([
      data?.deptId
        ? this.prisma.sysDept.findFirst({ where: { deptId: data.deptId, delFlag: DelFlagEnum.NORMAL } })
        : Promise.resolve(null),
      this.prisma.sysUserPost.findMany({ where: { userId }, select: { postId: true } }),
      this.prisma.sysPost.findMany({ where: { delFlag: DelFlagEnum.NORMAL } }),
      this.getRoleIds([userId]),
      this.roleService.findRoles({ where: { delFlag: DelFlagEnum.NORMAL } }),
    ]);

    const postIds = postList.map((item) => item.postId);
    const enrichedData: UserWithRelations = {
      ...data,
      dept,
      roles: allRoles.filter((role) => roleIds.includes(role.roleId)),
    };

    return Result.ok({
      data: toDto(UserResponseDto, enrichedData),
      postIds,
      posts: allPosts,
      roles: allRoles,
      roleIds,
    });
  }

  /**
   * 获取用户的角色ID列表
   */
  async getRoleIds(userIds: Array<number>): Promise<number[]> {
    const userRoles = await this.prisma.sysUserRole.findMany({
      where: { userId: { in: userIds } },
      select: { roleId: true },
    });
    return [...new Set(userRoles.map((ur) => ur.roleId))];
  }

  /**
   * 更新用户信息
   */
  @CacheEvict(CacheEnum.SYS_USER_KEY, '{updateUserDto.userId}')
  @Transactional()
  async update(updateUserDto: UpdateUserDto, userId: number) {
    if (updateUserDto.userId === 1) {
      throw new BusinessException(ResponseCode.BUSINESS_ERROR, '非法操作！');
    }

    updateUserDto.roleIds = updateUserDto.roleIds.filter((v) => v != 1);

    if (updateUserDto.userId === userId) {
      delete updateUserDto.status;
    }

    const {
      postIds = [],
      roleIds = [],
      ...rest
    } = updateUserDto as UpdateUserDto & { postIds?: number[]; roleIds?: number[] };

    if (postIds.length > 0) {
      await this.prisma.sysUserPost.deleteMany({ where: { userId: updateUserDto.userId } });
      await this.prisma.sysUserPost.createMany({
        data: postIds.map((postId) => ({ userId: updateUserDto.userId, postId })),
        skipDuplicates: true,
      });
    }

    if (roleIds.length > 0) {
      await this.prisma.sysUserRole.deleteMany({ where: { userId: updateUserDto.userId } });
      await this.prisma.sysUserRole.createMany({
        data: roleIds.map((roleId) => ({ userId: updateUserDto.userId, roleId })),
        skipDuplicates: true,
      });
    }

    const updateData = { ...rest } as Prisma.SysUserUpdateInput;
    delete (updateData as any).password;
    delete (updateData as any).dept;
    delete (updateData as any).roles;
    delete (updateData as any).roleIds;
    delete (updateData as any).postIds;

    const data = await this.prisma.sysUser.update({
      where: { userId: updateUserDto.userId },
      data: updateData,
    });

    return Result.ok(data);
  }

  /**
   * 批量删除用户（软删除）
   */
  async remove(ids: number[]) {
    const count = await this.userRepo.softDeleteBatch(ids);
    return Result.ok({ count });
  }

  /**
   * 修改用户状态
   */
  @Lock({
    key: 'user:status:{body.userId}',
    leaseTime: 10,
    message: '用户状态正在变更中，请稍后重试',
  })
  async changeStatus(changeStatusDto: ChangeUserStatusDto) {
    const userData = await this.userRepo.findById(changeStatusDto.userId);
    if (userData?.userType === SYS_USER_TYPE.SYS) {
      return Result.fail(ResponseCode.BUSINESS_ERROR, '系统角色不可停用');
    }

    await this.userRepo.update(changeStatusDto.userId, { status: changeStatusDto.status });
    return Result.ok();
  }

  /**
   * 清除指定用户的缓存
   */
  @CacheEvict(CacheEnum.SYS_USER_KEY, '{userId}')
  clearCacheByUserId(userId: number) {
    return userId;
  }
}
