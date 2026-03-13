import type { FC } from 'react';
import { Alert } from '../../Alert/Alert';
import { AlertContent } from '../../Alert/AlertContent';
import { AlertDescription } from '../../Alert/AlertDescription';
import { AlertIcon } from '../../Alert/AlertIcon';
import { AlertTitle } from '../../Alert/AlertTitle';

export interface QueryBarErrorsProps {
  errors: string[];
}

export const QueryBarErrors: FC<QueryBarErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  const title =
    errors.length === 1 ? 'Filter contains 1 issue:' : `Filter contains ${errors.length} issues:`;

  return (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription lineClamp={0}>
          <ul className='list-disc ms-[21px]'>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </AlertDescription>
      </AlertContent>
    </Alert>
  );
};

QueryBarErrors.displayName = 'QueryBarErrors';
