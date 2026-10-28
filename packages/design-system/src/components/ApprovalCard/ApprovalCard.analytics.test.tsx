import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Button } from '../Button';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalCardActions } from './ApprovalCardActions';
import { ApprovalCardContent } from './ApprovalCardContent';

describe('ApprovalCard — analytics (docs/metrics/contract.md)', () => {
  const PROPS = '{"tool":"denylist","ip":"203.0.113.42"}';

  it('lands data-analytics-* verbatim on root and parts', () => {
    render(
      <ApprovalCard data-testid='ac' data-analytics-id='CARD' data-analytics-props={PROPS}>
        <ApprovalCardContent data-analytics-id='CONTENT'>x</ApprovalCardContent>
        <ApprovalCardActions data-analytics-id='ACTIONS' />
      </ApprovalCard>,
    );
    expect(screen.getByTestId('ac')).toHaveAttribute('data-analytics-id', 'CARD');
    expect(screen.getByTestId('ac').getAttribute('data-analytics-props')).toBe(PROPS);
    expect(screen.getByTestId('ac--content')).toHaveAttribute('data-analytics-id', 'CONTENT');
    expect(screen.getByTestId('ac--actions')).toHaveAttribute('data-analytics-id', 'ACTIONS');
  });

  it('resolves clicks to the composed action button, not the card', async () => {
    const spy = captureAnalyticsClicks();
    render(
      <ApprovalCard data-testid='ac' data-analytics-id='CARD'>
        <ApprovalCardActions>
          <Button data-testid='reject' data-analytics-id='REJECT'>
            Reject
          </Button>
        </ApprovalCardActions>
      </ApprovalCard>,
    );
    await userEvent.click(screen.getByTestId('reject'));
    expect(spy).toHaveBeenCalledWith('REJECT');
    expect(spy).not.toHaveBeenCalledWith('CARD');
  });

  it('lets consumers override the default group semantics', () => {
    render(<ApprovalCard data-testid='ac' role='region' aria-label='Approval' />);
    expect(screen.getByTestId('ac')).toHaveAttribute('role', 'region');
    expect(screen.getByRole('region', { name: 'Approval' })).toBe(screen.getByTestId('ac'));
  });
});
