import type { FC } from 'react';
import { Button } from '../../Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../Dialog';
import type { OverlayProps } from '../types';

interface ConfirmDeleteDialogProps extends OverlayProps<boolean> {
  userName: string;
}

/** Story-only overlay: `close(true)` confirms; Cancel, Escape and an outside click dismiss. */
export const ConfirmDeleteDialog: FC<ConfirmDeleteDialogProps> = ({ userName, controller }) => {
  const handleDelete = () => controller.close(true);

  return (
    <Dialog {...controller.rootProps} width={400} data-testid='confirm-delete'>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user?</DialogTitle>
          <DialogDescription>
            This permanently deletes {userName} and all their access. You can't undo this.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='ghost' color='neutral' data-testid='confirm-delete-cancel'>
              Cancel
            </Button>
          </DialogClose>
          <Button color='destructive' onClick={handleDelete} data-testid='confirm-delete-submit'>
            Delete user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ConfirmDeleteDialog.displayName = 'ConfirmDeleteDialog';
