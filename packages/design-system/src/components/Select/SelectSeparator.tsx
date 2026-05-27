import type { FC, HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';

export type SelectSeparatorProps = HTMLAttributes<HTMLHRElement> & {
  ref?: Ref<HTMLHRElement>;
};

export const SelectSeparator: FC<SelectSeparatorProps> = ({ className, ref, ...props }) => {
  const testId = useTestId('separator');

  // A Select separator is purely decorative. ark-ui's Select has no Separator
  // part, so render a plain divider instead of DropdownMenuSeparator — the
  // latter renders ark-ui's Menu.Separator, which reads from a Menu context
  // that does not exist inside a Select and throws (`getSeparatorProps` of
  // undefined).
  return (
    <hr
      ref={ref}
      data-slot='select-separator'
      data-testid={testId}
      aria-orientation='horizontal'
      className={cn('mx-8 my-4 h-px bg-border-primary border-none', className)}
      {...props}
    />
  );
};

SelectSeparator.displayName = 'SelectSeparator';
