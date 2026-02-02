import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

import { buildWhereClause } from '@/common/utils/filter.util';
import { paginate } from '@/common/utils/paginate.util';
import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmailOrUsername(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      include: { socialAccounts: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { socialAccounts: true },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { socialAccounts: true },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
      include: { socialAccounts: true },
    });
  }

  findAll(query: UserQueryDto) {
    const where = buildWhereClause(query, {
      name: 'contains',
      email: 'contains',
    });

    if (query.search) {
      where['OR'] = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return paginate(
      this.prisma.user,
      { where },
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { socialAccounts: true },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
