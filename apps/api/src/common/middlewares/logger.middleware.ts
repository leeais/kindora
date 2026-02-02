import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { NextFunction, Request, Response } from 'express';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      const timestamp = dayjs()
        .tz('Asia/Ho_Chi_Minh')
        .format('DD/MM/YYYY HH:mm:ss');

      this.logger.log(
        `[${timestamp}] ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} +${duration}ms`,
      );
    });

    next();
  }
}
