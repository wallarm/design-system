import * as z from 'zod';
import { Button, type ButtonProps } from '@wallarm-org/design-system/Button';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, subsetOf, type Values } from '../core/define';

const VARIANTS = subsetOf<Values<ButtonProps['variant']>>()(['primary', 'outline', 'ghost']);
/** Each variant's colour, checked against the DS: no ternary to drift. */
const COLOR: Record<(typeof VARIANTS)[number], Values<ButtonProps['color']>> = {
  primary: 'brand',
  outline: 'neutral',
  ghost: 'neutral',
};

export const ButtonComponent = defineComponent({
  name: 'Button',
  description:
    'Asks the app to do something. The app runs the action; side effects still go through approval.',
  props: z.object({
    label: z.string(),
    variant: z.enum(VARIANTS).optional(),
    destructive: z.boolean().optional(),
  }),
  events: ['press'],
  Skeleton: () => <Skeleton width='120px' height='36px' rounded={8} transparent={false} />,
  View: ({ props, emit }) => (
    <Button
      variant={props.variant ?? 'outline'}
      color={props.destructive ? 'destructive' : COLOR[props.variant ?? 'outline']}
      onClick={() => emit('press')}
    >
      {props.label}
    </Button>
  ),
});
