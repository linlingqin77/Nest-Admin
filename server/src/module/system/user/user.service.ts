import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { Response } from 'express';
import { Prisma, SysDept, SysPost, SysRole, SysUser } from '@prisma/client';
import { toDtoList } from 'src/shared/utils/index';
import { UserResponseDto, UserOptionResponseDto } from './dto/responses';

import { CacheEnum, DelFlagEnum, StatusEnum } from 'src/shared/enums/index';
import { Transactional } from 'src/core/decorators/transactional.decorator';
import { Result } from 'src/shared/response';
import {
  CreateUserDto,
  UpdateUserDto,
  ListUserDto,
  ChangeUserStatusDto,
  ResetPwdDto,
  AllocatedListDto,
  UpdateProfileDto,
  UpdatePwdDto,
  BatchCreateUserDto,
  BatchDeleteUserDto,
  BatchResultDto,
} from './dto/index';
import { RegisterRequestDto, LoginRequestDto } from '../../main/dto/requests';
import { AuthUserCancelDto, AuthUserCancelAllDto, AuthUserSelectAllDto } from '../role/dto/index';

import { RoleService } from '../role/role.service';
import { DeptService } from '../dept/dept.service';

import { UserType } from './dto/user';
import { ClientInfoDto } from 'src/core/decorators/common.decorator';
import { Captcha } from 'src/core/decorators/captcha.decorator';
import { PrismaService } from 'src/infrastructure/prisma';

// 导入子服务
import { UserAuthService } from './services/user-auth.service';
import { UserProfileService } from './services/user-profile.service';
import { UserRoleService } from './services/user-role.service';
import { UserExportService } from './services/user-export.service';
import { UserCrudService } from './services/user-crud.service';
import { UserBatchService } from './services/user-batch.service';

/** 用户实体与部门信息的联合类型 */
type UserWithDept = SysUser & { dept?: SysDept | null };
/** 用户实体与关联信息（部门、角色、岗位）的联合类型 */
type UserWithRelations = UserWithDept & { roles?: SysRole[]; posts?: SysPost[] };

/**
 * 用户管理服务
 *
 * 作为门面（Facade）协调各子服务，提供统一的用户管理接口。
 * 实际业务逻辑已拆分到以下子服务：
 * - UserCrudService: 用户 CRUD 操作
 * - UserBatchService: 用户批量操作
 * - UserAuthService: 用户认证相关
 * - UserProfileService: 用户个人资料
 * - UserRoleService: 用户角色分配
 * - UserExportService: 用户数据导出
 *
 * @class UserService
 */
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly deptService: DeptService,
    // 注入子服务
    @Inject(forwardRef(() => UserAuthService))
    private readonly userAuthService: UserAuthService,
    @Inject(forwardRef(() => UserProfileService))
    private readonly userProfileService: UserProfileService,
    @Inject(forwardRef(() => UserRoleService))
    private readonly userRoleService: UserRoleService,
    private readonly userExportService: UserExportService,
    @Inject(forwardRef(() => UserCrudService))
    private readonly userCrudService: UserCrudService,
    private readonly userBatchService: UserBatchService,
  ) {}

  // ==================== 用户 CRUD 操作 - 委托给 UserCrudService ====================

  /**
   * 创建新用户
   */
  async create(createUserDto: CreateUserDto) {
    return this.userCrudService.create(createUserDto);
  }

  /**
   * 分页查询用户列表
   */
  async findAll(query: ListUserDto, user: UserType['user']) {
    return this.userCrudService.findAll(query, user);
  }

  /**
   * 根据用户ID查询用户详情
   */
  async findOne(userId: number) {
    return this.userCrudService.findOne(userId);
  }

  /**
   * 更新用户信息
   */
  async update(updateUserDto: UpdateUserDto, userId: number) {
    return this.userCrudService.update(updateUserDto, userId);
  }

  /**
   * 批量删除用户（软删除）
   */
  async remove(ids: number[]) {
    return this.userCrudService.remove(ids);
  }

  /**
   * 批量创建用户
   */
  async batchCreate(batchCreateDto: BatchCreateUserDto): Promise<Result<BatchResultDto>> {
    return this.userBatchService.batchCreate(batchCreateDto);
  }

  /**
   * 批量删除用户
   */
  async batchDelete(batchDeleteDto: BatchDeleteUserDto): Promise<Result<BatchResultDto>> {
    return this.userBatchService.batchDelete(batchDeleteDto);
  }

  /**
   * 修改用户状态
   */
  async changeStatus(changeStatusDto: ChangeUserStatusDto) {
    return this.userCrudService.changeStatus(changeStatusDto);
  }

  /**
   * 清除指定用户的缓存
   */
  clearCacheByUserId(userId: number) {
    return this.userCrudService.clearCacheByUserId(userId);
  }

  // ==================== 查询辅助方法 ====================

  /**
   * 获取所有岗位和角色列表
   */
  async findPostAndRoleAll() {
    const [posts, roles] = await Promise.all([
      this.prisma.sysPost.findMany({ where: { delFlag: DelFlagEnum.NORMAL } }),
      this.roleService.findRoles({ where: { delFlag: DelFlagEnum.NORMAL } }),
    ]);

    return Result.ok({ posts, roles });
  }

  /**
   * 获取部门树结构
   */
  async deptTree() {
    const tree = await this.deptService.deptTree();
    return Result.ok(tree);
  }

  /**
   * 获取用户选择列表
   */
  async optionselect() {
    const list = await this.prisma.sysUser.findMany({
      where: {
        delFlag: DelFlagEnum.NORMAL,
        status: StatusEnum.NORMAL,
      },
      select: {
        userId: true,
        userName: true,
        nickName: true,
      },
    });
    return Result.ok(toDtoList(UserOptionResponseDto, list));
  }

  /**
   * 根据部门ID查询用户列表
   */
  async findByDeptId(deptId: number) {
    const list = await this.prisma.sysUser.findMany({
      where: {
        deptId,
        delFlag: DelFlagEnum.NORMAL,
      },
    });
    return Result.ok(toDtoList(UserResponseDto, list));
  }

  // ==================== 认证相关 - 委托给 UserAuthService ====================

  /**
   * 用户登录
   */
  @Captcha('user')
  async login(user: LoginRequestDto, clientInfo: ClientInfoDto) {
    return this.userAuthService.login(user, clientInfo);
  }

  /**
   * 用户注册
   */
  async register(user: RegisterRequestDto) {
    return this.userAuthService.register(user);
  }

  /**
   * 创建JWT Token
   */
  createToken(payload: { uuid: string; userId: number }): string {
    return this.userAuthService.createToken(payload);
  }

  /**
   * 解析JWT Token
   */
  parseToken(token: string) {
    return this.userAuthService.parseToken(token);
  }

  /**
   * 更新Redis中的Token元数据
   */
  async updateRedisToken(token: string, metaData: Partial<UserType>) {
    return this.userAuthService.updateRedisToken(token, metaData);
  }

  /**
   * 更新Redis中用户的角色和权限信息
   */
  async updateRedisUserRolesAndPermissions(uuid: string, userId: number) {
    return this.userAuthService.updateRedisUserRolesAndPermissions(uuid, userId);
  }

  /**
   * 获取用户的角色ID列表
   */
  async getRoleIds(userIds: Array<number>) {
    return this.userAuthService.getRoleIds(userIds);
  }

  /**
   * 获取用户的权限列表
   */
  async getUserPermissions(userId: number) {
    return this.userAuthService.getUserPermissions(userId);
  }

  /**
   * 获取用户完整信息
   */
  async getUserinfo(userId: number): Promise<UserWithRelations> {
    return this.userAuthService.getUserinfo(userId);
  }

  // ==================== 个人资料相关 - 委托给 UserProfileService ====================

  /**
   * 获取当前用户个人资料
   */
  async profile(user) {
    return this.userProfileService.profile(user);
  }

  /**
   * 更新当前用户个人资料
   */
  async updateProfile(user: UserType, updateProfileDto: UpdateProfileDto) {
    return this.userProfileService.updateProfile(user, updateProfileDto);
  }

  /**
   * 修改当前用户密码
   */
  async updatePwd(user: UserType, updatePwdDto: UpdatePwdDto) {
    return this.userProfileService.updatePwd(user, updatePwdDto);
  }

  /**
   * 重置用户密码（管理员操作）
   */
  async resetPwd(body: ResetPwdDto) {
    return this.userProfileService.resetPwd(body);
  }

  // ==================== 角色分配相关 - 委托给 UserRoleService ====================

  /**
   * 获取用户的角色授权信息
   */
  async authRole(userId: number) {
    return this.userRoleService.authRole(userId);
  }

  /**
   * 更新用户的角色授权
   */
  @Transactional()
  async updateAuthRole(query) {
    return this.userRoleService.updateAuthRole(query);
  }

  /**
   * 查询已分配指定角色的用户列表
   */
  async allocatedList(query: AllocatedListDto) {
    return this.userRoleService.allocatedList(query);
  }

  /**
   * 查询未分配指定角色的用户列表
   */
  async unallocatedList(query: AllocatedListDto) {
    return this.userRoleService.unallocatedList(query);
  }

  /**
   * 取消用户的角色授权
   */
  async authUserCancel(data: AuthUserCancelDto) {
    return this.userRoleService.authUserCancel(data);
  }

  /**
   * 批量取消用户的角色授权
   */
  @Transactional()
  async authUserCancelAll(data: AuthUserCancelAllDto) {
    return this.userRoleService.authUserCancelAll(data);
  }

  /**
   * 批量为用户分配角色
   */
  @Transactional()
  async authUserSelectAll(data: AuthUserSelectAllDto) {
    return this.userRoleService.authUserSelectAll(data);
  }

  // ==================== 导出相关 - 委托给 UserExportService ====================

  /**
   * 导出用户数据为Excel文件
   */
  async export(res: Response, body: ListUserDto, user: UserType['user']) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body, user);
    return this.userExportService.export(res, list.data as { rows: unknown[]; total: number });
  }
}
