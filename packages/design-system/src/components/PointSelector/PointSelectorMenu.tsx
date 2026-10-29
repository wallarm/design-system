import type { FC, HTMLAttributes, RefObject } from 'react';
import type { CompletionItem } from '@wallarm-org/rules-lib';
import { useTestId } from '../../utils/testId';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemDescription,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from '../DropdownMenu';
import { Kbd } from '../Kbd';
import { MenuFooterHints } from './MenuFooterHints';

export interface PointSelectorMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Whether menu is open */
  open: boolean;
  /** Menu content ID for ARIA */
  contentId?: string;
  /** Anchor element for positioning */
  anchorRef?: RefObject<HTMLElement | null>;
  /** Input element to keep focus */
  focusRef?: RefObject<HTMLInputElement | null>;
  /** Completion items from SDK */
  items: CompletionItem[];
  /** Currently highlighted item ID */
  highlightedId?: string | null;
  /** Called when item is selected */
  onSelect: (item: CompletionItem) => void;
  /** Called when highlight changes */
  onHighlight?: (id: string) => void;
  /** Called when menu should close */
  onClose?: () => void;
  /** Whether this is name/key mode */
  isNameMode?: boolean;
}

/**
 * Point Selector Menu Component
 *
 * DropdownMenu-based autocomplete matching rules-frontend StepMenu.
 * Uses DropdownMenu for positioning, z-index, and accessibility.
 */
export const PointSelectorMenu: FC<PointSelectorMenuProps> = ({
  open,
  contentId,
  anchorRef,
  focusRef,
  items,
  highlightedId,
  onSelect,
  onHighlight,
  onClose,
  isNameMode = false,
  ...props
}) => {
  const testId = useTestId('menu');

  // Group items by category
  const grouped = items.reduce(
    (acc, item, index) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category]?.push({ item, index });
      return acc;
    },
    {} as Record<string, Array<{ item: CompletionItem; index: number }>>,
  );

  // Only show first 9 items with numbers
  const visibleItems = items.slice(0, 9);

  return (
    <DropdownMenu
      open={open}
      ids={contentId ? { content: contentId } : undefined}
      onOpenChange={next => !next && onClose?.()}
      closeOnSelect={false}
      closeOnInteractOutside={false}
      highlightedValue={highlightedId ?? undefined}
      onHighlightChange={d => d.highlightedValue && onHighlight?.(d.highlightedValue)}
      positioning={{
        placement: 'bottom-start',
        flip: false,
        gutter: 6,
        getAnchorRect: () => anchorRef?.current?.getBoundingClientRect() ?? null,
      }}
    >
      <DropdownMenuContent
        {...props}
        data-slot='point-selector-menu'
        data-testid={testId}
        role='listbox'
        id={contentId}
        className='w-[460px]'
        style={{ maxHeight: 'min(460px, var(--available-height))' }}
      >
        <DropdownMenuLabel>Choose next step</DropdownMenuLabel>
        <DropdownMenuGroup className='flex flex-col gap-1'>
          {Object.entries(grouped).map(([category, categoryItems]) => {
            const relevantItems = categoryItems.filter(({ index }) => index < 9);
            if (relevantItems.length === 0) return null;

            return (
              <div key={category}>
                {categoryItems.map(({ item, index }) => {
                  if (index >= 9) return null;
                  const displayNumber = index + 1;
                  const itemId = `item-${index}`;

                  return (
                    <DropdownMenuItem
                      key={itemId}
                      value={itemId}
                      role='option'
                      aria-selected={itemId === highlightedId}
                      onSelect={() => onSelect(item)}
                    >
                      <DropdownMenuItemContent>
                        <DropdownMenuItemText>{item.label}</DropdownMenuItemText>
                        {item.detail && (
                          <DropdownMenuItemDescription>{item.detail}</DropdownMenuItemDescription>
                        )}
                      </DropdownMenuItemContent>
                      <DropdownMenuShortcut>
                        <Kbd size='small'>{displayNumber}</Kbd>
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuFooter>
          <MenuFooterHints variant={isNameMode ? 'name' : 'list'} escLabel='to close' />
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

PointSelectorMenu.displayName = 'PointSelectorMenu';
