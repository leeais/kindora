
import {
  S3Client,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IStorageProvider,
  StorageFile,
  UploadResult,
} from './storage.interface';

@Injectable()
export class R2StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;
  private logger = new Logger(R2StorageProvider.name);

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('R2_SECRET_KEY');
    this.bucket = this.configService.get<string>('R2_BUCKET_NAME') || 'kindora';

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.warn(
        'R2 configuration is missing. Check R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY in .env',
      );
    }

    // Cloudflare R2 uses HTTPS by default
    this.client = new S3Client({
      endpoint: `https://${endpoint}`,
      region: 'auto',
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        try {
          await this.client.send(
            new CreateBucketCommand({ Bucket: this.bucket }),
          );
          this.logger.log(`Created R2 bucket: ${this.bucket}`);
        } catch (createError) {
          this.logger.warn(
            `Failed to create R2 bucket "${this.bucket}". Proceeding assuming it exists or handled externally. Error: ${createError.message}`,
          );
        }
      }
    }
  }

  async upload(
    file: StorageFile,
    folder = 'uploads',
    options?: { preserveFileName?: boolean },
  ): Promise<UploadResult> {
    const fileName = file.fileName.replace(/\s+/g, '-');
    const key = options?.preserveFileName
      ? `${folder}/${fileName}`
      : `${folder}/${Date.now()}-${fileName}`;

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    await upload.done();

    // R2 Public Access URL
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL');
    if (!publicUrl) {
      this.logger.warn(
        'R2_PUBLIC_URL is not configured. Returning S3 signed URL might be necessary, or public access is disabled.',
      );
      // Fallback or just return key if public url is critical but missing
    }

    const baseUrl = publicUrl ? publicUrl.replace(/\/$/, '') : '';
    const url = baseUrl ? `${baseUrl}/${key}` : key;

    return { url, key };
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete object ${key}: ${error.message}`);
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: 900 }); // 15 mins
  }
}
