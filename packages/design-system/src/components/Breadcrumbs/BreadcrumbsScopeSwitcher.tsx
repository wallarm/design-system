import type { FC, ReactNode, Ref } from 'react';
import { Check, ChevronUpDown } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemText,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '../DropdownMenu';

export interface ScopeSwitcherItem {
  id: string;
  label: string;
  description?: string;
  href: string;
}

export interface BreadcrumbsScopeSwitcherProps {
  ref?: Ref<HTMLButtonElement>;
  value: string;
  items: ScopeSwitcherItem[];
  onSelect: (item: ScopeSwitcherItem) => void;
  children: ReactNode;
  className?: string;
  /** @internal - set automatically by parent */
  isCurrent?: boolean;
}

export const BreadcrumbsScopeSwitcher: FC<BreadcrumbsScopeSwitcherProps> = ({
  ref,
  value,
  items,
  onSelect,
  children,
  className,
  isCurrent = false,
}) => {
  const testId = useTestId('scope-switcher');

  return (
    <li>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={ref}
            type='button'
            aria-haspopup='dialog'
            data-slot='breadcrumbs-scope-switcher'
            data-testid={testId}
            className={cn(
              'flex items-center gap-4 rounded-6 px-4 py-0 text-sm transition-colors',
              'hover:bg-states-primary-hover active:bg-states-primary-pressed cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
              isCurrent ? 'font-medium text-text-primary' : 'font-normal text-text-secondary',
              className,
            )}
          >
            {children}
            <ChevronUpDown size='sm' className='text-text-secondary' />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map(item => (
            <DropdownMenuItem key={item.id} onSelect={() => onSelect(item)}>
              <DropdownMenuItemText>
                <span className='flex flex-col'>
                  <span>{item.label}</span>
                  {item.description && (
                    <span className='text-xs text-text-secondary'>{item.description}</span>
                  )}
                </span>
              </DropdownMenuItemText>
              {item.id === value && (
                <DropdownMenuShortcut>
                  <Check size='sm' />
                </DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
};

BreadcrumbsScopeSwitcher.displayName = 'BreadcrumbsScopeSwitcher';
