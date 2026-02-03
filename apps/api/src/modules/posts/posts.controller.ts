import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';


import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { CurrentUser } from '../users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../users/auth/guards/auth.guard';
import { EmailVerifiedGuard } from '../users/auth/guards/email-verified.guard';

import { OwnershipGuard } from '@/modules/users/auth/guards/ownership.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  create(
    @CurrentUser() user: Express.User,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(user.userId, createPostDto);
  }

  @Get()
  findAll(@Query() query: PostQueryDto) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard, OwnershipGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: Express.User,
  ) {
    return this.postsService.toggleLike(user.userId, id);
  }
}
