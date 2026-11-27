import type { ComponentProps, FC, MouseEvent, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { tableOfContentsDashVariants, tableOfContentsItemVariants } from './classes';
import { useTableOfContentsContext } from './TableOfContentsContext';

export interface TableOfContentsItemProps extends ComponentProps<'a'>, TestableProps {
  /** Section id. `href` defaults to `#${value}`. */
  value: string;
  /** Nesting level; level 2 is indented. */
  level?: 1 | 2;
  /** Section number shown before the label, e.g. `1.1`. */
  number?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}

const isModifiedClick = (event: MouseEvent) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export const TableOfContentsItem: FC<TableOfContentsItemProps> = ({
  value,
  level = 1,
  number,
  href: hrefProp,
  onClick,
  className,
  children,
  ref,
  'data-testid': testIdProp,
  ...props
}) => {
  const { value: activeValue, onValueChange, mode, onItemSelect } = useTableOfContentsContext();
  const testId = useTestId('item', testIdProp);
  const href = hrefProp ?? `#${value}`;
  const active = activeValue === value;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) return;
    // Intercept only an in-page link the root handles; otherwise the browser navigates.
    if (onValueChange && href.startsWith('#')) {
      event.preventDefault();
      onValueChange(value);
    }
    // A plain click picks the item either way — close the popover.
    onItemSelect?.();
  };

  // The dash copy is decorative: the consumer's ref and props stay on the row link.
  if (mode === 'dash') {
    return (
      <span
        data-active={active || undefined}
        data-level={level}
        data-slot='table-of-contents-dash'
        className={tableOfContentsDashVariants({ level, active })}
      />
    );
  }

  return (
    <li className='relative before:absolute before:top-0 before:-bottom-px before:left-16 before:w-px before:bg-border-primary last:before:bottom-0'>
      <a
        {...props}
        ref={ref}
        href={href}
        onClick={handleClick}
        aria-current={active ? 'location' : undefined}
        data-active={active || undefined}
        data-level={level}
        data-slot='table-of-contents-item'
        data-testid={testId}
        className={cn(tableOfContentsItemVariants({ level, active }), className)}
      >
        {active && (
          <span aria-hidden className='absolute top-4 bottom-4 left-16 w-px bg-text-primary' />
        )}
        {number !== undefined && (
          <span className='shrink-0 font-mono text-text-secondary'>{number}</span>
        )}
        <span className='line-clamp-2 min-w-0 flex-1 break-words'>{children}</span>
      </a>
    </li>
  );
};

TableOfContentsItem.displayName = 'TableOfContentsItem';
