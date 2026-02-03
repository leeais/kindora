import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';

import type { IStorageProvider } from '@/common/providers/storage/storage.interface';
import type { Job } from 'bull';

import { PrismaService } from '@/db/prisma.service';
import { QUEUE_NAMES, JOB_NAMES } from '@/modules/shared/queue/queue.constants';


// Cấu hình đường dẫn FFmpeg chuẩn senior
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Processor(QUEUE_NAMES.VIDEO_PROCESSING)
export class VideoProcessor {
  private readonly logger = new Logger(VideoProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageProvider')
    private readonly storageProvider: IStorageProvider,
  ) {}

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`❌ Job ${job.id} failed with error: ${error.message}`);
  }

  @Process({ name: JOB_NAMES.VIDEO_TRANSCODE, concurrency: 2 })
  async handleTranscode(
    job: Job<{ fileId: string; videoUrl: string; userId: string }>,
  ) {
    const { fileId, videoUrl, userId: _userId } = job.data;
    this.logger.log(`🎬 Starting video processing for fileId: ${fileId}`);
    const outputDir = join(tmpdir(), 'kindora-video', fileId);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const inputPath = join(outputDir, 'input.mp4');
    const m3u8Path = join(outputDir, 'playlist.m3u8');

    try {
      // 0. Tải video gốc về local trước khi xử lý
      this.logger.log(`⬇️ Downloading video from ${videoUrl}...`);
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      const fileStream = createWriteStream(inputPath);
      await pipeline(Readable.fromWeb(response.body as any), fileStream);
      this.logger.log(
        `✅ Download finished. Size: ${(await readFile(inputPath)).length} bytes`,
      );

      // 1. Chụp thumbnail
      this.logger.log('📸 Generating thumbnail...');
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: 'thumb.jpg',
            folder: outputDir,
            size: '400x?',
          })
          .on('end', () => {
            this.logger.log('✅ Thumbnail generated');
            resolve(true);
          })
          .on('error', reject);
      });

      // 2. Chuyển đổi sang HLS
      this.logger.log('🔄 Starting HLS transcoding...');
      await new Promise((resolve, reject) => {
        let lastLoggedProgress = -1;

        ffmpeg(inputPath)
          .output(m3u8Path)
          .addOptions([
            '-preset ultrafast',
            '-start_number 0',
            '-hls_time 10',
            '-hls_list_size 0',
            '-f hls',
          ])
          .on('start', (commandLine) => {
            this.logger.debug(`Spawned Ffmpeg with command: ${commandLine}`);
          })
          .on('stderr', (_stderrLine) => {
            // Only log critical info or valid progress to avoid spam
          })
          .on('progress', async (progress) => {
            if (progress.percent) {
              const currentProgress = Math.round(progress.percent);
              if (currentProgress >= lastLoggedProgress + 5) {
                lastLoggedProgress = currentProgress;
                this.logger.debug(
                  `⏳ Progress: ${currentProgress}% for fileId: ${fileId}`,
                );
                await job.progress(currentProgress);
                await this.prisma.postMedia.update({
                  where: { id: fileId },
                  data: {
                    metadata: {
                      status: 'PROCESSING',
                      progress: currentProgress,
                    },
                  },
                });
              }
            }
          })
          .on('end', () => {
            this.logger.log(`✨ Transcoding finished for fileId: ${fileId}`);
            resolve(true);
          })
          .on('error', (err, stdout, stderr) => {
            this.logger.error(`💥 FFmpeg error: ${err.message}`);
            this.logger.debug(`FFmpeg stderr: ${stderr}`); // Reduced to debug
            reject(err);
          })
          .run();
      });

      // 3. Upload TOÀN BỘ file trong thư mục output (ngoại trừ input gốc)
      this.logger.log(
        `📤 Starting upload for all segments of fileId: ${fileId}`,
      );
      const files = await readdir(outputDir);
      let thumbUrl = '';
      let playlistUrl = '';

      for (const fileName of files) {
        if (fileName === 'input.mp4') continue; // Không upload lại file gốc nặng

        const filePath = join(outputDir, fileName);
        const buffer = await readFile(filePath);

        let folder = 'videos';
        let finalFileName = `${fileId}/${fileName}`;

        if (fileName === 'thumb.jpg') {
          folder = 'thumbnails';
          finalFileName = `${fileId}-thumb.jpg`;
        }

        const upload = await this.storageProvider.upload(
          {
            fileName: finalFileName,
            buffer,
            mimetype: fileName.endsWith('.ts')
              ? 'video/MP2T'
              : fileName.endsWith('.m3u8')
                ? 'application/x-mpegURL'
                : 'image/jpeg',
            size: buffer.length,
          },
          folder,
          { preserveFileName: true },
        );

        if (fileName === 'thumb.jpg') thumbUrl = upload.url;
        if (fileName === 'playlist.m3u8') playlistUrl = upload.url;
      }

      // Cập nhật Database lần cuối khi hoàn thành
      this.logger.log(
        `🏁 All done! Updating final status for fileId: ${fileId}`,
      );
      await this.prisma.postMedia.update({
        where: { id: fileId },
        data: {
          url: playlistUrl,
          thumbnailUrl: thumbUrl,
          metadata: {
            status: 'READY',
            type: 'HLS',
            progress: 100,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Video processing failed for fileId ${fileId}:`,
        (error as Error).stack,
      );
      await this.prisma.postMedia.update({
        where: { id: fileId },
        data: {
          metadata: { status: 'FAILED', error: (error as Error).message },
        },
      });
    } finally {
      // Dọn dẹp temp
      await rm(outputDir, { recursive: true, force: true });
    }
  }
}
