import type { FC } from 'react';
import { Field as ArkUiField } from '@ark-ui/react/field';
import { cn } from '../../utils/cn';

type LabelProps = ArkUiField.LabelProps;

export const FieldLabel: FC<LabelProps> = props => (
  <ArkUiField.Label
    {...props}
    data-slot='field-label'
    className={cn(
      'group/field-label flex w-fit gap-4 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50',
      'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:rounded-8 has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4',
    )}
  />
);

FieldLabel.displayName = 'FieldLabel';
