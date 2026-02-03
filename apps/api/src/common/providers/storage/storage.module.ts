import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { R2StorageProvider } from './r2-storage.provider';
import { S3StorageProvider } from './s3-storage.provider';

const storageProvider: Provider = {
  provide: 'IStorageProvider',
  useFactory: (configService: ConfigService) => {
    const driver = configService.get<string>('STORAGE_DRIVER');
    if (driver === 'r2') {
      return new R2StorageProvider(configService);
    }
    return new S3StorageProvider(configService);
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule],
  providers: [storageProvider],
  exports: ['IStorageProvider'],
})
export class StorageModule {}
