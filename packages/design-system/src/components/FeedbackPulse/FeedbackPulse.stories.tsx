import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { FeedbackPulse } from './FeedbackPulse';

const meta = {
  title: 'Overlay/FeedbackPulse',
  component: FeedbackPulse,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FeedbackPulse>;

export default meta;

export const Playground: StoryFn<typeof meta> = args => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ minHeight: '60vh' }}>
      <Button variant='outline' color='neutral' onClick={() => setOpen(true)}>
        Show FeedbackPulse
      </Button>
      <FeedbackPulse
        {...args}
        open={open}
        onOpenChange={next => setOpen(next)}
        onSubmit={r => console.log('submitted', r)}
        data-testid='feedback-pulse'
      />
    </div>
  );
};

// Static phase story for visual snapshots.
export const Rating: StoryFn<typeof meta> = () => (
  <FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='feedback-pulse' />
);
