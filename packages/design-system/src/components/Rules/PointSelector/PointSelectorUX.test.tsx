import type * as React from 'react';
import { act } from 'react';
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { createRoot, type Root } from 'react-dom/client';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';
import { PointSelectorEmptyState } from './PointSelectorEmptyState';
import { PointSelectorSkeleton } from './PointSelectorSkeleton';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
(globalThis as typeof globalThis & { React: typeof React }).React = await import('react');

let root: Root | null = null;

const render = (element: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root?.render(element));
  return container;
};

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.replaceChildren();
});

describe('PointSelectorSkeleton', () => {
  it('renders loading skeleton with loading text', () => {
    const container = render(<PointSelectorSkeleton />);
    expect(container.textContent).toContain('Loading SDK...');
    expect(container.querySelector('[data-slot="skeleton"]')).toBeTruthy();
  });

  it('has correct structure matching PointSelector layout', () => {
    const container = render(<PointSelectorSkeleton />);
    const skeleton = container.querySelector('[data-slot="point-selector-skeleton"]');
    expect(skeleton).toBeTruthy();
  });
});

describe('PointSelectorEmptyState', () => {
  it('renders empty state heading and description', () => {
    const container = render(<PointSelectorEmptyState />);
    expect(container.textContent).toContain('Build a point to match values in requests');
    expect(container.textContent).toContain('Choose where the value is located in the request');
  });

  it('shows all example patterns', () => {
    const container = render(<PointSelectorEmptyState />);
    expect(container.textContent).toContain('Request header value');
    expect(container.textContent).toContain('JSON body field');
    expect(container.textContent).toContain('Query parameter');
    expect(container.textContent).toContain('Path segment');
  });

  it('displays example point syntax in monospace', () => {
    const container = render(<PointSelectorEmptyState />);
    const codeElements = container.querySelectorAll('code');
    expect(codeElements.length).toBeGreaterThan(0);
    expect(codeElements[0]?.textContent).toContain('[http:header]');
  });

  it('shows Try buttons when onSelectExample provided', () => {
    let selectedPoint: string | null = null;
    const container = render(
      <PointSelectorEmptyState onSelectExample={point => (selectedPoint = point)} />,
    );
    const tryButtons = Array.from(container.querySelectorAll('button')).filter(
      btn => btn.textContent === 'Try',
    );
    expect(tryButtons.length).toBe(4);

    // Click first button
    act(() => tryButtons[0]?.click());
    expect(selectedPoint).toBe("[http:header]['authorization']");
  });

  it('hides Try buttons when onSelectExample not provided', () => {
    const container = render(<PointSelectorEmptyState />);
    const tryButtons = Array.from(container.querySelectorAll('button')).filter(
      btn => btn.textContent === 'Try',
    );
    expect(tryButtons.length).toBe(0);
  });

  it('shows keyboard shortcuts hint', () => {
    const container = render(<PointSelectorEmptyState />);
    expect(container.textContent).toContain('?');
    expect(container.textContent).toContain('for keyboard shortcuts');
  });
});

describe('KeyboardShortcutsDialog', () => {
  it('renders when open', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Keyboard Shortcuts');
  });

  it('does not render when closed', () => {
    render(<KeyboardShortcutsDialog open={false} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).not.toContain('Keyboard Shortcuts');
  });

  it('shows all shortcut sections', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Navigation');
    expect(document.body.textContent).toContain('Selection');
    expect(document.body.textContent).toContain('Editing');
    expect(document.body.textContent).toContain('Advanced');
  });

  it('displays arrow key shortcuts', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Navigate menu items (focus stays in input)');
  });

  it('displays Tab shortcut', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Move to Next button (closes menu)');
  });

  it('displays Escape stack behavior', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Close menu (press again to blur input)');
  });

  it('displays multi-select shortcuts', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Toggle checkbox');
    expect(document.body.textContent).toContain('Apply selected items (multi-select)');
  });

  it('displays ignore case shortcut', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    expect(document.body.textContent).toContain('Toggle ignore case (name/value input)');
  });

  it('shows keyboard shortcut keys in Kbd components', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={rs.fn()} />);
    const kbds = document.body.querySelectorAll('kbd');
    expect(kbds.length).toBeGreaterThan(10); // Should have many keyboard shortcuts
  });
});
