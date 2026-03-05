import type { FC } from 'react';
import { cn } from '../../../../utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
} from '../../../DropdownMenu';
import { MenuFooter } from '../MenuFooter';
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
  className,
}) => {
  const {
    selectedValues,
    highlightedValue,
    onHighlightChange,
    pendingIds,
    commitChecked,
    handleItemSelect,
  } = useValueMenuState({
    values, open, multiSelect, initialValues, highlightValue,
    onSelect, onCommit, onEscape, onOpenChange, onBuildingValueChange,
  });

  const widthClass = width === 'compact' ? 'w-[172px]' : 'w-[300px]';
  const widthStyle = typeof width === 'number' ? { width: `${width}px` } : undefined;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && multiSelect) commitChecked();
        onOpenChange?.(isOpen);
      }}
      closeOnSelect={false}
      positioning={positioning}
      highlightedValue={highlightedValue}
      onHighlightChange={onHighlightChange}
    >
      <DropdownMenuContent className={cn(widthClass, className)} style={widthStyle}>
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
        <MenuFooter multiSelect={multiSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

QueryBarValueMenu.displayName = 'QueryBarValueMenu';
