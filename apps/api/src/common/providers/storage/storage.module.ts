import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { S3StorageProvider } from './s3-storage.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IStorageProvider',
      useClass: S3StorageProvider,
    },
  ],
  exports: ['IStorageProvider'],
})
export class StorageModule {}
