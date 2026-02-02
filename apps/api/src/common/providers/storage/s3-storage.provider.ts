import {
  S3Client,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  IStorageProvider,
  StorageFile,
  UploadResult,
} from './storage.interface';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor(private configService: ConfigService) {
    this.endpoint =
      this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    this.bucket =
      this.configService.get<string>('MINIO_BUCKET_NAME') || 'kindora-media';

    this.client = new S3Client({
      endpoint: `http://${this.endpoint}:${this.configService.get('MINIO_PORT')}`,
      forcePathStyle: true, // Quan trọng khi dùng MinIO
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ACCESS_KEY') || '',
        secretAccessKey:
          this.configService.get<string>('MINIO_SECRET_KEY') || '',
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
        } catch (createError) {
          console.error(
            `❌ Failed to create bucket "${this.bucket}":`,
            createError,
          );
        }
      }
    }

    // Luôn đảm bảo policy được thiết lập (quan trọng nếu bucket đã tồn tại nhưng chưa có policy)
    await this.setBucketPolicy();
  }

  private async setBucketPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };

    try {
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify(policy),
        }),
      );
    } catch (error) {
      console.error(
        `❌ Failed to set policy for bucket "${this.bucket}":`,
        error,
      );
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

    // URL trực tiếp tới MinIO (trong dev dùng localhost)
    const url = `http://${this.endpoint}:${this.configService.get('MINIO_PORT')}/${this.bucket}/${key}`;

    return { url, key };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getSignedUrl(key: string): Promise<string> {
    return `http://${this.endpoint}:${this.configService.get('MINIO_PORT')}/${this.bucket}/${key}`;
  }
}
