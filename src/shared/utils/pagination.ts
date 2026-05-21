import { PaginationQuery } from "../types";

export function parsePagination(query: Record<string, unknown>): Required<PaginationQuery> {
  return {
    page: Math.max(1, Number(query.page) || 1),
    limit: Math.min(100, Math.max(1, Number(query.limit) || 20)),
    sortBy: (query.sortBy as string) || "createdAt",
    sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
