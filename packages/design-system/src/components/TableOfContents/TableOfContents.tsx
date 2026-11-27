import { type ComponentProps, type FC, type Ref, useId } from 'react';
import { useControlled } from '../../hooks/useControlled';
import { PanelLeftClose, PanelRightClose } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { Button } from '../Button';
import { TableOfContentsContext } from './TableOfContentsContext';
import { TableOfContentsMinimized } from './TableOfContentsMinimized';

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
  /** Header label in the Full view; the accessible name of the nav, the toggle and the popover unless `aria-label` is passed. */
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
  'aria-label': ariaLabel,
  'data-testid': testId,
  ...props
}) => {
  const label = ariaLabel ?? title;
  const [view = defaultView, setView] = useControlled({
    controlled: viewProp,
    default: defaultView,
  });
  const full = view === 'full';
  const headerId = useId();
  const listId = useId();
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
      aria-label={label}
      data-slot='table-of-contents'
      data-view={view}
      data-testid={testId}
      className={cn('flex min-h-0 flex-col', full ? 'w-200' : 'w-48', className)}
    >
      <TestIdProvider value={testId}>
        <div id={headerId} className='flex h-32 shrink-0 items-center gap-4 pr-8 pl-4'>
          <Button
            variant='ghost'
            color='neutral'
            size='small'
            // A stable name: the state is in aria-expanded, not in the label.
            aria-label={label}
            aria-expanded={full}
            aria-controls={full ? listId : undefined}
            onClick={handleToggle}
            data-slot='table-of-contents-toggle'
            data-testid={slotTestId('toggle')}
          >
            {full ? <PanelLeftClose /> : <PanelRightClose />}
          </Button>
          {full && (
            <span className='truncate text-xs font-medium text-text-secondary'>{title}</span>
          )}
        </div>
        {full ? (
          <TableOfContentsContext value={{ value, onValueChange, mode: 'row' }}>
            <ul
              id={listId}
              data-slot='table-of-contents-list'
              data-testid={slotTestId('list')}
              className='-m-3 flex min-h-0 flex-col gap-1 overflow-y-auto p-3'
            >
              {children}
            </ul>
          </TableOfContentsContext>
        ) : (
          <TableOfContentsMinimized
            anchorId={headerId}
            label={label}
            value={value}
            onValueChange={onValueChange}
          >
            {children}
          </TableOfContentsMinimized>
        )}
      </TestIdProvider>
    </nav>
  );
};

TableOfContents.displayName = 'TableOfContents';
