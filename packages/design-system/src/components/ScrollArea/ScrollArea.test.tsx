import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScrollArea } from './ScrollArea';
import { ScrollAreaContent } from './ScrollAreaContent';
import { ScrollAreaCorner } from './ScrollAreaCorner';
import { ScrollAreaScrollbar } from './ScrollAreaScrollbar';
import { ScrollAreaViewport } from './ScrollAreaViewport';

describe('Ref forwarding', () => {
  it('points a ScrollAreaViewport ref at the scrollable viewport node', () => {
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <ScrollArea>
        <ScrollAreaViewport ref={ref}>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='vertical' />
      </ScrollArea>,
    );

    expect(ref.current).toBe(container.querySelector('[data-part="viewport"]'));
  });

  it('resolves that ref to the only element carrying an overflow style', () => {
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <ScrollArea>
        <ScrollAreaViewport ref={ref}>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='vertical' />
      </ScrollArea>,
    );

    const scrollable = [...container.querySelectorAll<HTMLElement>('*')].filter(
      element => element.style.overflow !== '',
    );

    expect(scrollable).toEqual([ref.current]);
    expect(ref.current?.style.overflow).toBe('auto');
  });

  it('points a ScrollAreaScrollbar ref at the scrollbar element', () => {
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar ref={ref} orientation='vertical' />
      </ScrollArea>,
    );

    expect(ref.current).toBe(container.querySelector('[data-part="scrollbar"]'));
  });

  it('points a ScrollArea ref at the root element', () => {
    const ref = createRef<HTMLDivElement>();

    const { container } = render(
      <ScrollArea ref={ref}>
        <ScrollAreaViewport>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
      </ScrollArea>,
    );

    expect(ref.current).toBe(container.querySelector('[data-part="root"]'));
  });
});

describe('Test id cascading', () => {
  it('derives a slot test id for every sub-component from the root', () => {
    render(
      <ScrollArea data-testid='scroll-area'>
        <ScrollAreaViewport>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar orientation='vertical' />
        <ScrollAreaCorner />
      </ScrollArea>,
    );

    expect(screen.getByTestId('scroll-area--viewport')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area--content')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area--scrollbar')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area--corner')).toBeInTheDocument();
  });

  it('lets a consumer data-testid on ScrollAreaViewport win over the cascade', () => {
    render(
      <ScrollArea data-testid='scroll-area'>
        <ScrollAreaViewport data-testid='viewport'>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
      </ScrollArea>,
    );

    expect(screen.getByTestId('viewport')).toHaveAttribute('data-part', 'viewport');
    expect(screen.queryByTestId('scroll-area--viewport')).not.toBeInTheDocument();
  });

  it('keeps a consumer data-testid on ScrollAreaViewport without a cascade root', () => {
    render(
      <ScrollArea>
        <ScrollAreaViewport data-testid='viewport'>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
      </ScrollArea>,
    );

    expect(screen.getByTestId('viewport')).toHaveAttribute('data-part', 'viewport');
  });

  it('keeps a consumer data-testid on ScrollAreaContent', () => {
    render(
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent data-testid='content'>content</ScrollAreaContent>
        </ScrollAreaViewport>
      </ScrollArea>,
    );

    expect(screen.getByTestId('content')).toHaveAttribute('data-part', 'content');
  });

  it('keeps a consumer data-testid on ScrollAreaScrollbar', () => {
    render(
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar data-testid='scrollbar' orientation='vertical' />
      </ScrollArea>,
    );

    expect(screen.getByTestId('scrollbar')).toHaveAttribute('data-part', 'scrollbar');
  });

  it('keeps a consumer data-testid on ScrollAreaCorner', () => {
    render(
      <ScrollArea>
        <ScrollAreaViewport>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaCorner data-testid='corner' />
      </ScrollArea>,
    );

    expect(screen.getByTestId('corner')).toHaveAttribute('data-part', 'corner');
  });
});

describe('Attribute pass-through', () => {
  it('forwards arbitrary data-* to the viewport element', () => {
    render(
      <ScrollArea data-testid='scroll-area'>
        <ScrollAreaViewport data-analytics-id='REQUEST_LIST'>
          <ScrollAreaContent>content</ScrollAreaContent>
        </ScrollAreaViewport>
      </ScrollArea>,
    );

    expect(screen.getByTestId('scroll-area--viewport')).toHaveAttribute(
      'data-analytics-id',
      'REQUEST_LIST',
    );
  });
});
