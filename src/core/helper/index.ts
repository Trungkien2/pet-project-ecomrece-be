export interface IPaginationResult {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_count: number;
  limit: number;
  offset: number;
}

export function getPagination(page: number = 1, limit: number = 10, total: number = 0): IPaginationResult {
  const current_page = Math.max(1, page);
  const total_pages = Math.ceil(total / limit);
  const offset = (current_page - 1) * limit;
  
  return {
    current_page,
    next_page: current_page < total_pages ? current_page + 1 : null,
    prev_page: current_page > 1 ? current_page - 1 : null,
    total_pages,
    total_count: total,
    limit,
    offset,
  };
}