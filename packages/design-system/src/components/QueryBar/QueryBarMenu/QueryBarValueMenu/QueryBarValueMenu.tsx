import type { FC, RefObject } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuGroup,
} from '../../../DropdownMenu';
import { Kbd } from '../../../Kbd/Kbd';
import { KbdGroup } from '../../../Kbd/KbdGroup';
import { MenuEmptyState } from '../MenuEmptyState';
import { ValueMenuItem } from './ValueMenuItem';
import { useValueMenuState } from './useValueMenuState';

export interface ValueOption {
  value: string | number | boolean;
  label: string;
  badge?: { color: string; text: string };
  hasSubmenu?: boolean;
}

type ConditionValue = string | number | boolean;

export interface QueryBarValueMenuProps {
  values: ValueOption[];
  onSelect: (value: ValueOption['value']) => void;
  onCommit?: (values: ConditionValue[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiSelect?: boolean;
  initialValues?: ConditionValue[];
  highlightValue?: ConditionValue;
  onEscape?: () => void;
  width?: 'standard' | 'compact' | number;
  positioning?: Record<string, unknown>;
  onBuildingValueChange?: (preview: string | undefined) => void;
  /** Ref to the query bar input — ArrowUp on first item returns focus here */
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
}

export const QueryBarValueMenu: FC<QueryBarValueMenuProps> = ({
  values,
  onSelect,
  onCommit,
  open = false,
  onOpenChange,
  onEscape,
  multiSelect = false,
  initialValues = [],
  highlightValue,
  width = 'standard',
  positioning,
  onBuildingValueChange,
  inputRef,
  className,
}) => {
  const {
    selectedValues,
    highlightedValue,
    onHighlightChange,
    pendingIds,
    handleItemSelect,
  } = useValueMenuState({
    values, open, multiSelect, initialValues, highlightValue,
    onSelect, onCommit, onEscape, onOpenChange, onBuildingValueChange, inputRef,
  });

  const widthClass = width === 'compact' ? 'w-[172px]' : 'w-[300px]';
  const widthStyle = typeof width === 'number' ? { width: `${width}px` } : undefined;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={onOpenChange}
      closeOnSelect={false}
      positioning={positioning}
      highlightedValue={highlightedValue}
      onHighlightChange={onHighlightChange}
    >
      <DropdownMenuContent className={cn(widthClass, className)} style={widthStyle}>
        {values.length > 0 ? (
          <DropdownMenuGroup>
            {values.map(option => (
              <ValueMenuItem
                key={String(option.value)}
                option={option}
                isChecked={selectedValues.includes(option.value)}
                isPending={pendingIds.has(String(option.value))}
                multiSelect={multiSelect}
                onSelect={() => handleItemSelect({ id: String(option.value), label: option.label, value: option.value })}
              />
            ))}
          </DropdownMenuGroup>
        ) : (
          <MenuEmptyState />
        )}
        <DropdownMenuFooter>
          {multiSelect ? (
            <>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>↵</Kbd></KbdGroup>
                to select
              </span>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>⌘</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd></KbdGroup>
                to multi-select
              </span>
            </>
          ) : (
            <>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>↑</Kbd><Kbd>↓</Kbd></KbdGroup>
                to navigate
              </span>
              <span className='flex items-center gap-4'>
                <KbdGroup><Kbd>↵</Kbd></KbdGroup>
                to select
              </span>
            </>
          )}
        </DropdownMenuFooter>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarValueMenu.displayName = 'QueryBarValueMenu';
