import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';


import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { VideoProcessor } from './video.processor';

import { StorageModule } from '@/common/providers/storage/storage.module';
import { QUEUE_NAMES } from '@/modules/shared/queue/queue.constants';

@Module({
  imports: [
    StorageModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.VIDEO_PROCESSING,
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, VideoProcessor],
  exports: [UploadService],
})
export class UploadModule {}
