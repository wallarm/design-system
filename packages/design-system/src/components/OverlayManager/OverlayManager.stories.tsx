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
import {
  ConfirmDeleteOverlay,
  EditUserOverlay,
  SlowConfirmDeleteOverlay,
} from './stories/overlays';
import { SplitEditUserOverlay } from './stories/SplitEditUserDrawer';
import { useOverlay } from './useOverlay';

const DESCRIPTION = [
  'Opens the same `Dialog` or `Drawer` from any row, menu or drawer: describe it once with `defineOverlay`, mount one `OverlayProvider` in the root route of each app and remote, and await `useOverlay(definition).open(payload)` for the value the overlay passes to `controller.close`.',
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

/**
 * The dialog's code loads the first time it is needed. Here its loader waits 1.5 s, like a slow
 * chunk: hovering or focusing the button starts the load with `preload()`, and a click before it
 * ends opens the dialog as soon as the code arrives. The code then stays cached, so reload the
 * page to see the first load again.
 */
export const LazyLoading: StoryFn<typeof meta> = () => {
  const confirmDelete = useOverlay(SlowConfirmDeleteOverlay);
  const [code, setCode] = useState('not loaded');
  const [result, setResult] = useState('none yet');

  const loadCode = async () => {
    setCode('loading');
    await SlowConfirmDeleteOverlay.preload();
    setCode('loaded');
  };

  const handlePreload = () => loadCode();

  const handleOpen = async () => {
    // open() loads the code itself; loadCode only shows the progress of that same, shared load.
    loadCode();
    const deleted = await confirmDelete.open({ userName: 'Jane Cooper' });
    setResult(deleted ? 'deleted' : 'cancelled');
  };

  return (
    <VStack gap={12} align='start'>
      <Button
        variant='outline'
        color='neutral'
        onPointerEnter={handlePreload}
        onFocus={handlePreload}
        onClick={handleOpen}
        data-testid='open-lazy-confirm'
      >
        Delete Jane Cooper
      </Button>
      <Text data-testid='code-status'>Dialog code: {code}</Text>
      <Text data-testid='result'>Result: {result}</Text>
    </VStack>
  );
};

/**
 * A heavy overlay can show its real frame at once. Its light shell, the root with its guard and the
 * header, ships with the opener; the form below the header loads behind a skeleton that
 * `lazyOverlayBody` renders and announces. Here the form's first load takes 1.5 s. The code then
 * stays cached, so reload the page to see the skeleton again.
 */
export const SkeletonWhileLoading: StoryFn<typeof meta> = () => {
  const editUser = useOverlay(SplitEditUserOverlay);

  const handleOpen = () => editUser.open({ userName: 'Jane Cooper' });

  return (
    <Button variant='outline' color='neutral' onClick={handleOpen} data-testid='open-edit-user'>
      Edit Jane Cooper
    </Button>
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
