import { Injectable, NotFoundException, Logger } from '@nestjs/common';

import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsGateway } from './notifications.gateway';

import { paginate } from '@/common/utils/paginate.util';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(data: {
    userId: string;
    title: string;
    content: string;
    type: string;
    metadata?: Record<string, any>;
  }) {
    const notification = await this.prisma.notification.create({
      data,
    });

    // Emit socket event real-time
    try {
      this.gateway.sendToUser(data.userId, 'new_notification', notification);
    } catch (error) {
      this.logger.error(
        `Failed to emit real-time notification: ${error.message}`,
      );
    }

    return notification;
  }

  async findAll(userId: string, query: NotificationQueryDto) {
    const where: any = { userId };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return paginate(
      this.prisma.notification,
      { where },
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Thông báo không tồn tại');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
