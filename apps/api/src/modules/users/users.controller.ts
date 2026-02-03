import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  forwardRef,
  Inject,
  ParseUUIDPipe,
} from '@nestjs/common';


import { AuthService } from './auth/auth.service';
import { Roles } from './auth/decorators/roles.decorator';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { EmailVerifiedGuard } from './auth/guards/email-verified.guard';
import { OwnershipGuard } from './auth/guards/ownership.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UsersService } from './users.service';

import type { Request } from 'express';

import { UserRole } from '@/db/generated/prisma/client';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    await this.authService.generateVerificationCode(
      user.id,
      user.email,
      'SIGNUP',
    );
    return user;
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userPayload = req.user as { userId?: string };
    if (!userPayload || !userPayload.userId)
      throw new UnauthorizedException('Không tìm thấy người dùng');

    const user = await this.usersService.findOne(userPayload.userId);
    if (!user) throw new UnauthorizedException('Người dùng không tồn tại');

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard, EmailVerifiedGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.usersService.update(id, updateRoleDto);
  }
}
