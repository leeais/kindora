import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import sharp from 'sharp';

import type { IStorageProvider } from '@/common/providers/storage/storage.interface';
import type { Queue } from 'bull';

import { PrismaService } from '@/db/prisma.service';
import { QUEUE_NAMES } from '@/modules/shared/queue/queue.constants';

@Injectable()
export class UploadService {
  constructor(
    @Inject('IStorageProvider')
    private readonly storageProvider: IStorageProvider,
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.VIDEO_PROCESSING)
    private readonly videoQueue: Queue,
  ) {}

  async processImage(file: Express.Multer.File, userId: string) {
    this.validateFile(file);

    // 1. Tối ưu ảnh gốc (WebP, Max 1920px)
    const optimizedBuffer = await sharp(file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const metadata = await sharp(optimizedBuffer).metadata();

    // 2. Tạo Thumbnail (WebP, 400px)
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 70 })
      .toBuffer();

    // 3. Upload lên Storage
    const originalUpload = await this.storageProvider.upload(
      {
        fileName: `${Date.now()}-original.webp`,
        buffer: optimizedBuffer,
        mimetype: 'image/webp',
        size: optimizedBuffer.length,
      },
      'images',
    );

    const thumbnailUpload = await this.storageProvider.upload(
      {
        fileName: `${Date.now()}-thumb.webp`,
        buffer: thumbnailBuffer,
        mimetype: 'image/webp',
        size: thumbnailBuffer.length,
      },
      'thumbnails',
    );

    // 4. Lưu vào Database
    return this.prisma.postMedia.create({
      data: {
        url: originalUpload.url,
        thumbnailUrl: thumbnailUpload.url,
        type: 'IMAGE',
        userId: userId,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          size: optimizedBuffer.length,
          format: 'webp',
        },
      },
    });
  }

  async processVideo(file: Express.Multer.File, userId: string) {
    this.validateFile(file);

    // 1. Upload file gốc (mp4) lên MinIO để lưu trữ
    const originalUpload = await this.storageProvider.upload(
      {
        fileName: `${Date.now()}-${file.originalname}`,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      },
      'videos/raw',
    );

    // 2. Tạo record với trạng thái PROCESSING
    const media = await this.prisma.postMedia.create({
      data: {
        url: originalUpload.url,
        type: 'VIDEO',
        userId: userId,
        metadata: { status: 'PROCESSING' },
      },
    });

    // 3. Đẩy vào hàng đợi xử lý streaming (HLS)
    // Lưu ý: Vì xử lý local, ta giả định worker có quyền truy cập file buffer hoặc upload id
    await this.videoQueue.add(
      'transcode',
      {
        fileId: media.id,
        videoUrl: originalUpload.url,
        userId: userId,
      },
      {
        attempts: 3, // Thử lại tối đa 3 lần nếu lỗi
        backoff: {
          type: 'exponential',
          delay: 5000, // Lần đầu đợi 5s, sau đó tăng dần
        },
        removeOnComplete: true, // Xóa khỏi Redis khi xong để tiết kiệm tài nguyên
        removeOnFail: false, // Giữ lại nếu lỗi để Senior còn vào debug
      },
    );

    return media;
  }

  validateFile(file: Express.Multer.File) {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (!isImage && !isVideo) {
      throw new BadRequestException('Chỉ cho phép hình ảnh và video.');
    }
  }
}
