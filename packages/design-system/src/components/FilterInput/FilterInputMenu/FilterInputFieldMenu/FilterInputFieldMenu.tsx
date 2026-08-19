import { type FC, type RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { cn } from '../../../../utils/cn';
import { DropdownMenu, DropdownMenuContent, DropdownMenuFooter } from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';
import { buildFieldMenuSections } from '../../lib';
import type { Condition, FieldGroup, FieldMetadata, FilterInputDropdownItem } from '../../types';
import { useFieldMenuNavItems } from '../hooks/useFieldMenuNavItems';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { MenuEmptyState } from '../MenuEmptyState';
import { FieldMenuPopover } from './FieldMenuPopover';
import {
  FieldSections,
  OperatorsSection,
  RecentSection,
  SuggestionsSection,
} from './FieldMenuSections';

export interface FilterInputFieldMenuProps {
  fields: FieldMetadata[];
  /** Text from the input to filter displayed fields */
  filterText?: string;
  onSelect: (field: FieldMetadata) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recentConditions?: Condition[];
  suggestedFields?: FieldMetadata[];
  /** Optional grouping for the field list. When omitted, fields render flat. */
  fieldGroups?: FieldGroup[];
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
  onEscape?: () => void;
  positioning?: Record<string, unknown>;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Ref to the menu content (shared across menus for focus management). */
  menuRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

export const FilterInputFieldMenu: FC<FilterInputFieldMenuProps> = ({
  fields,
  filterText = '',
  onSelect,
  open = false,
  onOpenChange,
  recentConditions = [],
  suggestedFields = [],
  fieldGroups,
  onSelectAnd,
  onSelectOr,
  onEscape,
  positioning,
  inputRef,
  menuRef,
  className,
}) => {
  const limitedRecentConditions = useMemo(() => recentConditions.slice(0, 3), [recentConditions]);
  const showRecent = limitedRecentConditions.length > 0;
  const showSuggestions = suggestedFields.length > 0;

  const sections = useMemo(
    () => buildFieldMenuSections(fields, fieldGroups, filterText),
    [fields, fieldGroups, filterText],
  );

  const flatItems = useFieldMenuNavItems({
    sections,
    fields,
    filterText,
    limitedRecentConditions,
    showRecent,
    suggestedFields,
    showSuggestions,
    onSelectAnd,
    onSelectOr,
  });

  const handleItemSelect = (item: FilterInputDropdownItem) => {
    const data = item.value as { type: string; field?: FieldMetadata };
    if (data.type === 'recent' || data.type === 'field') {
      if (data.field) onSelect(data.field);
    } else if (data.type === 'and') {
      onSelectAnd?.();
    } else if (data.type === 'or') {
      onSelectOr?.();
    }
  };

  const { highlightedValue, onHighlightChange, registerItem, getItemElement } = useKeyboardNav({
    items: flatItems,
    open,
    onSelect: handleItemSelect,
    onClose: onEscape ?? (() => onOpenChange?.(false)),
    onArrowRight: () => {},
    arrowRightSelectsActive: true,
    inputRef,
    menuRef,
  });

  // Hide menu when filter text matches nothing (e.g. pasted invalid text).
  const hasResults = sections.length > 0 || !filterText;

  // The highlighted field row drives the description popover. Only true field
  // rows (grouped sections + suggestions) qualify — recent/AND/OR items and the
  // non-navigable group headers never surface it.
  const highlightedField = useMemo(() => {
    if (!highlightedValue) return undefined;
    const data = flatItems.find(i => i.id === highlightedValue)?.value as
      | { type?: string; field?: FieldMetadata }
      | undefined;
    return data?.type === 'field' ? data.field : undefined;
  }, [flatItems, highlightedValue]);

  // Read the highlighted id through a ref so `getAnchorRect` keeps a stable
  // identity: zag captures the anchor-rect getter once when the popover opens and
  // reuses it across repositions. A getter that closed over `highlightedValue`
  // directly would freeze on the row that was highlighted at open time, leaving
  // the popover behind when the highlight moves to another described row while it
  // stays open. The ref always resolves the current row; the reposition itself is
  // poked by `repositionKey` changing (see FieldMenuPopover).
  const highlightedValueRef = useRef(highlightedValue);
  highlightedValueRef.current = highlightedValue;
  const getPopoverAnchorRect = useCallback(
    () => getItemElement(highlightedValueRef.current)?.getBoundingClientRect() ?? null,
    [getItemElement],
  );

  const popoverOpen = open && hasResults && !!highlightedField?.description;
  const menuVisible = open && hasResults;

  // Re-sync the highlight to the row under the cursor when the list scrolls beneath
  // a stationary pointer (wheel/trackpad). Ark moves the highlight — and thus the
  // description popover's content and anchor — off `pointermove`, which a scroll
  // does not emit, so the highlight would otherwise stick to the row that was under
  // the cursor before the scroll while the popover drifts to that row's new (often
  // off-menu) position. On scroll we re-hit-test at the last pointer and drive the
  // highlight to the row now there via `onHighlightChange` — not a synthetic
  // `pointermove`, which zag ignores when the position is unchanged (its own guard
  // against the mouse stealing the keyboard highlight) (AS-1060). rAF-throttled.
  // Gated on the menu being visible (not just the popover) so the pointer is
  // tracked before the first scroll; skipped mid-keyboard-nav so an arrow-key
  // `scrollIntoView` can't be hijacked by a pointer resting over the menu.
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const keyboardNavRef = useRef(false);
  useEffect(() => {
    if (!menuVisible) return;
    const trackPointer = (e: PointerEvent) => {
      keyboardNavRef.current = false;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const trackKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') keyboardNavRef.current = true;
    };
    let raf = 0;
    const onScroll = () => {
      if (raf || keyboardNavRef.current) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const p = lastPointerRef.current;
        if (!p) return;
        // Resolve the menu row under the pointer (no `menuRef` dependency — it's
        // unset when the menu renders standalone). Scope by `data-filter-input-menu`
        // so a pointer resting outside this menu is ignored. Drive the highlight
        // directly via `onHighlightChange` rather than replaying a `pointermove`:
        // zag ignores a pointer event whose position is unchanged (its own guard
        // against the mouse stealing the keyboard highlight), which is exactly the
        // same-coordinate replay a scroll would produce.
        const item = document.elementFromPoint(p.x, p.y)?.closest('[role="menuitem"]');
        if (!item?.closest('[data-filter-input-menu="true"]')) return;
        const value = item.getAttribute('data-value');
        if (value) onHighlightChange({ highlightedValue: value });
      });
    };
    window.addEventListener('pointermove', trackPointer, true);
    window.addEventListener('keydown', trackKeyboard, true);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('pointermove', trackPointer, true);
      window.removeEventListener('keydown', trackKeyboard, true);
      window.removeEventListener('scroll', onScroll, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [menuVisible, onHighlightChange]);

  return (
    <>
      <DropdownMenu
        open={open && hasResults}
        onOpenChange={onOpenChange}
        closeOnSelect={false}
        positioning={positioning}
        highlightedValue={highlightedValue}
        onHighlightChange={onHighlightChange}
      >
        <DropdownMenuContent
          ref={menuRef}
          className={cn('w-[300px] max-h-[430px]', className)}
          data-slot='filter-input-field-menu'
          data-filter-input-menu='true'
        >
          {!filterText && showRecent && (
            <RecentSection
              conditions={limitedRecentConditions}
              fields={fields}
              onSelect={onSelect}
              registerItem={registerItem}
            />
          )}

          {!filterText && showSuggestions && !showRecent && (
            <SuggestionsSection
              fields={suggestedFields}
              onSelect={onSelect}
              registerItem={registerItem}
            />
          )}

          {sections.length > 0 ? (
            <FieldSections sections={sections} onSelect={onSelect} registerItem={registerItem} />
          ) : (
            <MenuEmptyState />
          )}

          {!filterText && (onSelectAnd || onSelectOr) && (
            <OperatorsSection
              onSelectAnd={onSelectAnd}
              onSelectOr={onSelectOr}
              registerItem={registerItem}
            />
          )}

          <DropdownMenuFooter className='justify-start'>
            <span className='flex items-center gap-4'>
              <KbdGroup>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </KbdGroup>
              to navigate
            </span>
            <span className='flex items-center gap-4'>
              <KbdGroup>
                <Kbd>↵</Kbd>
              </KbdGroup>
              to select
            </span>
          </DropdownMenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>

      <FieldMenuPopover
        open={popoverOpen}
        title={highlightedField?.label ?? ''}
        description={highlightedField?.description ?? ''}
        example={highlightedField?.example}
        getAnchorRect={getPopoverAnchorRect}
        repositionKey={highlightedValue}
      />
    </>
  );
};

FilterInputFieldMenu.displayName = 'FilterInputFieldMenu';
