import type { FC, ReactNode, RefObject } from 'react';
import { useTestId } from '../../../utils/testId';
import { Button } from '../../Button';
import { Checkmark } from '../../Checkmark';
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
} from '../../DropdownMenu';
import { Kbd } from '../../Kbd';
import { Text } from '../../Text';
import { liftLayer } from './liftLayer';
import { MenuFooterHints } from './MenuFooterHints';
import { PointSelectorEmptyState } from './PointSelectorEmptyState';
import type { MenuFooter, MenuRow } from './types';

interface Props {
  open: boolean;
  /** The menu's id. The anchor names it in `aria-controls`: a modal drawer's
   *  focus trap lets focus into the portaled menu only when an expanded
   *  element inside the drawer controls it. */
  contentId: string;
  /** The element the menu hangs under (the query bar). */
  anchorRef: RefObject<HTMLElement | null>;
  /** The input the user types in; keeps keyboard focus while the menu is open. */
  focusRef: RefObject<HTMLInputElement | null>;
  title: string;
  rows: MenuRow[];
  highlightedId: string | null;
  status?: string;
  footer: MenuFooter;
  escLabel: string;
  /** Content above the rows: the name input of a name step. */
  header?: ReactNode;
  applyLabel?: string;
  /** Nothing is ticked yet: the apply button is shown but inactive. */
  applyDisabled?: boolean;
  onApply?: () => void;
  onHighlight: (id: string) => void;
  onChoose: (id: string) => void;
  onClose: () => void;
  /** Show examples when no segments chosen */
  showExamples?: boolean;
  /** Called when example is clicked */
  onSelectExample?: (point: string) => void;
}

/**
 * A design-system dropdown menu anchored to the query bar, like the
 * FilterInput menu: a question, rows with a muted second line, the option's
 * number on the right, ticks for a multi-select, keyboard hints in the footer.
 * Keyboard focus stays in `focusRef`; the highlight is controlled.
 */
export const StepMenu: FC<Props> = ({
  open,
  contentId,
  anchorRef,
  focusRef,
  title,
  rows,
  highlightedId,
  status,
  footer,
  escLabel,
  header,
  applyLabel,
  applyDisabled,
  onApply,
  onHighlight,
  onChoose,
  onClose,
  showExamples,
  onSelectExample,
}) => {
  const testId = useTestId('menu');

  return (
    <DropdownMenu
      open={open}
      ids={{ content: contentId }}
      onOpenChange={next => !next && onClose()}
      closeOnSelect={false}
      highlightedValue={highlightedId}
      onHighlightChange={d => d.highlightedValue && onHighlight(d.highlightedValue)}
      positioning={{
        placement: 'bottom-start',
        // Always below the bar: flipping above it whenever the space below runs
        // short made the menu jump between the two sides while choosing.
        flip: false,
        gutter: 6,
        getAnchorRect: () => anchorRef.current?.getBoundingClientRect() ?? null,
      }}
    >
      <DropdownMenuContent
        ref={liftLayer}
        data-slot='step-menu'
        data-testid={testId}
        role='listbox'
        id={contentId}
        className='w-[460px]'
        // Below the bar only: never taller than the room left under it, so the
        // list scrolls instead of running off the screen.
        style={{ maxHeight: 'min(460px, var(--available-height))' }}
        data-point-selector-menu='true'
        data-rules-layer='true'
        // The menu focuses itself when it opens or a row is clicked; typing goes
        // on in the input, as in the FilterInput query bar.
        onFocus={e => {
          if (e.target !== focusRef.current) focusRef.current?.focus();
        }}
      >
        {header}
        {showExamples && rows.length === 0 ? (
          <PointSelectorEmptyState onSelectExample={onSelectExample} />
        ) : (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuGroup className='flex flex-col gap-1'>
              {rows.map(row => (
                <DropdownMenuItem
                  key={row.id}
                  value={row.id}
                  role='option'
                  aria-selected={row.id === highlightedId}
                  onClick={() => onChoose(row.id)}
                >
                  {row.checked !== undefined && <Checkmark checkedState={row.checked} />}
                  <DropdownMenuItemContent>
                    <DropdownMenuItemText>{row.label}</DropdownMenuItemText>
                    {row.desc && (
                      <DropdownMenuItemDescription>
                        <span className={row.custom ? 'text-text-brand' : undefined}>
                          {row.desc}
                        </span>
                      </DropdownMenuItemDescription>
                    )}
                  </DropdownMenuItemContent>
                  {row.number !== undefined && (
                    <DropdownMenuShortcut>
                      <Kbd size='small'>{row.number}</Kbd>
                    </DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            {status && (
              <div className='px-8 py-6' role='status' aria-live='polite' aria-atomic='true'>
                <Text size='sm' color='secondary'>
                  {status}
                </Text>
              </div>
            )}
          </>
        )}
        {onApply && (
          <div className='flex justify-end px-4 pt-4'>
            <Button
              variant='primary'
              color='brand'
              size='small'
              disabled={applyDisabled}
              onClick={onApply}
            >
              {applyLabel}
            </Button>
          </div>
        )}
        <DropdownMenuFooter className='justify-start'>
          <MenuFooterHints variant={footer} escLabel={escLabel} />
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

StepMenu.displayName = 'StepMenu';
