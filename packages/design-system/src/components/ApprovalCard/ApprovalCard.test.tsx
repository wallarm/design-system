import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { TestIdProvider } from '../../utils/testId';
import { ApprovalCard, type ApprovalCardStatus } from './ApprovalCard';
import { ApprovalCardActions } from './ApprovalCardActions';
import { ApprovalCardContent } from './ApprovalCardContent';

const renderCard = (status?: ApprovalCardStatus, extra: Record<string, string> = {}) =>
  render(
    <ApprovalCard data-testid='ac' status={status} {...extra}>
      <ApprovalCardContent>Add IP to denylist</ApprovalCardContent>
      <ApprovalCardActions>
        <button type='button'>Approve</button>
      </ApprovalCardActions>
    </ApprovalCard>,
  );

describe('ApprovalCard', () => {
  it('renders caption and children while pending', () => {
    renderCard();
    expect(screen.getByTestId('ac--caption')).toHaveTextContent('Requires your approval');
    expect(screen.getByTestId('ac--surface')).toHaveAttribute('data-slot', 'approval-card-surface');
    expect(screen.getByTestId('ac--content')).toHaveTextContent('Add IP to denylist');
    expect(screen.getByTestId('ac--actions')).toBeInTheDocument();
    expect(screen.queryByTestId('ac--status')).toBeNull();
  });

  it.each([
    ['approved', 'Approved', 'text-icon-success'],
    ['rejected', 'Rejected', 'text-icon-danger'],
  ] as const)('renders %s status with icon and label, no children', (status, label, iconClass) => {
    renderCard(status);
    const statusEl = screen.getByTestId('ac--status');
    expect(statusEl).toHaveTextContent(label);
    expect(screen.getByRole('status')).toContainElement(statusEl);
    expect(statusEl.querySelector('svg')).toHaveClass(iconClass);
    expect(screen.getByTestId('ac--caption')).toBeInTheDocument();
    expect(screen.queryByTestId('ac--content')).toBeNull();
    expect(screen.queryByTestId('ac--actions')).toBeNull();
    expect(screen.queryByTestId('ac--surface')).toBeNull();
  });

  it('accepts custom caption and labels', () => {
    const { rerender } = render(
      <ApprovalCard data-testid='ac' status='approved' caption='Needs a yes' approvedLabel='Done'>
        x
      </ApprovalCard>,
    );
    expect(screen.getByTestId('ac--caption')).toHaveTextContent('Needs a yes');
    expect(screen.getByTestId('ac--status')).toHaveTextContent('Done');
    rerender(
      <ApprovalCard data-testid='ac' status='rejected' rejectedLabel='Nope'>
        x
      </ApprovalCard>,
    );
    expect(screen.getByTestId('ac--status')).toHaveTextContent('Nope');
  });

  it('is a group labelled by the caption', () => {
    renderCard();
    expect(screen.getByRole('group', { name: 'Requires your approval' })).toBe(
      screen.getByTestId('ac'),
    );
  });

  it('exposes the resolved state as a status', () => {
    renderCard('approved');
    expect(screen.getByRole('status')).toHaveTextContent('Approved');
  });

  it('keeps the live region mounted while pending so the resolution is announced', () => {
    const { rerender } = render(<ApprovalCard data-testid='ac'>x</ApprovalCard>);
    const live = screen.getByRole('status');
    expect(live).toBeEmptyDOMElement();
    rerender(
      <ApprovalCard data-testid='ac' status='rejected'>
        x
      </ApprovalCard>,
    );
    expect(screen.getByRole('status')).toBe(live);
    expect(live).toHaveTextContent('Rejected');
  });

  it('moves focus to the status row when the focused action unmounts on resolve', () => {
    const card = (status: ApprovalCardStatus) => (
      <ApprovalCard data-testid='ac' status={status}>
        <button type='button'>Reject</button>
      </ApprovalCard>
    );
    const { rerender } = render(card('pending'));
    screen.getByRole('button', { name: 'Reject' }).focus();
    rerender(card('rejected'));
    expect(screen.getByTestId('ac--status')).toHaveFocus();
  });

  it('does not steal focus from outside the card on resolve', () => {
    const ui = (status: ApprovalCardStatus) => (
      <>
        <input aria-label='outside' />
        <ApprovalCard data-testid='ac' status={status}>
          x
        </ApprovalCard>
      </>
    );
    const { rerender } = render(ui('pending'));
    screen.getByLabelText('outside').focus();
    rerender(ui('approved'));
    expect(screen.getByLabelText('outside')).toHaveFocus();
  });

  it('does not take focus on a host-driven resolve when nothing was focused', () => {
    const { rerender } = render(<ApprovalCard data-testid='ac'>x</ApprovalCard>);
    rerender(
      <ApprovalCard data-testid='ac' status='approved'>
        x
      </ApprovalCard>,
    );
    expect(document.body).toHaveFocus();
  });

  it('omits the caption and aria-labelledby when caption is null', () => {
    render(
      <ApprovalCard data-testid='ac' caption={null}>
        x
      </ApprovalCard>,
    );
    expect(screen.queryByTestId('ac--caption')).toBeNull();
    expect(screen.getByTestId('ac')).not.toHaveAttribute('aria-labelledby');
  });

  it('sets data-slot, data-status and forwards rest props and ref', () => {
    let node: HTMLDivElement | null = null;
    render(
      <ApprovalCard
        ref={el => {
          node = el;
        }}
        data-testid='ac'
        className='custom'
        id='card'
      >
        x
      </ApprovalCard>,
    );
    const root = screen.getByTestId('ac');
    expect(node).toBe(root);
    expect(root).toHaveAttribute('data-slot', 'approval-card');
    expect(root).toHaveAttribute('data-status', 'pending');
    expect(root).toHaveAttribute('id', 'card');
    expect(root).toHaveClass('custom');
  });
});

describe('ApprovalCard data-testid cascade', () => {
  it('nests under a parent cascade as {base}--approval-card', () => {
    render(
      <TestIdProvider value='chat'>
        <ApprovalCard>
          <ApprovalCardContent>x</ApprovalCardContent>
          <ApprovalCardActions />
        </ApprovalCard>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('chat--approval-card')).toBeInTheDocument();
    expect(screen.getByTestId('chat--approval-card--caption')).toBeInTheDocument();
    expect(screen.getByTestId('chat--approval-card--content')).toBeInTheDocument();
    expect(screen.getByTestId('chat--approval-card--actions')).toBeInTheDocument();
  });

  it('lets a root data-testid win inside a parent cascade and re-provide its base', () => {
    render(
      <TestIdProvider value='chat'>
        <ApprovalCard data-testid='card'>
          <ApprovalCardContent>x</ApprovalCardContent>
        </ApprovalCard>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card--caption')).toBeInTheDocument();
    expect(screen.getByTestId('card--content')).toBeInTheDocument();
    expect(document.querySelector('[data-testid^="chat--"]')).toBeNull();
  });

  it('lets a consumer id win on leaves', () => {
    render(
      <ApprovalCard data-testid='ac'>
        <ApprovalCardContent data-testid='custom-content'>x</ApprovalCardContent>
      </ApprovalCard>,
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('renders no data-testid attributes without a base', () => {
    render(
      <ApprovalCard>
        <ApprovalCardContent>x</ApprovalCardContent>
        <ApprovalCardActions />
      </ApprovalCard>,
    );
    expect(document.querySelector('[data-testid]')).toBeNull();
  });
});
