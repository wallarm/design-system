import { Toast as ArkToast } from '@ark-ui/react/toast';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';

export const ToastClose = () => {
  const testId = useTestId('close');

  return (
    <ArkToast.CloseTrigger asChild>
      <Button variant='ghost' size='small' color='neutral-alt' data-testid={testId}>
        <X size='md' />
      </Button>
    </ArkToast.CloseTrigger>
  );
};

ToastClose.displayName = 'ToastClose';
