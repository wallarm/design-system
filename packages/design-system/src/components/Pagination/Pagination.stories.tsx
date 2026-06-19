import { useMemo, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { createTableColumnHelper, Table, type TableColumnDef } from '../Table';
import { Text } from '../Text';
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import { PaginationList } from './PaginationList';
import { PaginationNext } from './PaginationNext';
import { PaginationPageSize } from './PaginationPageSize';
import { PaginationPrevious } from './PaginationPrevious';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  subcomponents: {
    PaginationPageSize,
    PaginationPrevious,
    PaginationList,
    PaginationItem,
    PaginationEllipsis,
    PaginationNext,
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Pagination>;

export default meta;

export const Full: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align='center' aria-label='Search results'>
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

// Simple = page numbers only (no prev/next links)
export const Simple: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align='center'>
    <PaginationList />
  </Pagination>
);

// Links only = Previous/Next links only (no page numbers)
export const LinksOnly: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align='center'>
    <PaginationPrevious />
    <PaginationNext />
  </Pagination>
);

export const WithPageSize: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} defaultPageSize={25} defaultPage={2} align='left'>
    <PaginationPageSize options={[10, 25, 50]} />
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

export const Sizes: StoryFn<typeof Pagination> = () => (
  <VStack gap={24}>
    <Pagination count={120} pageSize={10} defaultPage={2} size='medium' align='center'>
      <PaginationPrevious />
      <PaginationList />
      <PaginationNext />
    </Pagination>
    <Pagination count={120} pageSize={10} defaultPage={2} size='small' align='center'>
      <PaginationPrevious />
      <PaginationList />
      <PaginationNext />
    </Pagination>
  </VStack>
);

export const Alignment: StoryFn<typeof Pagination> = () => (
  <VStack gap={24} className='w-600'>
    {(['left', 'center', 'right'] as const).map(align => (
      <Pagination key={align} count={120} pageSize={10} defaultPage={2} align={align}>
        <PaginationList />
      </Pagination>
    ))}
  </VStack>
);

export const ManyPages: StoryFn<typeof Pagination> = () => (
  <Pagination
    count={500}
    pageSize={10}
    defaultPage={6}
    siblingCount={1}
    boundaryCount={1}
    align='center'
  >
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

export const Playground: StoryFn<typeof Pagination> = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <Pagination
      count={120}
      page={page}
      pageSize={pageSize}
      align='left'
      onPageChange={({ page }) => setPage(page)}
      onPageSizeChange={({ pageSize }) => setPageSize(pageSize)}
    >
      <PaginationPageSize options={[10, 25, 50]} />
      <PaginationPrevious />
      <PaginationList />
      <PaginationNext />
    </Pagination>
  );
};

// --- Table + Pagination footer -------------------------------------------------

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  requests: number;
  status: 'Active' | 'Deprecated';
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

const apiEndpoints: ApiEndpoint[] = Array.from({ length: 23 }, (_, i) => ({
  id: `ep-${i + 1}`,
  method: METHODS[i % METHODS.length] as ApiEndpoint['method'],
  path: `/api/v2/resource/${i + 1}`,
  requests: (i + 1) * 137,
  status: i % 3 === 0 ? 'Deprecated' : 'Active',
}));

const endpointColumnHelper = createTableColumnHelper<ApiEndpoint>();

const endpointColumns: TableColumnDef<ApiEndpoint>[] = [
  endpointColumnHelper.accessor('method', {
    header: 'Method',
    size: 120,
    cell: ({ getValue }) => <Text size='sm'>{getValue()}</Text>,
  }),
  endpointColumnHelper.accessor('path', {
    header: 'Endpoint',
    size: 320,
    cell: ({ getValue }) => <Text size='sm'>{getValue()}</Text>,
  }),
  endpointColumnHelper.accessor('requests', {
    header: 'Requests',
    size: 160,
    cell: ({ getValue }) => <Text size='sm'>{getValue().toLocaleString()}</Text>,
  }),
  endpointColumnHelper.accessor('status', {
    header: 'Status',
    size: 160,
    cell: ({ getValue }) => <Text size='sm'>{getValue()}</Text>,
  }),
];

/**
 * A table whose rows are paged by a Pagination footer: "Rows per page" on the
 * left, page navigation on the right. Changing the page or page size slices the
 * data set client-side (`count` = total rows, Ark derives the page count).
 */
export const InTable: StoryFn<typeof Pagination> = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const count = apiEndpoints.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return apiEndpoints.slice(start, start + pageSize);
  }, [currentPage, pageSize]);

  return (
    <div className='w-800'>
      <VStack gap={12}>
        <Table data={pageData} columns={endpointColumns} getRowId={row => row.id} />
        <Pagination
          count={count}
          page={currentPage}
          pageSize={pageSize}
          aria-label='API endpoints'
          onPageChange={({ page }) => setPage(page)}
          onPageSizeChange={({ pageSize }) => {
            setPageSize(pageSize);
            setPage(1);
          }}
        >
          <PaginationPageSize options={[5, 10, 25]} />
          {/* spacer pushes the navigation to the right edge of the footer */}
          <div className='flex-1' />
          <PaginationPrevious />
          <PaginationList />
          <PaginationNext />
        </Pagination>
      </VStack>
    </div>
  );
};
