import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { UpdatePostDto } from './dto/update-post.dto';

import { type IStorageProvider } from '@/common/providers/storage/storage.interface';
import { buildWhereClause } from '@/common/utils/filter.util';
import { paginate } from '@/common/utils/paginate.util';
import { PostStatus, Prisma, UserContext } from '@/db/generated/prisma/client';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    @Inject('IStorageProvider')
    private readonly storageProvider: IStorageProvider,
  ) {}

  async create(authorId: string, data: CreatePostDto) {
    const { mediaIds, proofs, bankDetails, ...postData } = data;

    return this.prisma.lumisPost.create({
      data: {
        ...postData,
        authorId,
        status: 'PENDING', // Bài viết mới tạo luôn ở trạng thái chờ duyệt
        medias: mediaIds
          ? {
              connect: mediaIds.map((id) => ({ id })),
            }
          : undefined,
        proofs: proofs
          ? {
              create: proofs,
            }
          : undefined,
        bankDetails: bankDetails
          ? {
              create: [bankDetails], // BankDetail[] trong schema
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        medias: true,
        proofs: true,
        bankDetails: true,
      },
    });
  }

  async findAll(
    query: PostQueryDto,
    userId?: string,
    activeContext?: UserContext,
  ) {
    const { minTargetAmount, maxTargetAmount, ...filterQuery } = query;

    const where: Prisma.LumisPostWhereInput = buildWhereClause(filterQuery, {
      title: 'contains',
    });

    // Logic Context:
    if (activeContext === 'LUMIS' && userId) {
      // Lumis: Chỉ xem bài của chính mình (mọi trạng thái)
      where.authorId = userId;
    } else {
      // Kindora / Guest: Chỉ xem bài viết công khai (ACCEPTED, OPEN, COMPLETED...)
      // Trừ khi query user muốn lọc status cụ thể (nhưng vẫn phải nằm trong public scope)
      // Để đơn giản hóa, nếu không có status cụ thể, ta force public status.
      if (!where.status) {
        where.status = {
          in: [
            PostStatus.ACCEPTED,
            PostStatus.OPEN,
            PostStatus.COMPLETED,
            PostStatus.DELIVERED,
            PostStatus.CLOSED,
          ],
        };
      }
    }

    if (minTargetAmount) {
      where.targetAmount = {
        ...(where.targetAmount as Prisma.DecimalFilter),
        gte: minTargetAmount,
      };
    }

    if (maxTargetAmount) {
      where.targetAmount = {
        ...(where.targetAmount as Prisma.DecimalFilter),
        lte: maxTargetAmount,
      };
    }

    if (query.isUrgent !== undefined) {
      where.isUrgent = query.isUrgent;
    }

    if (query.search) {
      where['OR'] = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return paginate(
      this.prisma.lumisPost,
      {
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
          medias: true,
          _count: {
            select: {
              likes: true,
              comments: true,
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

  async findOne(id: string) {
    const post = await this.prisma.lumisPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        proofs: true,
        bankDetails: true,
        medias: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Bài đăng với ID "${id}" không tồn tại`);
    }

    return post;
  }

  async update(id: string, data: UpdatePostDto) {
    const { mediaIds, proofs, bankDetails, ...postData } = data;

    try {
      return await this.prisma.lumisPost.update({
        where: { id },
        data: {
          ...postData,
          medias: mediaIds
            ? {
                set: [], // Gỡ bỏ các link cũ
                connect: mediaIds.map((id) => ({ id })),
              }
            : undefined,
          proofs: proofs
            ? {
                deleteMany: {}, // Xóa minh chứng cũ
                create: proofs, // Tạo minh chứng mới
              }
            : undefined,
          bankDetails: bankDetails
            ? {
                deleteMany: {}, // Xóa thông tin ngân hàng cũ
                create: [bankDetails], // Tạo thông tin mới
              }
            : undefined,
        },
        include: {
          medias: true,
          proofs: true,
          bankDetails: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Bài đăng với ID "${id}" không tồn tại`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.lumisPost.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Bài đăng với ID "${id}" không tồn tại`);
      }
      throw error;
    }
  }

  async updateStatus(id: string, data: UpdatePostStatusDto) {
    const post = await this.prisma.lumisPost.findUnique({
      where: { id },
      select: { status: true, title: true, authorId: true, id: true },
    });

    if (!post) {
      throw new NotFoundException(`Bài đăng với ID "${id}" không tồn tại`);
    }

    // Kiểm tra tính hợp lệ của việc chuyển đổi trạng thái
    this.validateStatusTransition(post.status, data.status);

    const updatedPost = await this.prisma.lumisPost.update({
      where: { id },
      data,
    });

    // Gửi thông báo cho tác giả bài viết
    let title = 'Cập nhật trạng thái bài viết';
    let content = `Bài viết "${updatedPost.title}" của bạn đã chuyển sang trạng thái ${updatedPost.status}.`;
    const type = 'POST_STATUS_UPDATED';

    if (updatedPost.status === 'ACCEPTED') {
      title = 'Bài viết đã được duyệt!';
      content = `Chúc mừng! Bài viết "${updatedPost.title}" đã được duyệt và bắt đầu nhận quyên góp.`;
    } else if (updatedPost.status === 'REJECTED') {
      title = 'Bài viết bị từ chối';
      content = `Rất tiếc, bài viết "${updatedPost.title}" không được duyệt. Lý do: ${updatedPost.adminComments || 'Vui lòng kiểm tra lại nội dung.'}`;
    }

    await this.prisma.notification.create({
      data: {
        userId: updatedPost.authorId,
        title,
        content,
        type,
        metadata: { postId: updatedPost.id, status: updatedPost.status },
      },
    });

    return updatedPost;
  }

  private validateStatusTransition(
    currentStatus: PostStatus,
    nextStatus: PostStatus,
  ) {
    if (currentStatus === nextStatus) return;

    const validTransitions: Record<PostStatus, PostStatus[]> = {
      DRAFT: [PostStatus.PENDING],
      PENDING: [PostStatus.ACCEPTED, PostStatus.REJECTED],
      ACCEPTED: [
        PostStatus.OPEN,
        PostStatus.COMPLETED,
        PostStatus.SUSPENDED,
        PostStatus.REJECTED_AFTER_REPORT,
      ],
      REJECTED: [PostStatus.PENDING], // Có thể cho phép gửi lại sau khi sửa
      OPEN: [
        PostStatus.COMPLETED,
        PostStatus.SUSPENDED,
        PostStatus.REJECTED_AFTER_REPORT,
      ],
      SUSPENDED: [PostStatus.ACCEPTED, PostStatus.OPEN, PostStatus.COMPLETED],
      REJECTED_AFTER_REPORT: [], // Bị khóa vĩnh viễn
      COMPLETED: [PostStatus.DELIVERED, PostStatus.SUSPENDED],
      DELIVERED: [PostStatus.CLOSED],
      CLOSED: [],
    };

    const allowed = validTransitions[currentStatus];
    if (!allowed || !allowed.includes(nextStatus)) {
      throw new Error(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${nextStatus}`,
      );
    }
  }
  async updateUrgent(id: string, isUrgent: boolean) {
    try {
      return await this.prisma.lumisPost.update({
        where: { id },
        data: { isUrgent },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Bài đăng với ID "${id}" không tồn tại`);
      }
      throw error;
    }
  }

  async getProofUrl(id: string) {
    const proof = await this.prisma.proofDocument.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!proof) {
      throw new NotFoundException(`Minh chứng với ID "${id}" không tồn tại`);
    }

    try {
      const urlObj = new URL(proof.media.url);
      const pathParts = urlObj.pathname.split('/');
      // pathParts[0] is empty, pathParts[1] is bucket
      const key = pathParts.slice(2).join('/');
      const url = await this.storageProvider.getSignedUrl(key);
      return { url };
    } catch {
      return { url: proof.media.url };
    }
  }

  async toggleLike(userId: string, postId: string) {
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    }

    await this.prisma.postLike.create({
      data: {
        userId,
        postId,
      },
    });
    return { liked: true };
  }

  async createDelivery(postId: string, data: CreateDeliveryDto) {
    const { content, mediaIds } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Tạo PostUpdate loại DELIVERY
      const postUpdate = await tx.postUpdate.create({
        data: {
          content,
          type: 'DELIVERY',
          postId,
          medias: {
            connect: mediaIds.map((id: string) => ({ id })),
          },
        },
      });

      // 2. Cập nhật trạng thái bài viết sang DELIVERED
      await tx.lumisPost.update({
        where: { id: postId },
        data: { status: 'DELIVERED' },
      });

      // 3. Lấy danh sách donors của bài viết này để thông báo
      const donors = await tx.donation.findMany({
        where: { postId, status: 'SUCCESS' },
        distinct: ['donorId'],
        select: { donorId: true },
      });

      // 4. Gửi thông báo cho từng donor
      for (const donor of donors) {
        await tx.notification.create({
          data: {
            userId: donor.donorId,
            title: 'Hệ thống đã trao tặng thành công!',
            content: `Bài viết bạn đóng góp đã được hệ thống trao tặng trực tiếp. Xem bằng chứng ngay!`,
            type: 'DELIVERY_SUCCESS',
            metadata: { postId, updateId: postUpdate.id },
          },
        });
      }

      return postUpdate;
    });
  }
}
