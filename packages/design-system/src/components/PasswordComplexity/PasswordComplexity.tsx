import type { FC, ReactNode, Ref } from 'react';
import { Check } from '../../icons/Check';
import { Dot } from '../../icons/Dot';
import { cn } from '../../utils/cn';
import { List, type ListProps } from '../List';
import { ListIcon } from '../List/ListIcon';
import { ListItem } from '../List/ListItem';
import { passwordComplexityIconVariants, passwordComplexityLabelVariants } from './classes';

export type PasswordComplexityItemId =
  | 'length'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'symbol'
  | 'match';

export interface PasswordComplexityItem {
  id: PasswordComplexityItemId;
  label: ReactNode;
  met: boolean;
}

export interface PasswordComplexityProps
  extends Omit<ListProps, 'children' | 'variant' | 'marker'> {
  ref?: Ref<HTMLElement>;
  items: PasswordComplexityItem[];
}

export const PasswordComplexity: FC<PasswordComplexityProps> = ({
  ref,
  items,
  spacing = 4,
  className,
  ...props
}) => (
  <List {...props} ref={ref} spacing={spacing} className={cn(className)}>
    {items.map(item => (
      <ListItem key={item.id}>
        <ListIcon className={passwordComplexityIconVariants({ met: item.met })}>
          {item.met ? <Check size='md' /> : <Dot size='md' />}
        </ListIcon>
        <span className={passwordComplexityLabelVariants({ met: item.met })}>{item.label}</span>
      </ListItem>
    ))}
  </List>
);

PasswordComplexity.displayName = 'PasswordComplexity';
