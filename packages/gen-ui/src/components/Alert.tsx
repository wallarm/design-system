import { z } from 'zod';
import {
  Alert,
  type AlertColor,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@wallarm-org/design-system/Alert';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, subsetOf } from '../core/define';

export const AlertComponent = defineComponent({
  name: 'Alert',
  description: 'A highlighted message about something the user should know or act on.',
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    tone: z.enum(subsetOf<AlertColor>()(['info', 'warning', 'destructive', 'success'])).optional(),
  }),
  Skeleton: () => <Skeleton width='100%' height='56px' rounded={12} transparent={false} />,
  View: ({ props }) => (
    <Alert color={props.tone ?? 'info'} minWidth={0}>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>{props.title}</AlertTitle>
        {props.description && <AlertDescription>{props.description}</AlertDescription>}
      </AlertContent>
    </Alert>
  ),
});
