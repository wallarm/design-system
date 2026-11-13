import * as z from 'zod';
import { Button } from '@wallarm-org/design-system/Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@wallarm-org/design-system/Dialog';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent } from '../core/define';

const SIZES = ['small', 'medium', 'large'] as const;
/** The DS Dialog's preset widths (px, `DIALOG_SIZES`), which it doesn't export by name. */
const WIDTH: Record<(typeof SIZES)[number], number> = { small: 400, medium: 560, large: 960 };

export const DialogComponent = defineComponent({
  name: 'Dialog',
  description:
    'A button that opens a short, focused view on demand: a confirmation summary, a request payload. Children are the content; put a Button bound to an app action inside to do the work. Prefer Drawer for long details.',
  props: z.object({
    triggerLabel: z.string().min(1).describe('The button text'),
    title: z.string().min(1),
    description: z.string().optional(),
    size: z.enum(SIZES).optional(),
  }),
  hasChildren: true,
  Skeleton: () => <Skeleton width='120px' height='36px' rounded={8} transparent={false} />,
  View: ({ props, children }) => (
    // The DS reads width once, on mount: a size that streams in later remounts the dialog.
    <Dialog key={props.size ?? 'medium'} width={WIDTH[props.size ?? 'medium']}>
      <DialogTrigger asChild>
        <Button variant='outline' color='neutral'>
          {props.triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {props.description && <DialogDescription>{props.description}</DialogDescription>}
        </DialogHeader>
        <DialogBody>
          <VStack gap={12} align='stretch' fullWidth>
            {children}
          </VStack>
        </DialogBody>
      </DialogContent>
    </Dialog>
  ),
});
