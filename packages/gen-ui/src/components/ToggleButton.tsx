import * as z from 'zod';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { ToggleButton } from '@wallarm-org/design-system/ToggleButton';
import { defineComponent } from '../core/define';

export const ToggleButtonComponent = defineComponent({
  name: 'ToggleButton',
  description:
    'A button that stays pressed, for something flipped in place next to what it affects: hold a filter on, show only blocked requests. Bind pressed two-way to a path. A setting in a form is Switch; a yes/no answer is Checkbox; one of several options is SegmentedControl.',
  props: z.object({
    label: z.string(),
    pressed: z.boolean().optional().describe('Bind two-way; a literal is the starting state'),
  }),
  bindable: ['pressed'],
  Skeleton: () => <Skeleton width='120px' height='32px' transparent={false} />,
  View: ({ props, set }) => (
    <ToggleButton
      active={props.pressed ?? false}
      aria-pressed={props.pressed ?? false}
      onToggle={pressed => set('pressed', pressed)}
    >
      {props.label}
    </ToggleButton>
  ),
});
