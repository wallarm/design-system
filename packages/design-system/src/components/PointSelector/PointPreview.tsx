import type { FC } from 'react';
import type { ProtonCheck } from '@wallarm-org/rules-lib';
import { useTestId } from '../../utils/testId';
import { Code } from '../Code';
import { Text } from '../Text';

export interface PointPreviewProps {
  point: string;
  check: ProtonCheck | null;
  /** The point uses a form proton reserves but does not support yet. */
  reserved: boolean;
}

/** The generated proton point and check, as copyable technical text. */
export const PointPreview: FC<PointPreviewProps> = ({ point, check, reserved }) => {
  const testId = useTestId('preview');

  return (
    <div
      data-slot='point-preview'
      data-testid={testId}
      className='flex flex-col gap-6 rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'
    >
      <Text size='xs' color='secondary'>
        Rule code (generated)
      </Text>
      <Code size='s' className='break-all'>
        {point || '—'}
      </Code>
      <Text size='xs' color='secondary'>
        Check
      </Text>
      <Code size='s' className='break-all'>
        {check ? JSON.stringify(check) : '— press Next and set the condition'}
      </Code>
      {reserved && (
        <Text size='xs' color='danger'>
          Matching key names by pattern is not supported by the engine yet. A rule that uses it will
          not work until it is.
        </Text>
      )}
    </div>
  );
};

PointPreview.displayName = 'PointPreview';
