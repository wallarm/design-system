import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Ellipsis } from '../../icons';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { OverlayProvider } from './OverlayProvider';
import { ConfirmDeleteOverlay, EditUserOverlay } from './stories/overlays';
import { useOverlay } from './useOverlay';

const DESCRIPTION = [
  'Opens the same `Dialog` or `Drawer` from any row, menu or drawer: describe it once with `defineOverlay`, mount one `OverlayProvider` in the root route, and await `useOverlay(definition).open(payload)` for the value the overlay passes to `controller.close`.',
  'The overlay takes `OverlayProps` and spreads `controller.rootProps` onto its single root; for a dialog that only one control opens, a plain controlled `Dialog` is simpler.',
].join(' ');

const meta = {
  title: 'Overlay/OverlayManager',
  component: OverlayProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  decorators: [
    Story => (
      <OverlayProvider>
        <Story />
      </OverlayProvider>
    ),
  ],
} satisfies Meta<typeof OverlayProvider>;

export default meta;

/**
 * `open()` resolves with what the dialog passes to `controller.close`, or `undefined` when it is
 * dismissed.
 */
export const ConfirmDialog: StoryFn<typeof meta> = () => {
  const confirmDelete = useOverlay(ConfirmDeleteOverlay);
  const [result, setResult] = useState('none yet');

  const handleOpen = async () => {
    const deleted = await confirmDelete.open({ userName: 'Jane Cooper' });
    setResult(deleted ? 'deleted' : 'cancelled');
  };

  return (
    <VStack gap={12} align='start'>
      <Button variant='outline' color='neutral' onClick={handleOpen} data-testid='open-confirm'>
        Delete Jane Cooper
      </Button>
      <Text data-testid='result'>Result: {result}</Text>
    </VStack>
  );
};

/**
 * A menu item can open it: the dialog lives in the provider, so it outlives the menu that opened
 * it.
 */
export const FromMenuItem: StoryFn<typeof meta> = () => {
  const confirmDelete = useOverlay(ConfirmDeleteOverlay);
  const [result, setResult] = useState('none yet');

  const handleDeleteSelect = async () => {
    const deleted = await confirmDelete.open({ userName: 'Jane Cooper' });
    setResult(deleted ? 'deleted' : 'cancelled');
  };

  return (
    <VStack gap={12} align='start'>
      <HStack gap={12} align='center'>
        <Text>Jane Cooper</Text>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              color='neutral'
              aria-label='Actions for Jane Cooper'
              data-testid='row-menu'
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              variant='destructive'
              onSelect={handleDeleteSelect}
              data-testid='row-menu-delete'
            >
              Delete user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </HStack>
      <Text data-testid='result'>Result: {result}</Text>
    </VStack>
  );
};

/** An overlay can open another one, and it stacks above in the same provider. */
export const StackedOverlays: StoryFn<typeof meta> = () => {
  const editUser = useOverlay(EditUserOverlay);

  const handleOpen = () => editUser.open({ userName: 'Jane Cooper' });

  return (
    <Button variant='outline' color='neutral' onClick={handleOpen} data-testid='open-edit-user'>
      Edit Jane Cooper
    </Button>
  );
};

/** The drawer intercepts `onOpenChange(false)` and opens a managed guard before it closes. */
export const UnsavedChangesGuard: StoryFn<typeof meta> = () => {
  const editUser = useOverlay(EditUserOverlay);

  const handleOpen = () => editUser.open({ userName: 'Jane Cooper' });

  return (
    <Button variant='outline' color='neutral' onClick={handleOpen} data-testid='open-edit-user'>
      Edit Jane Cooper
    </Button>
  );
};
