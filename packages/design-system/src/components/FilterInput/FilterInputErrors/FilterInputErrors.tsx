import type { FC } from 'react';
import { Alert } from '../../Alert/Alert';
import { AlertContent } from '../../Alert/AlertContent';
import { AlertIcon } from '../../Alert/AlertIcon';
import { AlertTitle } from '../../Alert/AlertTitle';

export interface FilterInputErrorsProps {
  errors: string[];
}

export const FilterInputErrors: FC<FilterInputErrorsProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  const title =
    errors.length === 1 ? 'Filter contains 1 issue:' : `Filter contains ${errors.length} issues:`;

  return (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>{title}</AlertTitle>
        {/* Rendered directly inside AlertContent (a <div>) instead of AlertDescription —
            AlertDescription wraps its children in <Text> (<p>), and a <ul> inside <p>
            is invalid HTML and triggers a hydration error. */}
        <ul className='list-disc ms-[21px] text-sm text-text-secondary'>
          {errors.map((err, idx) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: errors may repeat (same message for different chips); idx disambiguates
            <li key={idx}>{err}</li>
          ))}
        </ul>
      </AlertContent>
    </Alert>
  );
};

FilterInputErrors.displayName = 'FilterInputErrors';
