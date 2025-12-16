import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ResultData } from 'src/common/utils/result';
import { CreateDeptDto, UpdateDeptDto, ListDeptDto } from './dto/index';
import { FormatDateFields, ListToTree } from 'src/common/utils/index';
import { CacheEnum, DataScopeEnum } from 'src/common/enum/index';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeptService {
  constructor(private readonly prisma: PrismaService) { }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async create(createDeptDto: CreateDeptDto) {
    let ancestors = '0';
    if (createDeptDto.parentId) {
      const parent = await this.prisma.sysDept.findUnique({
        where: {
          deptId: createDeptDto.parentId,
        },
        select: {
          ancestors: true,
        },
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      ancestors = parent.ancestors ? `${parent.ancestors},${createDeptDto.parentId}` : `${createDeptDto.parentId}`;
    }
    const payload: Prisma.SysDeptUncheckedCreateInput = {
      parentId: createDeptDto.parentId,
      ancestors,
      deptName: createDeptDto.deptName,
      orderNum: createDeptDto.orderNum,
      leader: createDeptDto.leader ?? '',
      phone: createDeptDto.phone ?? '',
      email: createDeptDto.email ?? '',
      status: createDeptDto.status ?? '0',
      delFlag: '0',
      createBy: 'system',
      updateBy: 'system',
      remark: null,
    };
    await this.prisma.sysDept.create({ data: payload });
    return ResultData.ok();
  }

  async findAll(query: ListDeptDto) {
    const where: Prisma.SysDeptWhereInput = {
      delFlag: '0',
    };

    if (query.deptName) {
      where.deptName = {
        contains: query.deptName,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const res = await this.prisma.sysDept.findMany({
      where,
      orderBy: { orderNum: 'asc' },
    });
    const formattedRes = FormatDateFields(res);
    return ResultData.ok(formattedRes);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findOne:{deptId}')
  async findOne(deptId: number) {
    const data = await this.prisma.sysDept.findUnique({
      where: {
        deptId,
      },
    });
    const formattedData = FormatDateFields(data);
    return ResultData.ok(formattedData);
  }

  /**
   * 根据数据权限范围和部门ID查询部门ID列表。
   * @param deptId 部门ID，表示需要查询的部门。
   * @param dataScope 数据权限范围，决定查询的部门范围。
   * @returns 返回一个部门ID数组，根据数据权限范围决定返回的部门ID集合。
   */
  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findDeptIdsByDataScope:{deptId}-{dataScope}')
  async findDeptIdsByDataScope(deptId: number, dataScope: DataScopeEnum) {
    try {
      if (dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
        return [];
      }

      const where: Prisma.SysDeptWhereInput = {
        delFlag: '0',
      };

      if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT) {
        where.deptId = deptId;
      }

      if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
        where.OR = [
          { deptId },
          {
            ancestors: {
              contains: `${deptId}`,
            },
          },
        ];
      }

      const list = await this.prisma.sysDept.findMany({ where });
      return list.map((item) => item.deptId);
    } catch (error) {
      console.error('Failed to query department IDs:', error);
      throw new Error('Querying department IDs failed');
    }
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findListExclude')
  async findListExclude(id: number) {
    //TODO 需排出ancestors 中不出现id的数据
    const data = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async update(updateDeptDto: UpdateDeptDto) {
    if (updateDeptDto.parentId && updateDeptDto.parentId !== 0) {
      const parent = await this.prisma.sysDept.findUnique({
        where: {
          deptId: updateDeptDto.parentId,
        },
        select: { ancestors: true },
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const ancestors = parent.ancestors ? `${parent.ancestors},${updateDeptDto.parentId}` : `${updateDeptDto.parentId}`;
      Object.assign(updateDeptDto, { ancestors: ancestors });
    }
    await this.prisma.sysDept.update({ where: { deptId: updateDeptDto.deptId }, data: updateDeptDto });
    return ResultData.ok();
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async remove(deptId: number) {
    const data = await this.prisma.sysDept.update({
      where: { deptId },
      data: { delFlag: '1' },
    });
    return ResultData.ok(data);
  }

  /**
   * 获取部门选择框列表
   */
  async optionselect() {
    const list = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
        status: '0',
      },
      orderBy: { orderNum: 'asc' },
    });
    return ResultData.ok(list);
  }

  /**
   * 部门树
   * @returns
   */
  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'deptTree')
  async deptTree() {
    const res = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
      },
      orderBy: { orderNum: 'asc' },
    });
    const tree = ListToTree(
      res,
      (m) => m.deptId,
      (m) => m.deptName,
    );
    return tree;
  }

  /**
   * 获取指定部门及其所有子部门的ID列表
   * @param deptId 部门ID
   * @returns 部门ID数组
   */
  async getChildDeptIds(deptId: number): Promise<number[]> {
    const depts = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
        OR: [{ deptId }, { ancestors: { contains: `,${deptId}` } }, { ancestors: { startsWith: `${deptId},` } }, { ancestors: { contains: `,${deptId},` } }],
      },
      select: { deptId: true },
    });
    return depts.map((d) => d.deptId);
  }
}
