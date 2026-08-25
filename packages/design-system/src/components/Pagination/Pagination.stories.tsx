import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { createTableColumnHelper, Table, type TableColumnDef } from '../Table';
import { Text } from '../Text';
import { useClientPagination } from './lib';
import { Pagination } from './Pagination';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import { PaginationList } from './PaginationList';
import { PaginationNext } from './PaginationNext';
import { PaginationPageSize } from './PaginationPageSize';
import { PaginationPrevious } from './PaginationPrevious';

const DESCRIPTION = [
  'Page-through navigation for a bounded set — previous and next, numbered pages with automatic ellipsis, and an optional rows-per-page selector.',
  'Infinite scroll is the house default for long data, so this is the deliberate alternative: reach for it when knowing and controlling your position genuinely helps — jumping to a page, coming back to page two, choosing a page size. “Lots of rows” on its own is not the cue.',
  'It is compound, so render only the parts you want, in the order you want.',
].join(' ');

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
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

/** The complete set — previous, the numbered list, next — which is what most collections want. */
export const Full: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align='center' aria-label='Search results'>
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

// Simple = page numbers only (no prev/next links)
/** Numbers only. Fine where the reader is scanning to a known page rather than stepping through. */
export const Simple: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align='center'>
    <PaginationList />
  </Pagination>
);

// Links only = Previous/Next links only (no page numbers)
/** Previous and next with no numbers, for a set whose page count means nothing to the reader. */
export const LinksOnly: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} pageSize={10} defaultPage={2} align='center'>
    <PaginationPrevious />
    <PaginationNext />
  </Pagination>
);

/** `PaginationPageSize` puts rows-per-page in the same row. Offering it is the strongest reason to choose pagination over infinite scroll. */
export const WithPageSize: StoryFn<typeof Pagination> = () => (
  <Pagination count={120} defaultPageSize={25} defaultPage={2} align='right'>
    <PaginationPageSize options={[10, 25, 50]} />
    <PaginationPrevious />
    <PaginationList />
    <PaginationNext />
  </Pagination>
);

/** `medium` and `small`. Small is the one to use in a `Table` footer, where the pager should not outweigh the data. */
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

/** `align` places the row left, centre or right — right for a table footer, centre for a standalone list. */
export const Alignment: StoryFn<typeof Pagination> = () => (
  <VStack gap={24} className='w-600'>
    {(['left', 'center', 'right'] as const).map(align => (
      <Pagination key={align} count={120} pageSize={10} defaultPage={2} align={align}>
        <PaginationList />
      </Pagination>
    ))}
  </VStack>
);

/** `siblingCount` and `boundaryCount` decide how much of a 50-page set stays visible; the ellipsis is inserted for you. */
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

/** Controlled mode with both `page` and `pageSize` held outside, which is how it behaves against a real query. */
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

const apiEndpoints: ApiEndpoint[] = Array.from({ length: 47 }, (_, i) => ({
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

// "Rows per page" + page navigation share a right-aligned footer below the table.
/** The pager below a `Table`, sharing its state through `useClientPagination` — the composition to copy for a paged grid. */
export const InTable: StoryFn<typeof Pagination> = () => {
  const { pageData, ...pagination } = useClientPagination(apiEndpoints, 10);

  return (
    <div className='w-800'>
      <VStack gap={12}>
        <Table data={pageData} columns={endpointColumns} getRowId={row => row.id} />
        <Pagination {...pagination} align='right' aria-label='API endpoints'>
          <PaginationPageSize options={[5, 10, 25]} />
          <PaginationPrevious />
          <PaginationList />
          <PaginationNext />
        </Pagination>
      </VStack>
    </div>
  );
};
