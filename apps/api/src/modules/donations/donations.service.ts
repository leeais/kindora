import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateDonationDto } from './dto/create-donation.dto';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaymentService } from '@/common/providers/payment/payment.service';
import { paginate } from '@/common/utils/paginate.util';
import { PostStatus } from '@/db/generated/prisma/client';
import { PrismaService } from '@/db/prisma.service';

@Injectable()
export class DonationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async create(userId: string, data: CreateDonationDto) {
    const { postId, amount, isAnonymous } = data;

    // 1. Kiểm tra bài đăng tồn tại và hợp lệ
    const post = await this.prisma.lumisPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Bài đăng với ID "${postId}" không tồn tại`);
    }

    // Chỉ cho phép quyên góp cho bài viết đã được duyệt hoặc đang mở
    const allowedStatuses: string[] = [PostStatus.ACCEPTED, PostStatus.OPEN];
    if (!allowedStatuses.includes(post.status)) {
      throw new BadRequestException(
        'Bài đăng này hiện không nhận quyên góp (Status: ' + post.status + ')',
      );
    }

    // 2. Kiểm tra số tiền quyên góp có vượt quá hạn mức không
    const currentTotal = Number(post.supportReceived);
    const target = Number(post.targetAmount);

    if (currentTotal >= target) {
      throw new BadRequestException(
        'Bài viết này đã đạt đủ số tiền mục tiêu. Cảm ơn tấm lòng của bạn!',
      );
    }

    // 3. Tạo record Donation với Status PENDING
    const donation = await this.prisma.donation.create({
      data: {
        amount,
        isAnonymous,
        donorId: userId,
        postId,
        status: 'PENDING',
      },
      include: {
        post: {
          select: { title: true },
        },
      },
    });

    // 4. Tạo QR Code thanh toán
    // Memo: KINDORA <DONATION_ID>
    const content = `KINDORA ${donation.id.split('-')[0].toUpperCase()}`; // Lấy phần đầu UUID cho ngắn gọn
    const qrUrl = await this.paymentService.generateQrUrl(
      Number(amount),
      content,
    );

    return {
      ...donation,
      qrUrl,
    };
  }

  async confirm(donationId: string) {
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
      include: { post: true },
    });

    if (!donation) {
      throw new NotFoundException(`Donation not found`);
    }

    if (donation.status === 'SUCCESS') {
      return donation; // Idempotent
    }

    // Thực hiện Transaction: Update Status + Update Post Support + Check Auto Close
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update Donation Status
      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: { status: 'SUCCESS' },
      });

      // 2. Update Post SupportReceived
      const updatedPost = await tx.lumisPost.update({
        where: { id: donation.postId },
        data: {
          supportReceived: {
            increment: donation.amount,
          },
        },
      });

      // 3. Auto Close Post if Target Reached
      if (
        Number(updatedPost.supportReceived) >= Number(updatedPost.targetAmount)
      ) {
        await tx.lumisPost.update({
          where: { id: donation.postId },
          data: { status: PostStatus.COMPLETED },
        });

        // Gửi thông báo cho Author
        await tx.notification.create({
          data: {
            userId: updatedPost.authorId,
            title: 'Bài viết đã đạt mục tiêu quyên góp!',
            content: `Chúc mừng! Bài viết "${updatedPost.title}" của bạn đã nhận đủ ${updatedPost.supportReceived} ${updatedPost.currency}. Vui lòng chuẩn bị các bước trao quà tiếp theo.`,
            type: 'POST_GOAL_ACHIEVED',
            metadata: { postId: updatedPost.id },
          },
        });
      }

      return updatedDonation;
    });

    return result;
  }

  async findAllByUser(userId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;

    return paginate(
      this.prisma.donation,
      {
        where: { donorId: userId },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              status: true,
              targetAmount: true,
              supportReceived: true,
              currency: true,
              medias: {
                take: 1, // Lấy 1 ảnh làm thumbnail
                select: { url: true, type: true },
              },
            },
          },
        },
      },
      {
        page,
        limit,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
      },
    );
  }

  async findAllByPost(postId: string, query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;

    const result = await paginate(
      this.prisma.donation,
      {
        where: {
          postId,
          status: 'SUCCESS', // Chỉ hiển thị các giao dịch thành công
        },
        include: {
          donor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
      {
        page,
        limit,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
      },
    );

    // Ẩn thông tin nếu là ẩn danh
    result.data = result.data.map((donation) => {
      if (donation.isAnonymous) {
        return {
          ...donation,
          donor: null, // Ẩn thông tin người ủng hộ
        };
      }
      return donation;
    });

    return result;
  }
}
