import {
  type ButtonHTMLAttributes,
  Children,
  type FC,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { Select as ArkUiSelect } from '@ark-ui/react/select';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { NumericBadge } from '../NumericBadge';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { SelectArrow } from '../Select/SelectArrow';
import {
  filterDropdownControlVariants,
  filterDropdownLabelVariants,
  filterDropdownTriggerVariants,
} from './classes';
import { FilterDropdownClear } from './FilterDropdownClear';
import { useFilterDropdownContext } from './FilterDropdownContext';

export interface FilterDropdownTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /**
   * Only a `<FilterDropdownClear />`, to replace the ✕ rendered in multi mode. The label is
   * derived from the value and is not overridable.
   */
  children?: ReactNode;
}

const CLEAR_KEYS = new Set(['Backspace', 'Delete']);

interface TruncatedTextProps {
  text: string;
  emphasis: 'name' | 'value';
  className?: string;
}

/**
 * One line that ellipsises inside the 180px trigger and shows the full text on hover. The tooltip
 * is cut off from the test-id cascade, or its trigger span would claim `{base}--trigger`.
 */
const TruncatedText: FC<TruncatedTextProps> = ({ text, emphasis, className }) => (
  <TestIdProvider value={undefined}>
    <OverflowTooltip>
      <OverflowTooltipTrigger>
        <span className={cn(filterDropdownLabelVariants({ emphasis }), className)}>{text}</span>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{text}</OverflowTooltipContent>
    </OverflowTooltip>
  </TestIdProvider>
);

const Separator: FC = () => (
  <span aria-hidden className='shrink-0 text-xs text-text-tertiary'>
    •
  </span>
);

/**
 * The 36px trigger. Dashed while unset, solid once set; reads «All …» / the value in single mode
 * and «Name», «Name • value» or «Name • N» in multi mode. In multi mode Backspace/Delete on the
 * focused trigger clears the filter.
 */
export const FilterDropdownTrigger: FC<FilterDropdownTriggerProps> = ({
  ref,
  className,
  children,
  onKeyDown,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const { label, allLabel, multiple, value, collection, clear, triggerRef } =
    useFilterDropdownContext();
  const controlTestId = useTestId('control');
  const testId = useTestId('trigger', testIdProp);

  const isSet = value.length > 0;
  const clearable = multiple && isSet;
  const labels = value.map(v => collection.stringify(v) ?? v);

  const customClear = Children.toArray(children).find(
    child => isValidElement(child) && child.type === FilterDropdownClear,
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !clearable || !CLEAR_KEYS.has(event.key)) return;
    event.preventDefault();
    clear();
  };

  let content: ReactNode;
  let composedLabel = label;
  if (!multiple) {
    content = isSet ? (
      <TruncatedText text={labels[0] ?? ''} emphasis='value' />
    ) : (
      <TruncatedText text={allLabel} emphasis='name' />
    );
    if (isSet) composedLabel = `${label}, ${labels[0]}`;
  } else if (!isSet) {
    content = <TruncatedText text={label} emphasis='name' />;
  } else if (value.length === 1) {
    content = (
      <>
        <TruncatedText text={label} emphasis='name' />
        <Separator />
        {/* Both halves ellipsise; the value keeps a few characters even next to a long name. */}
        <TruncatedText text={labels[0] ?? ''} emphasis='value' className='min-w-24' />
      </>
    );
    composedLabel = `${label}, ${labels[0]}`;
  } else {
    content = (
      <>
        <TruncatedText text={label} emphasis='name' />
        <Separator />
        <span aria-hidden className='inline-flex shrink-0'>
          <NumericBadge type='secondary' color='neutral'>
            {value.length}
          </NumericBadge>
        </span>
      </>
    );
    composedLabel = `${label}, ${value.length} selected: ${labels.join(', ')}`;
  }

  return (
    <ArkUiSelect.Control
      data-slot='filter-dropdown-control'
      data-testid={controlTestId}
      className={filterDropdownControlVariants({ applied: isSet, clearable })}
    >
      <ArkUiSelect.Trigger
        {...props}
        ref={mergeRefs(ref, triggerRef)}
        data-slot='filter-dropdown-trigger'
        data-testid={testId}
        aria-label={ariaLabel ?? composedLabel}
        onKeyDown={handleKeyDown}
        className={cn(filterDropdownTriggerVariants({ clearable }), className)}
      >
        <span className='flex min-w-0 items-center gap-4 overflow-hidden'>{content}</span>
        {!clearable && <SelectArrow className='text-icon-primary' />}
      </ArkUiSelect.Trigger>
      {customClear ?? <FilterDropdownClear />}
    </ArkUiSelect.Control>
  );
};

FilterDropdownTrigger.displayName = 'FilterDropdownTrigger';
