import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PostsService } from './posts.service';

import { UserRole } from '@/db/generated/prisma/client';
import { Roles } from '@/modules/users/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/users/auth/guards/roles.guard';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostStatusDto: UpdatePostStatusDto,
  ) {
    return this.postsService.updateStatus(id, updatePostStatusDto);
  }
  @Get('proofs/:id/view')
  async getProofUrl(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.getProofUrl(id);
  }
}
