import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateReportDto } from './dto/create-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';

import { paginate } from '@/common/utils/paginate.util';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, data: CreateReportDto) {
    const { targetId, targetType, reason, details } = data;

    // Kiểm tra target tồn tại (tùy chọn, tùy vào hiệu suất)
    // Ở đây tôi sẽ cứ tạo report, Admin sẽ kiểm tra sau

    return this.prisma.report.create({
      data: {
        reason,
        details,
        targetId,
        targetType,
        reporterId,
        status: 'PENDING',
      },
    });
  }

  async findAll(query: ReportQueryDto) {
    return paginate(
      this.prisma.report,
      {
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy || 'createdAt',
        sortOrder: query.sortOrder || 'desc',
      },
    );
  }

  async resolve(id: string, status: 'RESOLVED' | 'REJECTED') {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) throw new NotFoundException('Khiếu nại không tồn tại');

    return this.prisma.report.update({
      where: { id },
      data: { status },
    });
  }
}
