import { createRef } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { insetPx } from '../../lib/agent-characters/geom';
import { defaultLook } from '../../lib/agent-characters/look';
import { AgentAvatar } from '../AgentAvatar';
import { AgentGlyph } from '../AgentGlyph';
import { AgentItem, AvatarContent, AvatarDescription, AvatarName } from '.';

describe('AgentItem', () => {
  it('draws the glyph with no plate, before the name and description', () => {
    render(
      <AgentItem agent='radar' data-testid='a'>
        <AvatarContent>
          <AvatarName>Radar</AvatarName>
          <AvatarDescription>Attack Anomaly Investigator</AvatarDescription>
        </AvatarContent>
      </AgentItem>,
    );
    const root = screen.getByTestId('a');
    const glyph = screen.getByTestId('a--glyph');
    expect(root).toHaveAttribute('data-slot', 'agent-item');
    expect(root.firstElementChild).toBe(glyph);
    expect(glyph).toHaveAttribute('data-slot', 'agent-glyph');
    expect(glyph).toHaveAttribute('data-agent', 'radar');
    expect(glyph).toHaveAttribute('width', '20');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    expect(root.querySelector('[data-slot^=avatar-fallback], [data-slot=avatar-image]')).toBeNull();
    expect(screen.getByTestId('a--name')).toHaveTextContent('Radar');
    expect(screen.getByTestId('a--description')).toHaveTextContent('Attack Anomaly Investigator');
    // stretched by a flex column or a row, the glyph and the name stay together at the start
    expect(root.className).toContain('justify-start');
  });

  it('takes a custom look, a size and a state', () => {
    render(<AgentItem look={defaultLook('tune')} size={16} state='working' data-testid='a' />);
    const glyph = screen.getByTestId('a--glyph');
    expect(glyph).toHaveAttribute('width', '16');
    expect(glyph).toHaveAttribute('data-state', 'working');
    expect(screen.getByTestId('a').className).toContain('[&_[data-slot=avatar-name]]:text-xs');
  });

  it("measures the gap from the body: the box beside it is pulled in by the shape's inset", () => {
    render(
      <>
        <AgentItem agent='trim' data-testid='narrow' />
        <AgentItem agent='lens' data-testid='wide' />
      </>,
    );
    const narrow = screen.getByTestId('narrow').style.getPropertyValue('--agent-inset');
    const wide = screen.getByTestId('wide').style.getPropertyValue('--agent-inset');
    expect(narrow).toBe(`${insetPx({ shape: 'capsule' }, 20)}px`);
    // a capsule leaves more of the box empty than a mochi, so it is pulled in further
    expect(Number.parseFloat(narrow)).toBeGreaterThan(Number.parseFloat(wide));
    expect(screen.getByTestId('narrow--glyph').getAttribute('class')).toContain(
      '-mx-(--agent-inset)',
    );
  });

  it('draws the 3D character from 40 px, live when asked', () => {
    render(<AgentItem agent='acquit' size={40} live data-testid='a' />);
    const avatar = screen.getByTestId('a--avatar');
    expect(avatar).toHaveAttribute('data-slot', 'agent-avatar');
    expect(avatar).toHaveAttribute('data-seed', 'acquit');
    expect(avatar.getAttribute('class')).toContain('-mx-(--agent-inset)');
    expect(screen.queryByTestId('a--glyph')).toBeNull();
  });

  it('forwards attributes and the ref to the root, and has no role of its own', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<AgentItem agent='sift' ref={ref} data-analytics-id='x' id='i' data-testid='a' />);
    const root = screen.getByTestId('a');
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('data-analytics-id', 'x');
    expect(root).toHaveAttribute('id', 'i');
    expect(root).not.toHaveAttribute('role');
  });

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <AgentItem agent='wally'>
        <AvatarContent>
          <AvatarName>Wally</AvatarName>
        </AvatarContent>
      </AgentItem>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});

// A slot's `[&_svg]:icon-*` (Select, DropdownMenu, Badge, FilterDropdown) outranks width/height attributes; the
// character's own size has to win through important utilities on its size variables.
describe('character size in a slot that sizes svgs', () => {
  it('pins the glyph and the 3D character to their own size', () => {
    render(
      <span className='[&_svg]:icon-md'>
        <AgentGlyph agent='radar' size={20} data-testid='g' />
        <AgentAvatar agent='radar' size={48} seed='s' data-testid='c' />
      </span>,
    );
    for (const id of ['g', 'c']) {
      const svg = screen.getByTestId(id);
      expect(svg.getAttribute('class')).toContain('w-(--agent-w)!');
      expect(svg.getAttribute('class')).toContain('h-(--agent-h)!');
      expect(svg.style.getPropertyValue('--agent-w')).toBe(`${svg.getAttribute('width')}px`);
      expect(svg.style.getPropertyValue('--agent-h')).toBe(`${svg.getAttribute('height')}px`);
    }
  });
});
