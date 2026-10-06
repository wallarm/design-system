import {
  type ButtonHTMLAttributes,
  type FC,
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
} from 'react';
import { ChevronDown, ChevronRight, X } from '../../icons';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  filterDropdownClearClassName,
  filterDropdownControlVariants,
  filterDropdownLabelVariants,
  filterDropdownTriggerVariants,
} from '../FilterDropdown/classes';
import { useFilterCascadeContext } from './FilterCascadeContext';

export interface FilterCascadeTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
}

const CLEAR_KEYS = new Set(['Backspace', 'Delete']);

/**
 * The 36px pill, as `FilterDropdown` draws it: dashed while unset, solid once a path is picked.
 * It reads «Name» and then «Name · ● a › ● b»; only the earlier segments truncate, the last one
 * stays whole. The ✕ clears the path; so do Backspace and Delete on the focused trigger.
 */
export const FilterCascadeTrigger: FC<FilterCascadeTriggerProps> = ({
  ref,
  className,
  onKeyDown,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api, label, path, clear, triggerRef } = useFilterCascadeContext();
  const testId = useTestId('trigger', testIdProp);
  const controlTestId = useTestId('control');
  const clearTestId = useTestId('clear');
  const isSet = path.length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isSet || !CLEAR_KEYS.has(event.key)) return;
    event.preventDefault();
    clear();
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // The ✕ unmounts once the path is empty; move focus first so it is not dropped on <body>.
    triggerRef.current?.focus();
    clear();
  };

  return (
    <div
      {...api.getControlProps()}
      data-slot='filter-cascade-control'
      data-testid={controlTestId}
      // A path is wider than one value: lift the 180px cap (`max-w-none` is the 0 spacing token
      // here), the segments truncate on their own.
      className={cn(
        filterDropdownControlVariants({ applied: isSet, clearable: isSet }),
        'max-w-full',
      )}
    >
      <button
        {...props}
        {...api.getTriggerProps()}
        ref={mergeRefs(ref, triggerRef)}
        // `filter-dropdown-trigger` so the pill's focus ring follows this button too.
        data-slot='filter-dropdown-trigger'
        data-testid={testId}
        // No label part: the name is ours, so drop Zag's pointer to a missing <label>.
        aria-labelledby={undefined}
        aria-label={
          ariaLabel ?? (isSet ? `${label}, ${path.map(n => n.label).join(' › ')}` : label)
        }
        onKeyDown={handleKeyDown}
        className={cn(filterDropdownTriggerVariants({ clearable: isSet }), className)}
      >
        <span className='flex min-w-0 items-center gap-4 overflow-hidden'>
          <span className={filterDropdownLabelVariants({ emphasis: 'name' })}>{label}</span>
          {isSet && (
            <span aria-hidden className='shrink-0 text-xs text-text-tertiary'>
              •
            </span>
          )}
          {path.map((node, index) => {
            const last = index === path.length - 1;
            return (
              <Fragment key={node.value}>
                {index > 0 && <ChevronRight size='sm' className='shrink-0 text-icon-secondary' />}
                {node.icon}
                <span
                  className={cn(
                    filterDropdownLabelVariants({ emphasis: 'value' }),
                    last ? 'shrink-0' : 'max-w-120',
                  )}
                  title={node.label}
                >
                  {node.label}
                </span>
              </Fragment>
            );
          })}
        </span>
        {!isSet && (
          <ChevronDown
            size='md'
            className='ml-auto text-icon-primary transition-transform data-[state=open]:rotate-180'
          />
        )}
      </button>
      {isSet && (
        <button
          type='button'
          data-slot='filter-cascade-clear'
          data-testid={clearTestId}
          aria-label={`Clear ${label}`}
          disabled={api.disabled}
          onClick={handleClear}
          className={filterDropdownClearClassName}
        >
          <X size='md' />
        </button>
      )}
    </div>
  );
};

FilterCascadeTrigger.displayName = 'FilterCascadeTrigger';
