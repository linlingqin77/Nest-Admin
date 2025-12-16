import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ResultData } from 'src/common/utils/result';
import { FormatDateFields } from 'src/common/utils/index';
import { CreateNoticeDto, UpdateNoticeDto, ListNoticeDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createNoticeDto: CreateNoticeDto) {
    await this.prisma.sysNotice.create({ data: createNoticeDto });
    return ResultData.ok();
  }

  async findAll(query: ListNoticeDto) {
    const where: Prisma.SysNoticeWhereInput = {
      delFlag: '0',
    };

    if (query.noticeTitle) {
      where.noticeTitle = {
        contains: query.noticeTitle,
      };
    }

    if (query.createBy) {
      where.createBy = {
        contains: query.createBy,
      };
    }

    if (query.noticeType) {
      where.noticeType = query.noticeType;
    }

    if (query.params?.beginTime && query.params?.endTime) {
      where.createTime = {
        gte: new Date(query.params.beginTime),
        lte: new Date(query.params.endTime),
      };
    }

    const pageSize = Number(query.pageSize ?? 10);
    const pageNum = Number(query.pageNum ?? 1);

    const [list, total] = await this.prisma.$transaction([
      this.prisma.sysNotice.findMany({
        where,
        skip: pageSize * (pageNum - 1),
        take: pageSize,
        orderBy: { createTime: 'desc' },
      }),
      this.prisma.sysNotice.count({ where }),
    ]);

    return ResultData.ok({
      rows: FormatDateFields(list),
      total,
    });
  }

  async findOne(noticeId: number) {
    const data = await this.prisma.sysNotice.findUnique({
      where: {
        noticeId,
      },
    });
    return ResultData.ok(data);
  }

  async update(updateNoticeDto: UpdateNoticeDto) {
    await this.prisma.sysNotice.update({
      where: {
        noticeId: updateNoticeDto.noticeId,
      },
      data: updateNoticeDto,
    });
    return ResultData.ok();
  }

  async remove(noticeIds: number[]) {
    const data = await this.prisma.sysNotice.updateMany({
      where: {
        noticeId: {
          in: noticeIds,
        },
      },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data.count);
  }
}
