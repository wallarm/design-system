import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';
import { useTestId } from '../../utils/testId';

type DropdownMenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export const DropdownMenuGroup: FC<DropdownMenuGroupProps> = props => {
  const id = useId();
  const testId = useTestId('group');

  return <Menu.ItemGroup data-testid={testId} {...props} id={id} />;
};

DropdownMenuGroup.displayName = 'DropdownMenuGroup';
