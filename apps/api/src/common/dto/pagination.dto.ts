import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PAGINATION_MAX_LIMIT,
} from '@/common/configs/pagination.config';

const handleEmpty = (val: unknown) =>
  val === '' || val === null || val === undefined ? undefined : val;

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z
    .preprocess(handleEmpty, z.enum(['asc', 'desc']).optional())
    .default('desc'),
});

export const PaginationSchema = z
  .object({
    page: z
      .preprocess((val) => {
        const processed = handleEmpty(val);
        if (processed === undefined) return undefined;
        const coerced = Number(processed);
        return isNaN(coerced) ? undefined : coerced;
      }, z.number().int().positive().optional())
      .default(PAGINATION_DEFAULT_PAGE),
    limit: z
      .preprocess((val) => {
        const processed = handleEmpty(val);
        if (processed === undefined) return undefined;
        const coerced = Number(processed);
        return isNaN(coerced) ? undefined : coerced;
      }, z.number().int().positive().max(PAGINATION_MAX_LIMIT).optional())
      .default(PAGINATION_DEFAULT_LIMIT),
  })
  .merge(SortSchema);

export const SearchSchema = z.object({
  search: z.string().optional(),
});

export const BaseQuerySchema = PaginationSchema.merge(SearchSchema);

export class PaginationDto extends createZodDto(BaseQuerySchema) {}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}
