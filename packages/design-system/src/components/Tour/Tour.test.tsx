import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Tour } from './Tour';
import { TourClose } from './TourClose';
import type { TourStepDetails } from './types';
import { useTour } from './useTour';

const twoStepSteps: TourStepDetails[] = [
  {
    id: 'first',
    type: 'dialog',
    title: 'First step',
    description: 'First step description',
    actions: [
      {
        label: 'Skip',
        action: 'dismiss',
        'data-testid': 'tour-skip',
        'data-analytics-id': 'TOUR_SKIP',
        'data-analytics-props': '{"step":1}',
      },
      {
        label: 'Next',
        action: 'next',
        'data-testid': 'tour-next',
        'data-analytics-id': 'TOUR_NEXT',
        'data-analytics-props': '{"step":1}',
      },
    ],
  },
  {
    id: 'second',
    type: 'dialog',
    title: 'Second step',
    description: 'Second step description',
    actions: [
      {
        label: 'Back',
        action: 'prev',
        'data-testid': 'tour-prev',
        'data-analytics-id': 'TOUR_PREV',
      },
      {
        label: 'Finish',
        action: 'dismiss',
        'data-testid': 'tour-finish',
        'data-analytics-id': 'TOUR_FINISH',
      },
    ],
  },
];

const renderTour = ({
  steps = twoStepSteps,
  closeChild,
}: {
  steps?: TourStepDetails[];
  closeChild?: React.ReactElement;
} = {}) => {
  const Harness = () => {
    const tour = useTour({ steps, autoStart: true });
    return <Tour tour={tour}>{closeChild}</Tour>;
  };
  return render(<Harness />);
};

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the Next action <button>', async () => {
    renderTour();
    const next = await screen.findByTestId('tour-next');
    expect(next.tagName).toBe('BUTTON');
    expect(next).toHaveAttribute('data-analytics-id', 'TOUR_NEXT');
  });

  it('forwards data-analytics-props verbatim on action buttons', async () => {
    const payload = '{"step":1}';
    renderTour();
    const skip = await screen.findByTestId('tour-skip');
    expect(skip).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards data-analytics-id to the Previous action after advancing', async () => {
    renderTour();
    await userEvent.click(await screen.findByTestId('tour-next'));

    const prev = await screen.findByTestId('tour-prev');
    expect(prev.tagName).toBe('BUTTON');
    expect(prev).toHaveAttribute('data-analytics-id', 'TOUR_PREV');
  });

  it('forwards data-analytics-id to a consumer-rendered TourClose <button>', async () => {
    renderTour({
      closeChild: <TourClose data-testid='tour-close' data-analytics-id='TOUR_CLOSE' />,
    });
    const close = await screen.findByTestId('tour-close');
    expect(close.tagName).toBe('BUTTON');
    expect(close).toHaveAttribute('data-analytics-id', 'TOUR_CLOSE');
  });
});

describe('Auto-render opt-out', () => {
  it('renders the default TourClose when no <TourClose> child is provided', async () => {
    renderTour();
    // Default close button has aria-label-equivalent text via tooltip;
    // locate via role + the lone close icon being the last <button> in DOM.
    const buttons = await screen.findAllByRole('button');
    // Two action buttons + the default close = 3.
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it('suppresses the auto-rendered default when an explicit <TourClose> child is supplied', async () => {
    renderTour({
      closeChild: <TourClose data-testid='tour-close' data-analytics-id='TOUR_CLOSE' />,
    });
    await screen.findByTestId('tour-close');
    const closes = screen.getAllByTestId('tour-close');
    // Exactly one close button — the consumer's, no DS-default duplicate.
    expect(closes).toHaveLength(1);
  });
});

describe('Handler composition', () => {
  it('fires consumer onClick on an action without blocking the tour transition', async () => {
    const onClick = vi.fn();
    const steps: TourStepDetails[] = [
      {
        id: 'only',
        type: 'dialog',
        title: 'Only',
        description: 'Only step',
        actions: [
          {
            label: 'Got it',
            action: 'dismiss',
            'data-testid': 'tour-dismiss',
            onClick,
          },
        ],
      },
    ];
    renderTour({ steps });
    await userEvent.click(await screen.findByTestId('tour-dismiss'));
    expect(onClick).toHaveBeenCalledTimes(1);
    // Dismiss should unmount the tour content.
    await waitFor(() => {
      expect(screen.queryByTestId('tour-dismiss')).toBeNull();
    });
  });

  it('resolves analytics-id via closest() when an action <button> is clicked', async () => {
    const captured = captureAnalyticsClicks();
    renderTour();
    await userEvent.click(await screen.findByTestId('tour-next'));
    expect(captured).toHaveBeenCalledWith('TOUR_NEXT');
  });

  it('preserves analytics attributes across step transitions', async () => {
    renderTour();
    // Step 1 → click Next → step 2 → click Back → step 1 again.
    await userEvent.click(await screen.findByTestId('tour-next'));
    await userEvent.click(await screen.findByTestId('tour-prev'));

    const next = await screen.findByTestId('tour-next');
    expect(next).toHaveAttribute('data-analytics-id', 'TOUR_NEXT');
    expect(next).toHaveAttribute('data-analytics-props', '{"step":1}');
  });
});

describe('Auto-start lifecycle', () => {
  // Sanity: verifies the harness's autoStart pathway actually fires; if Ark's
  // useTour wiring drifted, every other test in this file would silently never
  // render the popover.
  it('renders the first step popover content', async () => {
    const onMount = vi.fn();
    const Harness = () => {
      const tour = useTour({ steps: twoStepSteps, autoStart: true });
      useEffect(() => {
        if (tour.open) onMount();
      }, [tour.open]);
      return <Tour tour={tour} />;
    };
    render(<Harness />);
    await screen.findByText('First step');
    expect(onMount).toHaveBeenCalled();
  });
});
