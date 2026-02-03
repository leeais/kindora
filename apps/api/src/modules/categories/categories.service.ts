import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { CategoryQueryDto } from './dto/category-query.dto';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/create-category.dto';

import { paginate } from '@/common/utils/paginate.util';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictException('Slug danh mục đã tồn tại');
    }

    return this.prisma.category.create({ data });
  }

  async findAll(query: CategoryQueryDto) {
    return paginate(
      this.prisma.category,
      {},
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy || 'name',
        sortOrder: query.sortOrder || 'asc',
      },
    );
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Danh mục không tồn tại');
    return category;
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.findOne(id);
    if (data.slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });
      if (existing) throw new ConflictException('Slug danh mục đã tồn tại');
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
