import { Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateReportDto,
  ReportQueryDto,
  UpdateReportStatusDto,
} from './dto/report.dto';

import { buildWhereClause } from '@/common/utils/filter.util';
import { paginate } from '@/common/utils/paginate.util';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, data: CreateReportDto) {
    // Kiểm tra xem target có tồn tại không
    await this.validateTarget(data.targetId, data.targetType);

    return this.prisma.report.create({
      data: {
        ...data,
        reporterId,
        status: 'PENDING',
      },
    });
  }

  async findAll(query: ReportQueryDto) {
    const where = buildWhereClause(query);

    return paginate(
      this.prisma.report,
      {
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );
  }

  async updateStatus(id: string, data: UpdateReportStatusDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Báo cáo không tồn tại');

    const updatedReport = await this.prisma.report.update({
      where: { id },
      data: {
        status: data.status,
        adminNote: data.adminNote,
      },
    });

    // Nếu report được chấp nhận (RESOLVED) và target là POST, có thể thực hiện tự động ẩn bài viết nếu cần
    if (data.status === 'RESOLVED' && report.targetType === 'POST') {
      const reportCount = await this.prisma.report.count({
        where: {
          targetId: report.targetId,
          targetType: 'POST',
          status: 'RESOLVED',
        },
      });

      // Ví dụ: Nếu có 3 báo cáo được xác nhận, tự động SUSPEND bài viết
      if (reportCount >= 3) {
        await this.prisma.lumisPost.update({
          where: { id: report.targetId },
          data: { status: 'SUSPENDED' },
        });
      }
    }

    return updatedReport;
  }

  private async validateTarget(targetId: string, targetType: string) {
    let exists = false;
    switch (targetType) {
      case 'POST':
        exists = !!(await this.prisma.lumisPost.findUnique({
          where: { id: targetId },
        }));
        break;
      case 'COMMENT':
        exists = !!(await this.prisma.comment.findUnique({
          where: { id: targetId },
        }));
        break;
      case 'USER':
        exists = !!(await this.prisma.user.findUnique({
          where: { id: targetId },
        }));
        break;
    }
    if (!exists)
      throw new NotFoundException(
        `Đối tượng báo cáo (${targetType}) không tồn tại`,
      );
  }
}
