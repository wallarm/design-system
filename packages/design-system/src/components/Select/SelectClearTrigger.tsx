import type { FC } from 'react';

import { Select as ArkUiSelect } from '@ark-ui/react/select';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { linkVariants } from '../Link';

type SelectClearTriggerNativeProps = Omit<
  ArkUiSelect.TriggerProps,
  'className' | 'type'
>;

type SelectClearTriggerVariantsProps = VariantProps<typeof linkVariants>;

type SelectClearTriggerProps = SelectClearTriggerNativeProps &
  SelectClearTriggerVariantsProps;

export const SelectClearTrigger: FC<SelectClearTriggerProps> = ({
  type = 'default',
  size = 'sm',
  weight = 'medium',
  ...props
}) => (
  <ArkUiSelect.ClearTrigger
    {...props}
    className={cn(
      linkVariants({
        type,
        size,
        weight,
      }),
    )}
  />
);

SelectClearTrigger.displayName = 'SelectClearTrigger';
