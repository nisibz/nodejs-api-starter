export interface PaginationParams {
  page: number;
  limit: number;
}

export type SortOrder = "asc" | "desc";

export interface SortParams {
  sort?: string;
  order?: SortOrder;
}

export interface SearchParams {
  search?: string;
}

export interface QueryParams extends PaginationParams, SortParams, SearchParams {}

export interface SortableFieldsConfig {
  fields: string[];
  defaultField: string;
  defaultOrder: SortOrder;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export const getQueryParams = (
  query: Partial<QueryParams>,
  sortableConfig?: SortableFieldsConfig,
): QueryParams => {
  const page = Math.max(1, parseInt(String(query.page)) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit)) || 10));

  // Validate sort field against allowed fields
  let sort: string | undefined;
  if (query.sort) {
    if (sortableConfig?.fields.includes(String(query.sort))) {
      sort = String(query.sort);
    }
  }

  // Validate order
  const order: SortOrder =
    query.order && ["asc", "desc"].includes(String(query.order).toLowerCase())
      ? (String(query.order).toLowerCase() as SortOrder)
      : (sortableConfig?.defaultOrder ?? "desc");

  const search = query.search ? String(query.search).trim() : undefined;

  return {
    page,
    limit,
    sort: sort ?? sortableConfig?.defaultField,
    order,
    search,
  };
};

export const getPaginationParams = (query: Record<string, unknown>): PaginationParams => {
  const page = Math.max(1, parseInt(String(query.page)) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit)) || 10));

  return { page, limit };
};

export const calculatePagination = (page: number, limit: number, total: number): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const getPrismaSkipTake = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
};

export const buildPrismaOrderBy = (
  sort: string | undefined,
  order: SortOrder | undefined,
): Record<string, SortOrder> => {
  return { [sort || "createdAt"]: order || "desc" };
};

export const buildPrismaSearchWhere = (
  search: string | undefined,
  searchableFields: string[],
): Record<string, unknown> | undefined => {
  if (!search || !searchableFields.length) return undefined;

  const searchConditions = searchableFields.map((field) => ({
    [field]: { contains: search, mode: "insensitive" },
  }));

  return { OR: searchConditions };
};
