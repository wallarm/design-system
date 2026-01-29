import type { ComponentProps, FC } from 'react';

import { type HTMLProps } from '@ark-ui/react/factory';
import { useFieldContext } from '@ark-ui/react/field';
import { mergeProps } from '@ark-ui/react/utils';

import { cn } from '../../utils/cn';
import { Label } from '../Label';

type LabelProps = ComponentProps<typeof Label>;

export const FieldLabel: FC<LabelProps> = (props) => {
  const field = useFieldContext();
  const mergedProps = mergeProps<HTMLProps<'label'>>(
    field?.getLabelProps(),
    props,
  );

  return (
    <Label
      {...props}
      {...mergedProps}
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-4 leading-snug group-data-[disabled=true]/field:opacity-50',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:rounded-8 has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4',
      )}
    />
  );
};

FieldLabel.displayName = 'FieldLabel';
