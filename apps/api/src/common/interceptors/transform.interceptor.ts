import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        // Loại bỏ dữ liệu nhạy cảm (password) đệ quy
        const sanitizedResult = this.sanitize(result);

        // Kiểm tra nếu là kết quả từ paginate.util.ts (có data và meta)
        if (sanitizedResult && sanitizedResult.data && sanitizedResult.meta) {
          return {
            success: true,
            message: 'Success',
            data: sanitizedResult.data,
            meta: sanitizedResult.meta,
          };
        }

        return {
          success: true,
          message: 'Success',
          data: sanitizedResult,
        };
      }),
    );
  }

  private sanitize(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (obj instanceof Date) {
      return obj;
    }

    const sanitizedObj: any = {};
    for (const key in obj) {
      if (key === 'password') continue;
      sanitizedObj[key] = this.sanitize(obj[key]);
    }

    return sanitizedObj;
  }
}
