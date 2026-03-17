import { Toast as ArkToast } from '@ark-ui/react/toast';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export const ToastClose = () => {
  const testId = useTestId('close');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ArkToast.CloseTrigger asChild>
          <Button
            variant='ghost'
            size='small'
            color='neutral-alt'
            aria-label='Close'
            data-testid={testId}
          >
            <X size='md' />
          </Button>
        </ArkToast.CloseTrigger>
      </TooltipTrigger>
      <TooltipContent>Close</TooltipContent>
    </Tooltip>
  );
};

ToastClose.displayName = 'ToastClose';
