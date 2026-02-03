import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { EmailVerifiedGuard } from '@/modules/users/auth/guards/email-verified.guard';


@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  create(
    @CurrentUser() user: Express.User,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(user.userId, createCommentDto);
  }

  @Get('post/:id')
  findByPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CommentQueryDto,
  ) {
    return this.commentsService.findByPost(id, query);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @CurrentUser() user: Express.User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commentsService.remove(user.userId, id);
  }
}
