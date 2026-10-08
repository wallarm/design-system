import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { mergeRefs } from '../../utils/mergeRefs';
import type { TestableProps } from '../../utils/testId';
import { PopoverTrigger } from '../Popover';
import { Tag, type TagProps } from '../Tag';
import { useOverflowListContext, useOverflowListMoreTriggerRef } from './OverflowListContext';
import { OverflowListMoreCount } from './OverflowListMoreCount';

export interface OverflowListMoreTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'value'>,
    TestableProps {
  /** Defaults to `+<OverflowListMoreCount /> more`. */
  children?: ReactNode;
  size?: TagProps['size'];
  ref?: Ref<HTMLButtonElement>;
}

const DEFAULT_LABEL = (
  <>
    +<OverflowListMoreCount /> more
  </>
);

export const OverflowListMoreTrigger: FC<OverflowListMoreTriggerProps> = ({
  children = DEFAULT_LABEL,
  size,
  className,
  style,
  ref,
  'data-testid': testId,
  ...props
}) => {
  const { measuring } = useOverflowListContext();
  const triggerRef = useOverflowListMoreTriggerRef();

  if (measuring) {
    return (
      <Tag size={size} asChild>
        <button {...props} type='button' tabIndex={-1} className={className} style={style}>
          <span>{children}</span>
        </button>
      </Tag>
    );
  }

  // Native <button> so Enter/Space open the popover; Tag supplies the chip look.
  return (
    <PopoverTrigger
      {...props}
      ref={mergeRefs(ref, triggerRef ?? undefined)}
      data-testid={testId}
      asChild
    >
      <Tag size={size} asChild>
        {/* className/style go on the button: Tag drops a className prop, Slot merges this one. */}
        <button
          type='button'
          data-slot='overflow-list-more-trigger'
          className={className}
          style={style}
        >
          {/* One flex item, so Tag's gap doesn't split "+", the count and the label. */}
          <span>{children}</span>
        </button>
      </Tag>
    </PopoverTrigger>
  );
};

OverflowListMoreTrigger.displayName = 'OverflowListMoreTrigger';
