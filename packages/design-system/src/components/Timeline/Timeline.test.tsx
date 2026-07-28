import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Timeline } from './Timeline';
import { TimelineConnector } from './TimelineConnector';
import { TimelineContent } from './TimelineContent';
import { TimelineDescription } from './TimelineDescription';
import { TimelineIndicator } from './TimelineIndicator';
import { TimelineItem } from './TimelineItem';
import { TimelineSeparator } from './TimelineSeparator';
import { TimelineTitle } from './TimelineTitle';

const renderTimeline = () =>
  render(
    <Timeline data-testid='tl'>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>1</TimelineIndicator>
          <TimelineSeparator />
        </TimelineConnector>
        <TimelineContent>
          <TimelineTitle>Step one</TimelineTitle>
          <TimelineDescription>First description</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>,
  );

describe('Timeline data-testid cascade', () => {
  it('derives every sub-component testid from the root, one level below the item', () => {
    renderTimeline();

    expect(screen.getByTestId('tl')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item--connector')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item--indicator')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item--separator')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item--content')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item--title')).toBeInTheDocument();
    expect(screen.getByTestId('tl--item--description')).toBeInTheDocument();
  });

  it('renders no data-testid attributes when the root has none', () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineConnector>
            <TimelineIndicator>1</TimelineIndicator>
          </TimelineConnector>
        </TimelineItem>
      </Timeline>,
    );

    expect(document.querySelector('[data-testid]')).toBeNull();
  });
});

describe('Timeline semantics', () => {
  it('exposes list/listitem roles', () => {
    renderTimeline();
    expect(screen.getByRole('list')).toBe(screen.getByTestId('tl'));
    expect(screen.getByRole('listitem')).toBe(screen.getByTestId('tl--item'));
  });
});

describe('Timeline fixed variants', () => {
  it('always renders TimelineIndicator with data-type="outline"', () => {
    renderTimeline();
    expect(screen.getByTestId('tl--item--indicator')).toHaveAttribute('data-type', 'outline');
  });

  it('always renders TimelineSeparator with a vertical aria-orientation when non-decorative', () => {
    render(
      <Timeline data-testid='tl'>
        <TimelineItem>
          <TimelineConnector>
            <TimelineIndicator>1</TimelineIndicator>
            <TimelineSeparator decorative={false} />
          </TimelineConnector>
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByTestId('tl--item--separator')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
  });
});

describe('Timeline data-slot', () => {
  it('sets the expected data-slot on every sub-component root element', () => {
    renderTimeline();

    expect(screen.getByTestId('tl')).toHaveAttribute('data-slot', 'timeline');
    expect(screen.getByTestId('tl--item')).toHaveAttribute('data-slot', 'timeline-item');
    expect(screen.getByTestId('tl--item--connector')).toHaveAttribute(
      'data-slot',
      'timeline-connector',
    );
    expect(screen.getByTestId('tl--item--indicator')).toHaveAttribute(
      'data-slot',
      'timeline-indicator',
    );
    expect(screen.getByTestId('tl--item--separator')).toHaveAttribute(
      'data-slot',
      'timeline-separator',
    );
    expect(screen.getByTestId('tl--item--content')).toHaveAttribute(
      'data-slot',
      'timeline-content',
    );
    expect(screen.getByTestId('tl--item--title')).toHaveAttribute('data-slot', 'timeline-title');
    expect(screen.getByTestId('tl--item--description')).toHaveAttribute(
      'data-slot',
      'timeline-description',
    );
  });
});

describe('Timeline with multiple items', () => {
  const renderMultipleItems = () =>
    render(
      <Timeline data-testid='tl'>
        <TimelineItem>
          <TimelineConnector>
            <TimelineIndicator>1</TimelineIndicator>
            <TimelineSeparator />
          </TimelineConnector>
        </TimelineItem>
        <TimelineItem>
          <TimelineConnector>
            <TimelineIndicator>2</TimelineIndicator>
            <TimelineSeparator />
          </TimelineConnector>
        </TimelineItem>
        <TimelineItem>
          <TimelineConnector>
            <TimelineIndicator>3</TimelineIndicator>
            <TimelineSeparator />
          </TimelineConnector>
        </TimelineItem>
      </Timeline>,
    );

  it('renders one <li> per item, all sharing the same flat testid', () => {
    renderMultipleItems();
    expect(screen.getAllByTestId('tl--item')).toHaveLength(3);
  });

  it('marks only the actual last item as :last-child', () => {
    renderMultipleItems();
    const items = screen.getAllByTestId('tl--item');
    // last-child is a real DOM/CSS relationship, not something jsdom computes for us here;
    // assert on the DOM structure instead: only the final <li> element is the last element child of its parent <ol>.
    const list = screen.getByRole('list');
    expect(list.lastElementChild).toBe(items[items.length - 1]);
  });
});
