import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Button } from '../Button';
import { FeedbackPulse } from './FeedbackPulse';

const DESCRIPTION = [
  'Asks one question in place, for measuring how a change landed without sending the reader to a survey.',
  'It is deliberately small and skippable: one question, an optional comment, and a timeout that dismisses it if the reader ignores it.',
].join(' ');

const meta = {
  title: 'Overlay/FeedbackPulse',
  component: FeedbackPulse,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof FeedbackPulse>;

export default meta;

/**
 * The whole flow end to end — question, rating, optional comment, and the confirmation it shows
 * before dismissing itself.
 */
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
/**
 * The rating scale on its own. Keep the question to something a single scale can honestly
 * answer.
 */
export const Rating: StoryFn<typeof meta> = () => (
  <div style={{ minHeight: '100vh' }}>
    <FeedbackPulse open onOpenChange={() => {}} onSubmit={() => {}} data-testid='feedback-pulse' />
  </div>
);
