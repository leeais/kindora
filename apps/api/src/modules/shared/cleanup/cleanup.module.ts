import { Module } from '@nestjs/common';

import { MediaCleanupService } from './media-cleanup.service';

import { StorageModule } from '@/common/providers/storage/storage.module';


@Module({
  imports: [StorageModule],
  providers: [MediaCleanupService],
  exports: [MediaCleanupService],
})
export class CleanupModule {}
