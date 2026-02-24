import type { FC, ReactNode } from 'react';
import { Tabs as ArkUiTabs } from '@ark-ui/react/tabs';
import { cn } from '../../utils/cn';
import { segmentedControlItemClassNamesBase } from '../SegmentedControl';

export interface SegmentedTabsTriggerProps {
  children: ReactNode;
  value: string;
  disabled?: boolean;
  asChild?: boolean;
}

export const SegmentedTabsTrigger: FC<SegmentedTabsTriggerProps> = ({
  children,
  value,
  disabled = false,
  asChild = false,
}) => (
  <ArkUiTabs.Trigger
    className={cn(
      segmentedControlItemClassNamesBase,
      'group z-1',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:px-20',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:overflow-hidden',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:absolute',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:right-0',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:w-32',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:h-24',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:transition-opacity',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:opacity-0',
      '[&:has([data-slot=segmented-tabs-trigger-button]):hover]:before:opacity-100',
      '[&:has([data-slot=segmented-tabs-trigger-button]):active]:before:opacity-100',
      '[&:has([data-slot=segmented-tabs-trigger-button][data-state=open])]:before:opacity-100',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:bg-linear-to-r',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:from-transparent',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:to-20%',
      '[&:has([data-slot=segmented-tabs-trigger-button])]:before:to-bg-primary',
      '[[data-selected]:has([data-slot=segmented-tabs-trigger-button])]:before:to-bg-surface-3',
      '[&:has([data-slot=segmented-tabs-trigger-button][data-state=open])]:before:to-bg-primary',
      '[[data-selected]:has([data-slot=segmented-tabs-trigger-button][data-state=open])]:before:to-bg-surface-3',

      // segmented tabs trigger button
      '**:data-[slot=segmented-tabs-trigger-button]:absolute',
      '**:data-[slot=segmented-tabs-trigger-button]:right-2',
      '**:data-[slot=segmented-tabs-trigger-button]:top-1/2',
      '**:data-[slot=segmented-tabs-trigger-button]:-translate-y-1/2 ',
      '**:data-[slot=segmented-tabs-trigger-button]:z-1',
      '**:data-[slot=segmented-tabs-trigger-button]:overflow-visible',
      '**:data-[slot=segmented-tabs-trigger-button]:opacity-0',

      // Dropdown
      '**:data-[slot=segmented-tabs-trigger-button]:data-[state=open]:opacity-100',

      // hover text (unselected + enabled)
      'not-data-disabled:not-data-selected:hover:text-text-primary',

      // show trigger button
      'hover:[&:not([data-disabled])_[data-slot=segmented-tabs-trigger-button]]:opacity-100',

      // selected text
      'data-selected:text-text-primary',

      // // selected states
      // '[&[data-selected]_[data-slot=segmented-tabs-trigger-button]]:bg-component-outline-button-bg',
      // '[&[data-selected]_[data-slot=segmented-tabs-trigger-button][data-state=open]]:bg-bg-primary',
      // '[&[data-selected]_[data-slot=segmented-tabs-trigger-button]:hover]:bg-bg-primary',
      //
      // // unselected states
      // '[&:not([data-selected])_[data-slot=segmented-tabs-trigger-button]:not(:hover)]:bg-bg-primary',
      // '[&:not([data-selected])_[data-slot=segmented-tabs-trigger-button]:hover]:bg-component-outline-button-bg',
      // '[&:not([data-selected])_[data-slot=segmented-tabs-trigger-button][data-state=open]]:bg-component-outline-button-bg',
    )}
    value={value}
    disabled={disabled}
    asChild={asChild}
  >
    {children}
  </ArkUiTabs.Trigger>
);
