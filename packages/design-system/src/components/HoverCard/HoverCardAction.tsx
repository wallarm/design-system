import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';

/**
 * Button preset: variant='secondary' color='neutral' size='small' fullWidth. asChild and as pass
 * through, so <HoverCardAction asChild><a href>…</a></HoverCardAction> renders an <a>.
 */
export type HoverCardActionProps = Omit<ButtonProps, 'variant' | 'color' | 'size' | 'fullWidth'>;

export const HoverCardAction: FC<HoverCardActionProps> = ({
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('action', testIdProp);

  return (
    <Button
      {...props}
      variant='secondary'
      color='neutral'
      size='small'
      fullWidth
      data-slot='hover-card-action'
      data-testid={testId}
    />
  );
};

HoverCardAction.displayName = 'HoverCardAction';
