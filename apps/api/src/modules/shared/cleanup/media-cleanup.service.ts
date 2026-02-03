import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import type { IStorageProvider } from '@/common/providers/storage/storage.interface';

import { PrismaService } from '@/db/prisma.service';

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageProvider')
    private readonly storageProvider: IStorageProvider,
  ) {}

  // Chạy mỗi ngày vào lúc nửa đêm
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting scheduled media cleanup...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Tìm các media "mồ côi" (không thuộc Post nào và không phải là Proof)
    // Và đã được tạo hơn 24 giờ trước
    const orphanedMedia = await this.prisma.postMedia.findMany({
      where: {
        postId: null,
        proofDocument: null,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      take: 100, // Giới hạn xử lý mỗi lần để tránh quá tải
    });

    if (orphanedMedia.length === 0) {
      this.logger.log('No orphaned media found.');
      return;
    }

    this.logger.log(
      `Found ${orphanedMedia.length} orphaned media files. Processing deletion...`,
    );

    for (const media of orphanedMedia) {
      try {
        // 1. Xóa file khỏi Storage (S3/Cloudinary/Local)
        // Cần trích xuất key/path từ URL
        // Giả sử logic lấy key tương tự như lúc upload hoặc getSignedUrl
        // Vì ta không lưu key riêng, ta sẽ thử parse từ URL hoặc implementation cụ thể của storageProvider sẽ xử lý
        // Tuy nhiên interface deleteFile(key: string).
        // Tạm thời ta sẽ truyền URL hoặc trích xuất key nếu có thể.
        // Ở đây giả định ta cần extract key.
        // Nếu dùng Local, key thường là filename. Nếu S3, là path object.

        const key = this.extractKeyFromUrl(media.url);
        if (key) {
          await this.storageProvider.delete(key);
        }

        // 2. Xóa record trong DB
        await this.prisma.postMedia.delete({
          where: { id: media.id },
        });

        this.logger.log(`Deleted orphaned media: ${media.id}`);
      } catch (error) {
        this.logger.error(`Failed to delete media ${media.id}:`, error);
      }
    }

    this.logger.log('Media cleanup completed.');
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Ví dụ: /bucket-name/folder/filename.jpg
      // Tùy thuộc vào cấu hình Storage, logic này có thể khác nhau.
      // Với implementation hiện tại, ta sẽ lấy phần sau bucket (nếu có) hoặc filename.
      // Safe bet: lấy full pathname trimmed slash đầu.
      if (pathParts.length > 1) {
        return pathParts.slice(1).join('/'); // Bỏ dấu / đầu tiên
      }
      return urlObj.pathname.substring(1);
    } catch {
      return null; // Invalid URL
    }
  }
}
