import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
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
