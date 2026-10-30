import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { WallySkeleton } from './WallySkeleton';

const meta = {
  title: 'AI/WallySkeleton',
  component: WallySkeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Use the same WallySkeleton while the host downloads the assistant remote, the remote checks access, and the runtime connects. Import it from `@wallarm-org/design-system/WallySkeleton` without loading WallyAssistant or its markdown renderer. Give the parent a height; the skeleton fills it. Placeholders and the decorative mesh are static, so remounting between loading stages preserves the image, including with reduced motion. The surface announces “Loading Wally”; override `aria-label` for localization. It has no interactive controls.',
      },
    },
  },
} satisfies Meta<typeof WallySkeleton>;

export default meta;

export const Default: StoryFn<typeof WallySkeleton> = args => (
  <div className='h-640 w-480 max-w-full'>
    <WallySkeleton {...args} data-testid='wally-loading' />
  </div>
);

export const Narrow: StoryFn<typeof WallySkeleton> = args => (
  <div className='h-640 w-320 max-w-full'>
    <WallySkeleton {...args} data-testid='wally-loading' />
  </div>
);

export const Handoff: StoryFn<typeof WallySkeleton> = args => {
  const [stage, setStage] = useState(0);

  return (
    <div className='flex flex-col gap-12'>
      <Button data-testid='next-stage' onClick={() => setStage(current => current + 1)}>
        Continue loading
      </Button>
      <div className='h-640 w-480 max-w-full'>
        <WallySkeleton key={stage} {...args} data-testid='wally-loading' />
      </div>
    </div>
  );
};

Handoff.parameters = {
  docs: {
    description: {
      story:
        'Continue loading remounts the skeleton, like replacing the host fallback with the remote’s own loading state. Its geometry, colors and background stay identical.',
    },
  },
};
