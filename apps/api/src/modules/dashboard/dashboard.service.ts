import { Injectable } from '@nestjs/common';

import { PostStatus } from '@/db/generated/prisma/client';
import { PrismaService } from '@/db/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminStats() {
    const [
      totalUsers,
      totalPosts,
      totalDonations,
      pendingPosts,
      successDonationsAmount,
      pendingDonationsAmount,
      deliveredPostAmount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lumisPost.count(),
      this.prisma.donation.count(),
      this.prisma.lumisPost.count({ where: { status: PostStatus.PENDING } }),
      this.prisma.donation.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.lumisPost.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { supportReceived: true },
      }),
    ]);

    const totalAmountRaised = successDonationsAmount._sum.amount || 0;
    const disbursedAmount = deliveredPostAmount._sum.supportReceived || 0;

    return {
      totalUsers,
      totalPosts,
      totalDonations,
      pendingPosts,
      totalAmountRaised,
      pendingDonationsAmount: pendingDonationsAmount._sum.amount || 0,
      disbursedAmount,
      inStockAmount: Number(totalAmountRaised) - Number(disbursedAmount),
    };
  }

  async getUserStats(userId: string) {
    const [
      myPostsCount,
      myDonationsCount,
      totalDonatedAmount,
      totalReceivedAmount,
    ] = await Promise.all([
      this.prisma.lumisPost.count({ where: { authorId: userId } }),
      this.prisma.donation.count({
        where: { donorId: userId, status: 'SUCCESS' },
      }),
      this.prisma.donation.aggregate({
        where: { donorId: userId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.lumisPost.aggregate({
        where: { authorId: userId },
        _sum: { supportReceived: true },
      }),
    ]);

    return {
      myPostsCount,
      myDonationsCount,
      totalDonatedAmount: totalDonatedAmount._sum.amount || 0,
      totalReceivedAmount: totalReceivedAmount._sum.supportReceived || 0,
    };
  }
}
