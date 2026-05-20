import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { useTestId } from '../../utils/testId';

export interface DropdownMenuRadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  onValueChange?: (details: { value: string }) => void;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuRadioGroup: FC<DropdownMenuRadioGroupProps> = ({
  value,
  onValueChange,
  ...props
}) => {
  const id = useId();
  const testId = useTestId('radio-group');

  return (
    <Menu.RadioItemGroup
      {...props}
      id={id}
      value={value}
      onValueChange={onValueChange}
      data-testid={testId}
    />
  );
};

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
