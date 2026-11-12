import type { FC, HTMLAttributes } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { useFieldsetContext } from '@ark-ui/react/fieldset';
import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

type FieldErrorProps = HTMLAttributes<HTMLDivElement>;

export const FieldError: FC<FieldErrorProps> = ({ children, ...props }) => {
  const testId = useTestId('error');
  // Ark's error-text props (id) let an invalid Field/Fieldset wire the control to this message.
  // Prop getter, not Ark's ErrorText part: the part renders only when invalid, this always does.
  const field = useFieldContext();
  const fieldset = useFieldsetContext();
  const errorTextProps = (field ?? fieldset)?.getErrorTextProps();

  return (
    <div
      {...errorTextProps}
      // role=alert's implicit value; overrides the aria-live=polite Ark's getter adds.
      aria-live='assertive'
      {...props}
      data-testid={testId}
      role='alert'
      data-slot='field-error'
      className={cn('flex gap-4 text-text-danger')}
    >
      <OctagonAlert size='md' className='self-start my-2' />

      <Text size='sm' color='danger'>
        {children}
      </Text>
    </div>
  );
};

FieldError.displayName = 'FieldError';
