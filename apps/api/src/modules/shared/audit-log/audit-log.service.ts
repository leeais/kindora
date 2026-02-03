import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/db/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    action: string;
    actorId: string;
    targetId?: string;
    targetType?: string;
    payload?: any;
  }) {
    return this.prisma.auditLog.create({
      data: data as any,
    });
  }

  async getLogs(query: {
    actorId?: string;
    targetType?: string;
    targetId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { limit = 10, offset = 0, ...where } = query;
    return this.prisma.auditLog.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }
}
