export async function paginate<T>(
  model: any,
  query: any = {},
  options: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      ...query,
      take: limit,
      skip,
      orderBy: options.sortBy
        ? { [options.sortBy]: options.sortOrder }
        : undefined,
    }),
    model.count({ where: query.where }),
  ]);

  const lastPage = Math.ceil(total / options.limit);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: options.page,
      perPage: options.limit,
      prev: options.page > 1 ? options.page - 1 : null,
      next: options.page < lastPage ? options.page + 1 : null,
    },
  };
}
