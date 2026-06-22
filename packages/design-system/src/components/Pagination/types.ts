export type PaginationSize = 'medium' | 'small';
export type PaginationAlign = 'left' | 'center' | 'right';

/** A single entry of Ark's `pages` array. */
export type PaginationPage = { type: 'page'; value: number } | { type: 'ellipsis' };

export interface PaginationPageChangeDetails {
  page: number;
  pageSize: number;
}

export interface PaginationPageSizeChangeDetails {
  pageSize: number;
}
