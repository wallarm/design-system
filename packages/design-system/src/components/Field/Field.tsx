import type { FC, HTMLAttributes } from 'react';

import { Field as ArkUiField } from '@ark-ui/react/field';
import { Fieldset as ArkUiFieldset } from '@ark-ui/react/fieldset';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { checkContainCheckboxGroup } from './utils';

const fieldVariants = cva(
  'group/field flex w-full min-w-0 gap-4 data-[invalid=true]:text-text-danger',
  {
    variants: {
      orientation: {
        vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
        horizontal: [
          'flex-row items-center',
          '[&>[data-slot=field-label]]:flex-auto',
          'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
        responsive: [
          'flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto',
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

type FieldProps = FieldNativeProps & FieldVariantsProps & TestableProps;

export const Field: FC<FieldProps> = ({
  orientation = 'vertical',
  children,
  'data-testid': testId,
  ...props
}) => {
  const isContainCheckboxGroup = checkContainCheckboxGroup(children);

  const Comp = isContainCheckboxGroup ? ArkUiFieldset.Root : ArkUiField.Root;

  return (
    <TestIdProvider value={testId}>
      <Comp
        {...props}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Comp already selects Ark Fieldset for checkbox groups; single fields use Ark Field with its label/error wiring.
        role='group'
        data-testid={testId}
        data-slot='field'
        data-orientation={orientation}
        className={cn(fieldVariants({ orientation }))}
      >
        {children}
      </Comp>
    </TestIdProvider>
  );
};

Field.displayName = 'Field';
