import * as z from 'zod';
import { Button } from '@wallarm-org/design-system/Button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  type DrawerProps,
  DrawerTitle,
  DrawerTrigger,
} from '@wallarm-org/design-system/Drawer';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { defineComponent } from '../core/define';

/** The DS Drawer's preset widths, in px. */
const WIDTH = {
  small: 640,
  medium: 960,
  large: 1130,
} satisfies Record<string, NonNullable<DrawerProps['width']>>;

export const DrawerComponent = defineComponent({
  name: 'Drawer',
  description:
    'A button that opens a side panel with its children: details the user opens on demand (a full request, an incident breakdown). Opening has no side effects; put a Button bound to an app action inside to do something. For a table row’s details prefer Table detail.',
  props: z.object({
    triggerLabel: z.string().min(1).describe('The button text'),
    title: z.string(),
    description: z.string().optional(),
    width: z.enum(['small', 'medium', 'large']).optional(),
  }),
  hasChildren: true,
  Skeleton: () => <Skeleton width='120px' height='36px' rounded={8} transparent={false} />,
  View: ({ props, children }) => (
    // The DS reads width once, on mount: a width that streams in later remounts the drawer.
    <Drawer key={props.width ?? 'medium'} width={WIDTH[props.width ?? 'medium']}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral'>
          {props.triggerLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{props.title}</DrawerTitle>
          {props.description && <DrawerDescription>{props.description}</DrawerDescription>}
        </DrawerHeader>
        <DrawerBody>
          <VStack gap={12} align='stretch' fullWidth>
            {children}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  ),
});
