import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface DropdownMenuRadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>,
    TestableProps {
  value?: string;
  onValueChange?: (details: { value: string }) => void;
  ref?: Ref<HTMLDivElement>;
}

export const DropdownMenuRadioGroup: FC<DropdownMenuRadioGroupProps> = ({
  value,
  onValueChange,
  id: idProp,
  'data-testid': testIdProp,
  ...props
}) => {
  const autoId = useId();
  const testId = useTestId('radio-group', testIdProp);

  return (
    <Menu.RadioItemGroup
      {...props}
      id={idProp ?? autoId}
      value={value}
      onValueChange={onValueChange}
      data-testid={testId}
    />
  );
};

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
