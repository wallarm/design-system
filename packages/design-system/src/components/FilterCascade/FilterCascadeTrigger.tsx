import {
  type ButtonHTMLAttributes,
  Children,
  type FC,
  Fragment,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronDown, ChevronRight } from '../../icons';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { type TestableProps, useTestId } from '../../utils/testId';
import {
  filterDropdownControlVariants,
  filterDropdownLabelVariants,
  filterDropdownTriggerVariants,
} from '../FilterDropdown/classes';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { FilterCascadeClear } from './FilterCascadeClear';
import { useFilterCascadeContext } from './FilterCascadeContext';

export interface FilterCascadeTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /** Only a `<FilterCascadeClear />`, to replace the default ✕ (for example to add attributes). */
  children?: ReactNode;
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
  children,
  onKeyDown,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const { api, accessors, label, path, clear, triggerRef } = useFilterCascadeContext();
  const fullPath = path.map(node => node.label).join(' › ');
  const testId = useTestId('trigger', testIdProp);
  const controlTestId = useTestId('control');
  const isSet = path.length > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isSet || !CLEAR_KEYS.has(event.key)) return;
    event.preventDefault();
    clear();
  };

  const customClear = Children.toArray(children).find(
    child => isValidElement(child) && child.type === FilterCascadeClear,
  );

  const control = (
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
        aria-label={ariaLabel ?? (isSet ? `${label}, ${fullPath}` : label)}
        onKeyDown={handleKeyDown}
        className={cn(filterDropdownTriggerVariants({ clearable: isSet }), className)}
      >
        <span className='flex min-w-0 items-center gap-4 overflow-hidden'>
          <span className={filterDropdownLabelVariants({ emphasis: 'name' })}>{label}</span>
          {/* Figma: each level is a dotted text badge (xs medium, 20px), › between them. Only the
              earlier segments truncate, at 120px; the last one never does. */}
          {path.length > 0 && (
            <span className='flex min-w-0 items-center'>
              {path.map((node, index) => {
                const last = index === path.length - 1;
                const icon = node.data === undefined ? null : accessors.getIcon?.(node.data);
                return (
                  <Fragment key={node.value}>
                    {index > 0 && (
                      <ChevronRight size='sm' className='shrink-0 text-icon-secondary' />
                    )}
                    <span
                      data-slot='filter-cascade-segment'
                      className={cn(
                        'inline-flex h-20 min-w-0 items-center gap-4 px-6 text-xs font-medium',
                        last ? 'shrink-0' : 'max-w-120',
                      )}
                    >
                      {icon}
                      <span className='truncate'>{node.label}</span>
                    </span>
                  </Fragment>
                );
              })}
            </span>
          )}
        </span>
        {!isSet && (
          <ChevronDown
            size='md'
            className='ml-auto text-icon-primary transition-transform data-[state=open]:rotate-180'
          />
        )}
      </button>
      {customClear ?? <FilterCascadeClear />}
    </div>
  );

  // Figma: the tooltip carries the whole chain, whatever the pill truncated.
  if (!isSet) return control;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{control}</TooltipTrigger>
      <TooltipContent>
        {label} — {fullPath}
      </TooltipContent>
    </Tooltip>
  );
};

FilterCascadeTrigger.displayName = 'FilterCascadeTrigger';
