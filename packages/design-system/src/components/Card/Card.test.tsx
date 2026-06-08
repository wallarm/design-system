import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Card } from './Card';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the root <div>', () => {
    render(
      <Card data-testid='card' data-analytics-id='CARD_OPEN'>
        Content
      </Card>,
    );

    const root = screen.getByTestId('card');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'CARD_OPEN');
  });

  it('forwards data-analytics-id to the consumer element via asChild', () => {
    render(
      <Card asChild data-testid='card'>
        <a href='/docs' data-analytics-id='CARD_LINK'>
          Content
        </a>
      </Card>,
    );

    const root = screen.getByTestId('card');
    expect(root.tagName).toBe('A');
    expect(root).toHaveAttribute('data-analytics-id', 'CARD_LINK');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'dashboard', card: 'summary' });

    render(
      <Card data-testid='card' data-analytics-id='CARD_OPEN' data-analytics-props={payload}>
        Content
      </Card>,
    );

    const root = screen.getByTestId('card');
    expect(root).toHaveAttribute('data-analytics-id', 'CARD_OPEN');
    expect(root).toHaveAttribute('data-analytics-props', payload);
  });

  it('user clicks resolve to the data-analytics-id element via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <Card onClick={vi.fn()} data-testid='card' data-analytics-id='CARD_OPEN'>
        Content
      </Card>,
    );
    await userEvent.click(screen.getByTestId('card'));

    expect(captured).toHaveBeenCalledWith('CARD_OPEN');
  });
});
