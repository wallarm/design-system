import type { ComponentProps, FC, Ref } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { PanelLeftClose, PanelLeftOpen } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { Button } from '../Button';
import { TableOfContentsContext } from './TableOfContentsContext';

export type TableOfContentsView = 'full' | 'minimized';

export interface TableOfContentsProps
  extends Omit<ComponentProps<'nav'>, 'onChange'>,
    TestableProps {
  /** The active item's value. Controlled only — the page owns the active section. */
  value?: string;
  /** Called with the item's value on a plain click on an in-page item. */
  onValueChange?: (value: string) => void;
  /** Controlled view. */
  view?: TableOfContentsView;
  /** Uncontrolled initial view. */
  defaultView?: TableOfContentsView;
  onViewChange?: (view: TableOfContentsView) => void;
  /** Header label in the Full view and the nav's accessible name. */
  title?: string;
  ref?: Ref<HTMLElement>;
}

export const TableOfContents: FC<TableOfContentsProps> = ({
  value,
  onValueChange,
  view: viewProp,
  defaultView = 'full',
  onViewChange,
  title = 'On this page',
  className,
  children,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const [view = defaultView, setView] = useControlled({
    controlled: viewProp,
    default: defaultView,
  });
  const full = view === 'full';
  const slotTestId = (slot: string) => (testId ? `${testId}--${slot}` : undefined);

  const handleToggle = () => {
    const next = full ? 'minimized' : 'full';
    setView(next);
    onViewChange?.(next);
  };

  return (
    <nav
      {...props}
      ref={ref}
      aria-label={title}
      data-slot='table-of-contents'
      data-view={view}
      data-testid={testId}
      className={cn('flex min-h-0 flex-col', full ? 'w-200' : 'w-48', className)}
    >
      <TestIdProvider value={testId}>
        <div className='flex h-32 shrink-0 items-center gap-4 pr-8 pl-4'>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            aria-label={full ? 'Collapse table of contents' : 'Expand table of contents'}
            aria-expanded={full}
            onClick={handleToggle}
            data-slot='table-of-contents-toggle'
            data-testid={slotTestId('toggle')}
          >
            {full ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
          {full && (
            <span className='truncate text-xs font-medium text-text-secondary'>{title}</span>
          )}
        </div>
        {full && (
          <TableOfContentsContext value={{ value, onValueChange, mode: 'row' }}>
            <ul
              data-slot='table-of-contents-list'
              data-testid={slotTestId('list')}
              className='-m-3 flex min-h-0 flex-col gap-1 overflow-y-auto p-3'
            >
              {children}
            </ul>
          </TableOfContentsContext>
        )}
      </TestIdProvider>
    </nav>
  );
};

TableOfContents.displayName = 'TableOfContents';
