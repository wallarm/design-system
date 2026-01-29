import type { FC, HTMLAttributes } from 'react';

import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { Text } from '../Text';

type FieldErrorProps = HTMLAttributes<HTMLDivElement>;

export const FieldError: FC<FieldErrorProps> = ({ children, ...props }) => (
  <div
    {...props}
    role="alert"
    data-slot="field-error"
    className={cn('flex gap-4 text-text-danger')}
  >
    <OctagonAlert size="md" className="self-start my-2" />

    <Text size="sm" color="danger">
      {children}
    </Text>
  </div>
);

FieldError.displayName = 'FieldError';
