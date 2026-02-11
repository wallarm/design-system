import type { FC, HTMLAttributes } from 'react';
import { Field as ArkUiField } from '@ark-ui/react/field';
import { Fieldset as ArkUiFieldset } from '@ark-ui/react/fieldset';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { checkContainCheckboxGroup } from './utils';

const fieldVariants = cva(
  'group/field flex gap-4 w-full min-w-0 data-[invalid=true]:text-text-danger',
  {
    variants: {
      orientation: {
        vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
        horizontal: [
          'flex-row items-center',
          '[&>[data-slot=field-label]]:flex-auto',
          'has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start',
        ],
        responsive: [
          '@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto',
          '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
          '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
);

type FieldNativeProps = Omit<HTMLAttributes<HTMLElement>, 'className'> &
  Omit<ArkUiField.RootProps, 'className'>;

type FieldVariantsProps = VariantProps<typeof fieldVariants>;

type FieldProps = FieldNativeProps & FieldVariantsProps;

export const Field: FC<FieldProps> = ({ orientation = 'vertical', children, ...props }) => {
  const isContainCheckboxGroup = checkContainCheckboxGroup(children);

  const Comp = isContainCheckboxGroup ? ArkUiFieldset.Root : ArkUiField.Root;

  return (
    <Comp
      {...props}
      role='group'
      data-slot='field'
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }))}
    >
      {children}
    </Comp>
  );
};

Field.displayName = 'Field';
