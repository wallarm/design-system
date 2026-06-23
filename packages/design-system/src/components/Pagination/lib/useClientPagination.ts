import { useMemo, useState } from 'react';
import type { PaginationPageChangeDetails, PaginationPageSizeChangeDetails } from '../types';

interface ClientPagination<T> {
  count: number;
  page: number;
  pageSize: number;
  pageData: T[];
  onPageChange: (details: PaginationPageChangeDetails) => void;
  onPageSizeChange: (details: PaginationPageSizeChangeDetails) => void;
}

/** Client-side paging: slices `data` for the current page and tracks page state. */
export function useClientPagination<T>(data: T[], initialPageSize = 10): ClientPagination<T> {
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const count = data.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  return {
    count,
    page,
    pageSize,
    pageData,
    onPageChange: ({ page }) => setRequestedPage(page),
    onPageSizeChange: ({ pageSize }) => {
      setPageSize(pageSize);
      setRequestedPage(1);
    },
  };
}
