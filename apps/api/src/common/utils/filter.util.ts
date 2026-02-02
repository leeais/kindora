import { type Prisma } from '@/db/generated/prisma/client';

type SearchOperation =
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'gte'
  | 'lte'
  | 'gt'
  | 'lt'
  | 'in'
  | 'not'
  | 'equals';

/**
 * Utility to convert DTO filters into Prisma where conditions
 * @param filters The DTO containing filter fields
 * @param mappings Map DTO field names to Prisma operations (e.g., createdAt: 'gte')
 */
export function buildWhereClause<T extends Record<string, any>>(
  filters: T,
  mappings: Partial<Record<keyof T, SearchOperation>> = {},
): Prisma.JsonObject {
  const where: any = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;

    // Skip internal fields like pagination/sort
    if (['page', 'limit', 'sortBy', 'sortOrder', 'search'].includes(key))
      continue;

    const operation = mappings[key as keyof T];

    if (operation) {
      if (operation === 'contains') {
        where[key] = { contains: value, mode: 'insensitive' };
      } else if (
        [
          'gte',
          'lte',
          'gt',
          'lt',
          'in',
          'not',
          'startsWith',
          'endsWith',
        ].includes(operation as string)
      ) {
        where[key] = { [operation as string]: value };
      }
    } else {
      // Default to equality
      where[key] = value;
    }
  }

  return where;
}
