import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

import { paginate } from '@/common/utils/paginate.util';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateCommentDto) {
    const { postId, parentId, content } = data;

    // Kiểm tra post tồn tại
    const post = await this.prisma.lumisPost.findUnique({
      where: { id: postId },
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    // Nếu là reply, kiểm tra parent comment tồn tại
    if (parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parent) throw new NotFoundException('Bình luận cha không tồn tại');
    }

    return this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByPost(postId: string, query: CommentQueryDto) {
    return paginate(
      this.prisma.comment,
      {
        where: { postId, parentId: null }, // Lấy bình luận gốc trước
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              user: {
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
          _count: {
            select: {
              replies: true,
            },
          },
        },
      },
      {
        page: query.page,
        limit: query.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    );
  }

  async remove(userId: string, id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    // Chỉ người dùng tạo bình luận hoặc Admin mới được xóa (Admin check sẽ ở Controller hoặc thêm vào đây)
    if (comment.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
