import type { KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { Portal } from '@ark-ui/react/portal';
import {
  ArrowDown,
  ArrowUp,
  Building,
  CornerDownLeft,
  LoaderCircle,
  Plus,
  Search,
} from '../../../icons';
import { cn } from '../../../utils/cn';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { EmptyState, EmptyStateDescription, EmptyStateMessage } from '../../EmptyState';
import { Kbd } from '../../Kbd';
import { Overlay } from '../../Overlay';
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

const itemClass =
  'flex items-center gap-12 w-full px-16 py-8 rounded-6 hover:bg-states-primary-hover cursor-pointer text-left no-underline';
const itemActiveClass = 'bg-states-primary-hover';

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

export const SearchModal = () => {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const toggleSearch = useRef(() => setSearchOpen(prev => !prev)).current;

  const [query, setQuery] = useState('');
  const lowerQuery = query.toLowerCase();
  const quickActionCount = lowerQuery ? 1 : 3;
  const filteredRecent = filterRecent(lowerQuery);
  const filteredJumpTo = filterJumpTo(lowerQuery);
  const totalItems = quickActionCount + filteredRecent.length + filteredJumpTo.length;

  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const onOpenChange = (details: { open: boolean }) => {
    setSearchOpen(details.open);
    if (!details.open) {
      setQuery('');
      setActiveIndex(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 >= totalItems ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 < 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const items = listRef.current?.querySelectorAll<HTMLElement>('[data-search-item=""]');
      items?.[activeIndex]?.click();
    }
  };

  // open Search Wallarm
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  // input focus
  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [searchOpen]);

  // scroll to active item
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>('[data-search-item=""]');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <>
      <Button
        variant='ghost'
        size='small'
        color='neutral'
        className='p-4 gap-6 rounded-6'
        data-slot='top-header-search'
        onClick={() => setSearchOpen(true)}
      >
        <Code size='s' color='secondary'>
          Search Wallarm
        </Code>
        <Kbd size='xsmall'>⌘ K</Kbd>
      </Button>

      <Dialog.Root
        open={searchOpen}
        onOpenChange={onOpenChange}
        closeOnEscape
        closeOnInteractOutside
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop asChild>
            <Overlay />
          </Dialog.Backdrop>

          <Dialog.Positioner className='fixed inset-0 z-[calc(var(--drawer-overlay-z-index)+1)] flex items-start justify-center pt-[10vh]'>
            <Dialog.Content
              className='w-[560px] max-h-[70vh] bg-bg-surface-1 rounded-12 shadow-lg border border-border-primary overflow-hidden flex flex-col outline-none'
              onKeyDown={handleKeyDown}
            >
              <div className='flex items-center gap-8 px-16 border-b border-border-primary'>
                <Search className='text-text-tertiary shrink-0 !icon-md' />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  placeholder='Search products, features, and more...'
                  className='flex-1 h-48 bg-transparent text-text-primary text-base placeholder:text-text-tertiary outline-none'
                  autoFocus
                />
                <Kbd size='xsmall'>ESC</Kbd>
              </div>

              {lowerQuery && filteredRecent.length === 0 && filteredJumpTo.length === 0 && (
                <EmptyState type='no-results' className='pb-8'>
                  <EmptyStateMessage>
                    <EmptyStateDescription>No results</EmptyStateDescription>
                  </EmptyStateMessage>
                </EmptyState>
              )}

              <div className='overflow-y-auto flex-1 py-8' ref={listRef}>
                <div className='px-16 pt-8'>
                  <Text size='xs' color='secondary' weight='medium'>
                    Quick actions
                  </Text>
                </div>

                <button
                  type='button'
                  data-search-item=''
                  className={cn(itemClass, activeIndex === 0 && itemActiveClass)}
                  onMouseEnter={() => setActiveIndex(0)}
                >
                  <span className='text-lg'>🐶</span>
                  <Text size='sm'>Ask Wally</Text>
                </button>

                {!lowerQuery && (
                  <>
                    <button
                      type='button'
                      data-search-item=''
                      className={cn(itemClass, activeIndex === 1 && itemActiveClass)}
                      onMouseEnter={() => setActiveIndex(1)}
                    >
                      <Building className='text-text-secondary !icon-md' />
                      <Text size='sm'>Switch tenant</Text>
                    </button>

                    <button
                      type='button'
                      data-search-item=''
                      className={cn(itemClass, activeIndex === 2 && itemActiveClass)}
                      onMouseEnter={() => setActiveIndex(2)}
                    >
                      <Plus className='text-text-secondary !icon-md' />
                      <Text size='sm'>Create...</Text>
                    </button>
                  </>
                )}

                {filteredRecent.length > 0 && (
                  <>
                    <div className='px-16 py-8 mt-4'>
                      <Text size='xs' color='secondary' weight='medium'>
                        Recent
                      </Text>
                    </div>

                    {filteredRecent.map((item, i) => {
                      const idx = quickActionCount + i;
                      return (
                        <a
                          key={`${item.page}-${item.product}`}
                          href={item.href}
                          data-search-item=''
                          className={cn(itemClass, activeIndex === idx && itemActiveClass)}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <LoaderCircle className='text-text-tertiary shrink-0 !icon-md' />
                          <Text size='sm' grow truncate>
                            {item.page}
                            <Text size='sm' color='secondary' inline>
                              {' '}
                              —{' '}
                              {item.dataPlane
                                ? `${item.productExtra} · ${item.product}`
                                : item.product}
                            </Text>
                          </Text>
                          <span className='shrink-0'>
                            <Text size='xs' color='secondary'>
                              {item.date}
                            </Text>
                          </span>
                        </a>
                      );
                    })}
                  </>
                )}

                {filteredJumpTo.length > 0 && (
                  <>
                    <div className='px-16 py-8 mt-4'>
                      <Text size='xs' color='secondary' weight='medium'>
                        Jump to
                      </Text>
                    </div>

                    {filteredJumpTo.map((item, i) => {
                      const idx = quickActionCount + filteredRecent.length + i;
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          data-search-item=''
                          className={cn(itemClass, activeIndex === idx && itemActiveClass)}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <LoaderCircle className='text-text-tertiary shrink-0 !icon-md' />
                          <Text size='sm'>{item.name}</Text>
                        </a>
                      );
                    })}
                  </>
                )}
              </div>

              <div className='flex items-center gap-16 px-16 py-8 border-t border-border-primary'>
                <span className='inline-flex items-center gap-4'>
                  <ArrowUp className='text-text-tertiary !icon-sm' />
                  <ArrowDown className='text-text-tertiary !icon-sm' />
                  <Text size='xs' color='secondary'>
                    to navigate
                  </Text>
                </span>
                <span className='inline-flex items-center gap-4'>
                  <CornerDownLeft className='text-text-tertiary !icon-sm' />
                  <Text size='xs' color='secondary'>
                    to select
                  </Text>
                </span>
              </div>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
