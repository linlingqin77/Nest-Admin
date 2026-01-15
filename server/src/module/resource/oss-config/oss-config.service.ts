import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Result, ResponseCode } from 'src/shared/response';
import { BusinessException } from 'src/shared/exceptions';
import { toDto, toDtoPage } from 'src/shared/utils/index';
import { DelFlagEnum } from 'src/shared/enums/index';
import { PrismaService } from 'src/infrastructure/prisma';
import { OssConfigRepository } from './oss-config.repository';
import {
  CreateOssConfigDto,
  UpdateOssConfigDto,
  ChangeOssConfigStatusDto,
  ListOssConfigDto,
  OssConfigResponseDto,
} from './dto/index';
import { Transactional } from 'src/core/decorators/transactional.decorator';

@Injectable()
export class OssConfigService {
  private readonly logger = new Logger(OssConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ossConfigRepo: OssConfigRepository,
  ) {}

  /**
   * 创建OSS配置
   */
  @Transactional()
  async create(createOssConfigDto: CreateOssConfigDto) {
    // 检查配置key是否已存在
    const exists = await this.ossConfigRepo.existsByConfigKey(createOssConfigDto.configKey);
    BusinessException.throwIf(exists, '配置名称已存在', ResponseCode.DATA_ALREADY_EXISTS);

    // 如果设置为默认配置，需要将其他配置设为非默认
    if (createOssConfigDto.status === '0') {
      await this.prisma.sysOssConfig.updateMany({
        where: { status: '0', delFlag: DelFlagEnum.NORMAL },
        data: { status: '1' },
      });
    }

    await this.ossConfigRepo.create({
      configKey: createOssConfigDto.configKey,
      accessKey: createOssConfigDto.accessKey,
      secretKey: createOssConfigDto.secretKey,
      bucketName: createOssConfigDto.bucketName,
      prefix: createOssConfigDto.prefix || '',
      endpoint: createOssConfigDto.endpoint,
      domain: createOssConfigDto.domain || '',
      isHttps: createOssConfigDto.isHttps || 'N',
      region: createOssConfigDto.region || '',
      accessPolicy: createOssConfigDto.accessPolicy || '1',
      status: createOssConfigDto.status || '1',
      remark: createOssConfigDto.remark || '',
    });

    return Result.ok(null, '创建成功');
  }

  /**
   * 查询OSS配置列表
   */
  async findAll(query: ListOssConfigDto) {
    const where: Prisma.SysOssConfigWhereInput = {
      delFlag: DelFlagEnum.NORMAL,
    };

    if (query.configKey) {
      where.configKey = {
        contains: query.configKey,
      };
    }

    if (query.bucketName) {
      where.bucketName = {
        contains: query.bucketName,
      };
    }

    if (query.region) {
      where.region = {
        contains: query.region,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const { list, total } = await this.ossConfigRepo.findPageWithFilter(where, query.skip, query.take);

    return Result.ok(
      toDtoPage(OssConfigResponseDto, {
        rows: list,
        total,
      }),
    );
  }

  /**
   * 根据ID查询OSS配置详情
   */
  async findOne(ossConfigId: number) {
    const data = await this.ossConfigRepo.findById(ossConfigId);
    BusinessException.throwIfNull(data, 'OSS配置不存在', ResponseCode.DATA_NOT_FOUND);

    return Result.ok(toDto(OssConfigResponseDto, data));
  }

  /**
   * 更新OSS配置
   */
  @Transactional()
  async update(updateOssConfigDto: UpdateOssConfigDto) {
    const ossConfig = await this.ossConfigRepo.findById(updateOssConfigDto.ossConfigId);
    BusinessException.throwIfNull(ossConfig, 'OSS配置不存在', ResponseCode.DATA_NOT_FOUND);

    // 如果修改了configKey，检查是否重复
    if (updateOssConfigDto.configKey && updateOssConfigDto.configKey !== ossConfig.configKey) {
      const exists = await this.ossConfigRepo.existsByConfigKey(
        updateOssConfigDto.configKey,
        updateOssConfigDto.ossConfigId,
      );
      BusinessException.throwIf(exists, '配置名称已存在', ResponseCode.DATA_ALREADY_EXISTS);
    }

    // 如果设置为默认配置，需要将其他配置设为非默认
    if (updateOssConfigDto.status === '0' && ossConfig.status !== '0') {
      await this.prisma.sysOssConfig.updateMany({
        where: { status: '0', delFlag: DelFlagEnum.NORMAL },
        data: { status: '1' },
      });
    }

    const updateData: Prisma.SysOssConfigUpdateInput = {};

    if (updateOssConfigDto.configKey !== undefined) {
      updateData.configKey = updateOssConfigDto.configKey;
    }
    if (updateOssConfigDto.accessKey !== undefined) {
      updateData.accessKey = updateOssConfigDto.accessKey;
    }
    if (updateOssConfigDto.secretKey !== undefined) {
      updateData.secretKey = updateOssConfigDto.secretKey;
    }
    if (updateOssConfigDto.bucketName !== undefined) {
      updateData.bucketName = updateOssConfigDto.bucketName;
    }
    if (updateOssConfigDto.prefix !== undefined) {
      updateData.prefix = updateOssConfigDto.prefix;
    }
    if (updateOssConfigDto.endpoint !== undefined) {
      updateData.endpoint = updateOssConfigDto.endpoint;
    }
    if (updateOssConfigDto.domain !== undefined) {
      updateData.domain = updateOssConfigDto.domain;
    }
    if (updateOssConfigDto.isHttps !== undefined) {
      updateData.isHttps = updateOssConfigDto.isHttps;
    }
    if (updateOssConfigDto.region !== undefined) {
      updateData.region = updateOssConfigDto.region;
    }
    if (updateOssConfigDto.accessPolicy !== undefined) {
      updateData.accessPolicy = updateOssConfigDto.accessPolicy;
    }
    if (updateOssConfigDto.status !== undefined) {
      updateData.status = updateOssConfigDto.status;
    }
    if (updateOssConfigDto.remark !== undefined) {
      updateData.remark = updateOssConfigDto.remark;
    }

    await this.ossConfigRepo.update(updateOssConfigDto.ossConfigId, updateData);

    return Result.ok(null, '更新成功');
  }

  /**
   * 修改OSS配置状态
   */
  @Transactional()
  async changeStatus(dto: ChangeOssConfigStatusDto) {
    const ossConfig = await this.ossConfigRepo.findById(dto.ossConfigId);
    BusinessException.throwIfNull(ossConfig, 'OSS配置不存在', ResponseCode.DATA_NOT_FOUND);

    // 如果设置为默认配置，需要将其他配置设为非默认
    if (dto.status === '0') {
      await this.prisma.sysOssConfig.updateMany({
        where: { status: '0', delFlag: DelFlagEnum.NORMAL },
        data: { status: '1' },
      });
    }

    await this.ossConfigRepo.update(dto.ossConfigId, { status: dto.status });

    return Result.ok(null, '状态修改成功');
  }

  /**
   * 批量删除OSS配置
   */
  @Transactional()
  async remove(ids: number[]) {
    await this.ossConfigRepo.softDeleteBatch(ids);
    return Result.ok(null, '删除成功');
  }

  /**
   * 获取默认OSS配置
   */
  async getDefaultConfig() {
    const config = await this.ossConfigRepo.findDefaultConfig();
    if (!config) {
      return Result.ok(null);
    }
    return Result.ok(toDto(OssConfigResponseDto, config));
  }
}
