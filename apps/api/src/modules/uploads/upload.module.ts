import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { VideoProcessor } from './video.processor';

import { S3StorageProvider } from '@/common/providers/storage/s3-storage.provider';
import { QUEUE_NAMES } from '@/modules/shared/queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAMES.VIDEO_PROCESSING,
    }),
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    VideoProcessor,
    {
      provide: 'IStorageProvider',
      useClass: S3StorageProvider,
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
