import { Injectable, NotFoundException } from '@nestjs/common';

import { NotificationsService } from '../notifications/notifications.service';
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
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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

    const paginatedReports = await paginate(
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
              avatar: true,
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

    // Gắn thêm thông tin target rút gọn cho mỗi report
    const reportsWithTargets = await Promise.all(
      paginatedReports.data.map(async (report) => ({
        ...report,
        target: await this.getTargetBrief(report.targetId, report.targetType),
      })),
    );

    return { ...paginatedReports, data: reportsWithTargets };
  }

  async findMyReports(userId: string, query: ReportQueryDto) {
    const where = buildWhereClause(query);
    where.reporterId = userId;

    return paginate(
      this.prisma.report,
      {
        where,
      },
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
      },
    });

    if (!report) throw new NotFoundException('Báo cáo không tồn tại');

    // Lấy thông tin chi tiết của target
    const target = await this.getTargetDetails(
      report.targetId,
      report.targetType,
    );

    return { ...report, target };
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

    // Gửi thông báo cho người báo cáo
    await this.notificationsService.create({
      userId: report.reporterId,
      title: 'Cập nhật trạng thái báo cáo',
      content: `Báo cáo của bạn về ${report.targetType} đã được ${data.status === 'RESOLVED' ? 'xử lý' : 'từ chối'}. ${data.adminNote ? `Ghi chú từ admin: ${data.adminNote}` : ''}`,
      type: 'REPORT_STATUS',
      metadata: { reportId: id, status: data.status },
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

      // Nếu có 3 báo cáo được xác nhận, tự động SUSPEND bài viết
      if (reportCount >= 3) {
        await this.prisma.lumisPost.update({
          where: { id: report.targetId },
          data: { status: 'SUSPENDED' },
        });

        // Gửi thông báo cho chủ bài viết (author)
        const post = await this.prisma.lumisPost.findUnique({
          where: { id: report.targetId },
          select: { authorId: true, title: true },
        });
        if (post) {
          await this.notificationsService.create({
            userId: post.authorId,
            title: 'Bài viết bị tạm khóa',
            content: `Bài viết "${post.title}" của bạn đã bị tạm khóa do nhận được nhiều báo cáo vi phạm.`,
            type: 'POST_SUSPENDED',
            metadata: { postId: report.targetId },
          });
        }
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

  private async getTargetBrief(targetId: string, targetType: string) {
    switch (targetType) {
      case 'POST':
        return this.prisma.lumisPost.findUnique({
          where: { id: targetId },
          select: { id: true, title: true },
        });
      case 'COMMENT':
        return this.prisma.comment.findUnique({
          where: { id: targetId },
          select: { id: true, content: true },
        });
      case 'USER':
        return this.prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true, username: true },
        });
    }
  }

  private async getTargetDetails(targetId: string, targetType: string) {
    switch (targetType) {
      case 'POST':
        return this.prisma.lumisPost.findUnique({
          where: { id: targetId },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      case 'COMMENT':
        return this.prisma.comment.findUnique({
          where: { id: targetId },
          include: {
            user: {
              select: { id: true, username: true },
            },
            post: {
              select: { id: true, title: true },
            },
          },
        });
      case 'USER':
        return this.prisma.user.findUnique({
          where: { id: targetId },
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            createdAt: true,
          },
        });
    }
  }
}
