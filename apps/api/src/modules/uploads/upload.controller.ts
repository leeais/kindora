import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { UploadService } from './upload.service';

import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';


@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Không cần diskStorage vì dùng memory
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    const results = await Promise.all(
      files.map((file) => {
        if (file.mimetype.startsWith('image/')) {
          return this.uploadService.processImage(file, user.userId);
        } else if (file.mimetype.startsWith('video/')) {
          return this.uploadService.processVideo(file, user.userId);
        }
        return null;
      }),
    );

    return results.filter(Boolean);
  }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (file.mimetype.startsWith('image/')) {
      return this.uploadService.processImage(file, user.userId);
    } else if (file.mimetype.startsWith('video/')) {
      return this.uploadService.processVideo(file, user.userId);
    }
    return null;
  }
}
