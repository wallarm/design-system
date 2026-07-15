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
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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

// Static phase story for visual snapshots. The wrapper keeps a node in #storybook-root
// (FeedbackPulse itself portals to document.body) so the e2e story-loader can detect render.
export const Rating: StoryFn<typeof meta> = () => (
  <div style={{ minHeight: '100vh' }}>
    <FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='feedback-pulse' />
  </div>
);
