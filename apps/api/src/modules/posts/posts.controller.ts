import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

import { AuditLog } from '@/modules/shared/audit-log/audit-log.decorator';
import { AuditLogInterceptor } from '@/modules/shared/audit-log/audit-log.interceptor';
import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { EmailVerifiedGuard } from '@/modules/users/auth/guards/email-verified.guard';
import { OwnershipGuard } from '@/modules/users/auth/guards/ownership.guard';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
@UseInterceptors(AuditLogInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @AuditLog('CREATE_POST')
  create(
    @CurrentUser() user: Express.User,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(user.userId, createPostDto);
  }

  @Get()
  findAll(@Query() query: PostQueryDto, @CurrentUser() user?: Express.User) {
    return this.postsService.findAll(query, user?.userId, user?.activeContext);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard, OwnershipGuard)
  @AuditLog('UPDATE_POST')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @AuditLog('DELETE_POST')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @AuditLog('TOGGLE_LIKE')
  toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: Express.User,
  ) {
    return this.postsService.toggleLike(user.userId, id);
  }
}
