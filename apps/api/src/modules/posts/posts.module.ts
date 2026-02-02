import { Module } from '@nestjs/common';


import { AdminPostsController } from './admin-posts.controller';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

import { StorageModule } from '@/common/providers/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [PostsController, AdminPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
