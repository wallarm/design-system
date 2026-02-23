import { type FC, type HTMLAttributes, type Ref, useId } from 'react';
import { Menu } from '@ark-ui/react/menu';

type DropdownMenuGroupProps = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export const DropdownMenuGroup: FC<DropdownMenuGroupProps> = props => {
  const id = useId();

  return <Menu.ItemGroup {...props} id={id} />;
};

DropdownMenuGroup.displayName = 'DropdownMenuGroup';
