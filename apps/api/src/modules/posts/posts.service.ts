import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { UpdatePostDto } from './dto/update-post.dto';

import { type IStorageProvider } from '@/common/providers/storage/storage.interface';
import { buildWhereClause } from '@/common/utils/filter.util';
import { paginate } from '@/common/utils/paginate.util';
import { Prisma } from '@/db/generated/prisma/client';
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

  async findAll(query: PostQueryDto) {
    const { minTargetAmount, maxTargetAmount, ...filterQuery } = query;

    const where: Prisma.LumisPostWhereInput = buildWhereClause(filterQuery, {
      title: 'contains',
    });

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
          medias: true,
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
        proofs: true,
        bankDetails: true,
        medias: true,
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
    try {
      return await this.prisma.lumisPost.update({
        where: { id },
        data,
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
    } catch (_error) {
      return { url: proof.media.url };
    }
  }
}
