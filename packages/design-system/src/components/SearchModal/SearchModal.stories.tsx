import { useCallback, useMemo, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  ChevronRight,
  Clock,
  Compass,
  Globe,
  History,
  Layers,
  Plus,
  Search,
  Settings,
  Shield,
  Users,
  Zap,
} from '../../icons';
import { Button } from '../Button';
import { Kbd } from '../Kbd';
import { Text } from '../Text';
import { WallyIcon } from '../WallyIcon';
import { SearchModal, type SearchModalProps } from './SearchModal';
import { SearchModalBody } from './SearchModalBody';
import { SearchModalContent } from './SearchModalContent';
import { SearchModalEmpty } from './SearchModalEmpty';
import { SearchModalFooter } from './SearchModalFooter';
import { SearchModalGroup } from './SearchModalGroup';
import { SearchModalGroupLabel } from './SearchModalGroupLabel';
import { SearchModalInput } from './SearchModalInput';
import { SearchModalItem } from './SearchModalItem';
import { SearchModalTrigger } from './SearchModalTrigger';

const DESCRIPTION =
  'A command-palette dialog opened with Cmd+K (Ctrl+K on Windows/Linux). ' +
  'Provides a search input, grouped item lists, keyboard navigation, and a footer with keyboard hints. ' +
  'Content is consumer-assembled: the component is a composable shell, not a hard-wired feature.';

const meta = {
  title: 'Overlay/SearchModal',
  component: SearchModal,
  subcomponents: {
    SearchModalTrigger,
    SearchModalContent,
    SearchModalInput,
    SearchModalBody,
    SearchModalGroup,
    SearchModalGroupLabel,
    SearchModalItem,
    SearchModalEmpty,
    SearchModalFooter,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof SearchModal>;

export default meta;

// ---------------------------------------------------------------------------
// Shared mock data
// ---------------------------------------------------------------------------

const noop = () => undefined;

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

const RECENT_ITEMS: (NavItem & { date: string })[] = [
  {
    id: 'recent-1',
    label: 'Attack Rechecker \u2014 Scanner',
    icon: <History className='text-text-tertiary !icon-md' />,
    date: '2m ago',
  },
  {
    id: 'recent-2',
    label: 'API Discovery \u2014 API Security',
    icon: <History className='text-text-tertiary !icon-md' />,
    date: '15m ago',
  },
  {
    id: 'recent-3',
    label: 'Rules \u2014 Cloud WAF',
    icon: <History className='text-text-tertiary !icon-md' />,
    date: '1h ago',
  },
  {
    id: 'recent-4',
    label: 'Dashboards \u2014 Platform',
    icon: <History className='text-text-tertiary !icon-md' />,
    date: '3h ago',
  },
  {
    id: 'recent-5',
    label: 'Integrations \u2014 Settings',
    icon: <History className='text-text-tertiary !icon-md' />,
    date: 'Yesterday',
  },
];

const JUMP_TO_ITEMS: NavItem[] = [
  { id: 'nav-scanner', label: 'Scanner', icon: <Search className='text-text-tertiary !icon-md' /> },
  {
    id: 'nav-api-security',
    label: 'API Security',
    icon: <Shield className='text-text-tertiary !icon-md' />,
  },
  {
    id: 'nav-cloud-waf',
    label: 'Cloud WAF',
    icon: <Globe className='text-text-tertiary !icon-md' />,
  },
  {
    id: 'nav-dashboards',
    label: 'Dashboards',
    icon: <Layers className='text-text-tertiary !icon-md' />,
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    icon: <Settings className='text-text-tertiary !icon-md' />,
  },
  {
    id: 'nav-connectors',
    label: 'Connectors',
    icon: <Zap className='text-text-tertiary !icon-md' />,
  },
  {
    id: 'nav-audit-log',
    label: 'Audit Log',
    icon: <Clock className='text-text-tertiary !icon-md' />,
  },
  {
    id: 'nav-users',
    label: 'Users & Roles',
    icon: <Users className='text-text-tertiary !icon-md' />,
  },
];

const CREATE_ITEMS: NavItem[] = [
  {
    id: 'create-rule',
    label: 'Rule',
    icon: <Shield className='text-text-tertiary !icon-md' />,
    section: 'Cloud WAF',
  },
  {
    id: 'create-trigger',
    label: 'Trigger',
    icon: <Zap className='text-text-tertiary !icon-md' />,
    section: 'Cloud WAF',
  },
  {
    id: 'create-app',
    label: 'Application',
    icon: <Globe className='text-text-tertiary !icon-md' />,
    section: 'Scanner',
  },
  {
    id: 'create-scope',
    label: 'Scan scope',
    icon: <Compass className='text-text-tertiary !icon-md' />,
    section: 'Scanner',
  },
  {
    id: 'create-connector',
    label: 'Connector',
    icon: <Zap className='text-text-tertiary !icon-md' />,
    section: 'Integrations',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterItems<T extends NavItem>(items: T[], query: string): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(q));
}

const SearchTriggerButton = () => (
  <SearchModalTrigger asChild>
    <Button variant='outline' color='neutral'>
      <Search />
      Search
      <Kbd size='xsmall'>
        {typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent) ? '\u2318' : 'Ctrl+'}K
      </Kbd>
    </Button>
  </SearchModalTrigger>
);

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * The full palette with recent history. Type to filter: "Jump to" relabels to
 * "Go to", recents hide when nothing matches, and a no-results fallback offers
 * Ask Wally. Covers PRD states 1, 3, 4 and 5.
 */
export const Basic: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredRecents = useMemo(() => filterItems(RECENT_ITEMS, query), [query]);
  const filteredJumpTo = useMemo(() => filterItems(JUMP_TO_ITEMS, query), [query]);
  const hasResults = filteredRecents.length > 0 || filteredJumpTo.length > 0;

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery} data-testid='search'>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Search products, features, and more\u2026' />
        <SearchModalBody>
          <SearchModalGroup>
            <SearchModalGroupLabel>
              <Text size='xs' color='secondary' weight='medium'>
                Quick actions
              </Text>
            </SearchModalGroupLabel>
            <SearchModalItem onSelect={noop}>
              <WallyIcon size='sm' />
              <Text size='sm'>{query ? `Ask Wally "${query}"` : 'Ask Wally'}</Text>
            </SearchModalItem>
            {!query && (
              <>
                <SearchModalItem onSelect={noop}>
                  <Users className='!icon-md' />
                  <Text size='sm'>Switch tenant</Text>
                </SearchModalItem>
                <SearchModalItem onSelect={noop}>
                  <Plus className='!icon-md' />
                  <Text size='sm'>Create&hellip;</Text>
                </SearchModalItem>
              </>
            )}
          </SearchModalGroup>

          {filteredRecents.length > 0 && (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  Recent
                </Text>
              </SearchModalGroupLabel>
              {filteredRecents.map(item => (
                <SearchModalItem key={item.id} onSelect={noop}>
                  {item.icon}
                  <Text size='sm'>{item.label}</Text>
                  <span className='ml-auto'>
                    <Text size='xs' color='secondary'>
                      {item.date}
                    </Text>
                  </span>
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          )}

          {(hasResults || !query) && (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  {query ? 'Go to' : 'Jump to'}
                </Text>
              </SearchModalGroupLabel>
              {(query ? filteredJumpTo : JUMP_TO_ITEMS).map(item => (
                <SearchModalItem key={item.id} onSelect={noop}>
                  {item.icon}
                  <Text size='sm'>{item.label}</Text>
                  <ChevronRight className='text-text-tertiary ml-auto !icon-sm' />
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          )}

          {query && !hasResults && (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};

/**
 * A new user with no history. The Recent section shows "Nothing recent yet"
 * instead of items. Matches PRD state 2.
 */
export const EmptyRecents: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredJumpTo = useMemo(() => filterItems(JUMP_TO_ITEMS, query), [query]);

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Search products, features, and more\u2026' />
        <SearchModalBody>
          <SearchModalGroup>
            <SearchModalGroupLabel>
              <Text size='xs' color='secondary' weight='medium'>
                Quick actions
              </Text>
            </SearchModalGroupLabel>
            <SearchModalItem onSelect={noop}>
              <WallyIcon size='sm' />
              <Text size='sm'>{query ? `Ask Wally "${query}"` : 'Ask Wally'}</Text>
            </SearchModalItem>
            {!query && (
              <>
                <SearchModalItem onSelect={noop}>
                  <Users className='!icon-md' />
                  <Text size='sm'>Switch tenant</Text>
                </SearchModalItem>
                <SearchModalItem onSelect={noop}>
                  <Plus className='!icon-md' />
                  <Text size='sm'>Create&hellip;</Text>
                </SearchModalItem>
              </>
            )}
          </SearchModalGroup>

          {!query && (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  Recent
                </Text>
              </SearchModalGroupLabel>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  Nothing recent yet
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}

          {filteredJumpTo.length > 0 && (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  {query ? 'Go to' : 'Jump to'}
                </Text>
              </SearchModalGroupLabel>
              {filteredJumpTo.map(item => (
                <SearchModalItem key={item.id} onSelect={noop}>
                  {item.icon}
                  <Text size='sm'>{item.label}</Text>
                  <ChevronRight className='text-text-tertiary ml-auto !icon-sm' />
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          )}

          {query && filteredJumpTo.length === 0 && (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};

/**
 * A sub-list page pushed in place of the main body. Used for "Create\u2026" and
 * "Switch tenant". The footer changes to show "esc back" and "enter to select".
 * Demonstrates PRD states 6 and 7.
 */
export const SubList: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterItems(CREATE_ITEMS, query), [query]);
  const grouped = useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const item of filtered) {
      const key = item.section ?? 'Other';
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    return map;
  }, [filtered]);

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Filter creatable items\u2026' />
        <SearchModalBody>
          {filtered.length > 0 ? (
            [...grouped.entries()].map(([section, items]) => (
              <SearchModalGroup key={section}>
                <SearchModalGroupLabel>
                  <Text size='xs' color='secondary' weight='medium'>
                    {section}
                  </Text>
                </SearchModalGroupLabel>
                {items.map(item => (
                  <SearchModalItem key={item.id} onSelect={noop}>
                    {item.icon}
                    <Text size='sm'>{item.label}</Text>
                  </SearchModalItem>
                ))}
              </SearchModalGroup>
            ))
          ) : (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter>
          <span className='inline-flex items-center gap-4'>
            <Kbd size='xsmall'>esc</Kbd>
            <Text size='xs' color='secondary'>
              back
            </Text>
          </span>
          <span className='inline-flex items-center gap-4'>
            <Kbd size='xsmall'>&crarr;</Kbd>
            <Text size='xs' color='secondary'>
              to select
            </Text>
          </span>
        </SearchModalFooter>
      </SearchModalContent>
    </SearchModal>
  );
};

/**
 * Items rendered as links via `asChild`, for cases where results navigate to a URL.
 */
export const ItemsAsLinks: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterItems(JUMP_TO_ITEMS, query), [query]);

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Search products, features, and more\u2026' />
        <SearchModalBody>
          {filtered.length > 0 ? (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  {query ? 'Go to' : 'Jump to'}
                </Text>
              </SearchModalGroupLabel>
              {filtered.map(item => (
                <SearchModalItem key={item.id} asChild onSelect={noop}>
                  <a href={`#${item.id}`}>
                    {item.icon}
                    <Text size='sm'>{item.label}</Text>
                    <ChevronRight className='text-text-tertiary ml-auto !icon-sm' />
                  </a>
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          ) : (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};

/**
 * Disabled items are excluded from keyboard navigation and cannot be selected.
 */
export const DisabledItems: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const actions = useMemo(
    () =>
      filterItems(
        [
          { id: 'ask-wally', label: 'Ask Wally', icon: <WallyIcon size='sm' /> },
          { id: 'switch-tenant', label: 'Switch tenant', icon: <Users className='!icon-md' /> },
          { id: 'create', label: 'Create\u2026', icon: <Plus className='!icon-md' /> },
        ],
        query,
      ),
    [query],
  );

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Search products, features, and more\u2026' />
        <SearchModalBody>
          {actions.length > 0 ? (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  Quick actions
                </Text>
              </SearchModalGroupLabel>
              {actions.map(item => (
                <SearchModalItem
                  key={item.id}
                  onSelect={item.id === 'switch-tenant' ? undefined : noop}
                  disabled={item.id === 'switch-tenant'}
                >
                  {item.icon}
                  <Text size='sm'>{item.label}</Text>
                  {item.id === 'switch-tenant' && (
                    <span className='ml-auto'>
                      <Text size='xs' color='secondary'>
                        Unavailable
                      </Text>
                    </span>
                  )}
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          ) : (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};

/**
 * `closeOnSelect={false}` keeps the modal open after selecting an item, useful
 * for multi-step flows like the sub-list mechanic.
 */
export const CloseOnSelectFalse: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => filterItems(JUMP_TO_ITEMS, query), [query]);

  const toggleItem = useCallback(
    (id: string) =>
      setSelected(prev => (prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])),
    [],
  );

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Pick items (modal stays open)\u2026' />
        <SearchModalBody>
          {filtered.length > 0 ? (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  Products {selected.length > 0 && `(${selected.length} selected)`}
                </Text>
              </SearchModalGroupLabel>
              {filtered.map(item => (
                <SearchModalItem
                  key={item.id}
                  closeOnSelect={false}
                  onSelect={() => toggleItem(item.id)}
                >
                  {item.icon}
                  <Text size='sm'>{item.label}</Text>
                  {selected.includes(item.id) && (
                    <span className='ml-auto'>
                      <Text size='xs' color='primary-alt'>
                        Selected
                      </Text>
                    </span>
                  )}
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          ) : (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};

/**
 * Controlled open state, driven entirely from outside the component.
 * No `SearchModalTrigger` — the button calls `setOpen` directly.
 */
export const Controlled: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => filterItems(JUMP_TO_ITEMS, query), [query]);

  return (
    <>
      <Button variant='outline' color='neutral' onClick={() => setOpen(true)}>
        Open Programmatically
      </Button>
      <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
        <SearchModalContent>
          <SearchModalInput placeholder='Search products, features, and more\u2026' />
          <SearchModalBody>
            {filtered.length > 0 ? (
              <SearchModalGroup>
                <SearchModalGroupLabel>
                  <Text size='xs' color='secondary' weight='medium'>
                    {query ? 'Go to' : 'Jump to'}
                  </Text>
                </SearchModalGroupLabel>
                {filtered.map(item => (
                  <SearchModalItem key={item.id} onSelect={noop}>
                    {item.icon}
                    <Text size='sm'>{item.label}</Text>
                  </SearchModalItem>
                ))}
              </SearchModalGroup>
            ) : (
              <SearchModalGroup>
                <SearchModalEmpty className='px-16 py-8'>
                  <Text size='sm' color='secondary'>
                    No results
                  </Text>
                </SearchModalEmpty>
              </SearchModalGroup>
            )}
          </SearchModalBody>
          <SearchModalFooter />
        </SearchModalContent>
      </SearchModal>
    </>
  );
};

/**
 * The scrollable body when there are many items. The input and footer stay fixed
 * while the body scrolls.
 */
export const Scrollable: StoryFn<SearchModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const allItems = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: `item-${i}`,
        label: `Feature ${i + 1}`,
        icon: <Compass className='text-text-tertiary !icon-md' />,
      })),
    [],
  );

  const filtered = useMemo(() => filterItems(allItems, query), [allItems, query]);

  return (
    <SearchModal open={open} onOpenChange={setOpen} onQueryChange={setQuery}>
      <SearchTriggerButton />
      <SearchModalContent>
        <SearchModalInput placeholder='Search products, features, and more\u2026' />
        <SearchModalBody>
          {filtered.length > 0 ? (
            <SearchModalGroup>
              <SearchModalGroupLabel>
                <Text size='xs' color='secondary' weight='medium'>
                  All features
                </Text>
              </SearchModalGroupLabel>
              {filtered.map(item => (
                <SearchModalItem key={item.id} onSelect={noop}>
                  {item.icon}
                  <Text size='sm'>{item.label}</Text>
                </SearchModalItem>
              ))}
            </SearchModalGroup>
          ) : (
            <SearchModalGroup>
              <SearchModalEmpty className='px-16 py-8'>
                <Text size='sm' color='secondary'>
                  No results
                </Text>
              </SearchModalEmpty>
            </SearchModalGroup>
          )}
        </SearchModalBody>
        <SearchModalFooter />
      </SearchModalContent>
    </SearchModal>
  );
};
