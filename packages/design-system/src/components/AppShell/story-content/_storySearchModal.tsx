import { useState } from 'react';
import { Building, LoaderCircle, Plus } from '../../../icons';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { EmptyState, EmptyStateDescription, EmptyStateMessage } from '../../EmptyState';
import { Kbd } from '../../Kbd';
import {
  SearchModal,
  SearchModalBody,
  SearchModalContent,
  SearchModalEmpty,
  SearchModalFooter,
  SearchModalGroup,
  SearchModalGroupLabel,
  SearchModalInput,
  SearchModalItem,
  SearchModalTrigger,
} from '../../SearchModal';
import { Text } from '../../Text';

const recentItems = [
  { page: 'Attacks', product: 'Cloud WAF', date: '2 hours ago', href: '/attacks' },
  { page: 'Rules', product: 'Cloud WAF', date: '5 hours ago', href: '/rules' },
  {
    page: 'Endpoints',
    product: 'US East',
    dataPlane: true,
    productExtra: 'API Discovery',
    date: 'Yesterday',
    href: '/endpoints',
  },
  { page: 'Dashboards', product: 'Cloud WAF', date: '2 days ago', href: '/dashboards' },
  { page: 'Triggers', product: 'Cloud WAF', date: '3 days ago', href: '/triggers' },
];

const jumpToItems = [
  { name: 'Cloud WAF', href: '/cloud-waf' },
  { name: 'API Discovery', href: '/api-discovery' },
];

const filterRecent = (query: string) => {
  if (!query) return recentItems;
  return recentItems.filter(item => {
    const text = `${item.page} ${item.product} ${item.productExtra ?? ''}`.toLowerCase();
    return text.includes(query);
  });
};

const filterJumpTo = (query: string) => {
  if (!query) return jumpToItems;
  return jumpToItems.filter(item => item.name.toLowerCase().includes(query));
};

export const StorySearchModal = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const lowerQuery = query.toLowerCase();

  const filteredRecent = filterRecent(lowerQuery);
  const filteredJumpTo = filterJumpTo(lowerQuery);
  const hasResults = filteredRecent.length > 0 || filteredJumpTo.length > 0 || !lowerQuery;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery('');
    }
  };

  return (
    <SearchModal open={open} onOpenChange={handleOpenChange} onQueryChange={setQuery}>
      <SearchModalTrigger asChild>
        <Button
          variant='ghost'
          size='small'
          color='neutral'
          className='p-4 gap-6 rounded-6'
          data-slot='top-header-search'
        >
          <Code size='s' color='secondary'>
            Search Wallarm
          </Code>
          <Kbd size='xsmall'>⌘ K</Kbd>
        </Button>
      </SearchModalTrigger>

      <SearchModalContent>
        <SearchModalInput placeholder='Search products, features, and more...' />

        {lowerQuery && !hasResults && (
          <SearchModalEmpty>
            <EmptyState type='no-results' className='pb-8'>
              <EmptyStateMessage>
                <EmptyStateDescription>No results</EmptyStateDescription>
              </EmptyStateMessage>
            </EmptyState>
          </SearchModalEmpty>
        )}

        <SearchModalBody>
          <SearchModalGroup>
            <SearchModalGroupLabel>
              <Text size='xs' color='secondary' weight='medium'>
                Quick actions
              </Text>
            </SearchModalGroupLabel>
            <SearchModalItem onSelect={() => {}}>
              <span className='text-lg'>🐶</span>
              <Text size='sm'>Ask Wally</Text>
            </SearchModalItem>

            {!lowerQuery && (
              <>
                <SearchModalItem onSelect={() => {}}>
                  <Building className='text-text-secondary !icon-md' />
                  <Text size='sm'>Switch tenant</Text>
                </SearchModalItem>

                <SearchModalItem onSelect={() => {}}>
                  <Plus className='text-text-secondary !icon-md' />
                  <Text size='sm'>Create...</Text>
                </SearchModalItem>
              </>
            )}
          </SearchModalGroup>

          {filteredRecent.length > 0 && (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  Recent
                </Text>
              </SearchModalGroupLabel>
              {filteredRecent.map(item => (
                <SearchModalItem key={`${item.page}-${item.product}`} onSelect={() => {}}>
                  <LoaderCircle className='text-text-tertiary shrink-0 !icon-md' />
                  <Text size='sm' grow truncate>
                    {item.page}
                    <Text size='sm' color='secondary' inline>
                      {' '}
                      — {item.dataPlane ? `${item.productExtra} · ${item.product}` : item.product}
                    </Text>
                  </Text>
                  <span className='shrink-0'>
                    <Text size='xs' color='secondary'>
                      {item.date}
                    </Text>
                  </span>
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          )}

          {filteredJumpTo.length > 0 && (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  Jump to
                </Text>
              </SearchModalGroupLabel>
              {filteredJumpTo.map(item => (
                <SearchModalItem key={item.href} onSelect={() => {}}>
                  <LoaderCircle className='text-text-tertiary shrink-0 !icon-md' />
                  <Text size='sm'>{item.name}</Text>
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          )}
        </SearchModalBody>

        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};
