import { Toast as ArkToast } from '@ark-ui/react/toast';

import { X } from '../../icons';
import { Button } from '../Button';

export const ToastClose = () => {
  return (
    <ArkToast.CloseTrigger asChild>
      <Button variant="ghost" size="small" color="neutral-alt">
        <X size="md" />
      </Button>
    </ArkToast.CloseTrigger>
  );
};

ToastClose.displayName = 'ToastClose';
