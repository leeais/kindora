import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateDonationDto } from './dto/create-donation.dto';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { paginate } from '@/common/utils/paginate.util';
import { PostStatus } from '@/db/generated/prisma/client';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

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

    // 2. Tạo record Donation
    // Lưu ý: Status mặc định là PENDING (do schema)
    const donation = await this.prisma.donation.create({
      data: {
        amount,
        isAnonymous,
        donorId: userId,
        postId,
      },
      include: {
        post: {
          select: {
            title: true,
          },
        },
      },
    });

    return donation;
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
