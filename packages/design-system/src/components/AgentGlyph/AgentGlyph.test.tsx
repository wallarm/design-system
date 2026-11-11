import { createRef } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render } from '@testing-library/react';
import { CAST } from '../../lib/agent-characters/data.gen';
import { optPx } from '../../lib/agent-characters/geom';
import { glyph } from '../../lib/agent-characters/glyph';
import { AgentGlyph, type AgentGlyphState } from './AgentGlyph';

const STATES: AgentGlyphState[] = [
  'idle',
  'hello',
  'working',
  'needs',
  'done',
  'failed',
  'off',
  'box',
  'invite',
];
// the page's string, parsed and serialised by the same DOM as the component's output
const inner = (svg: string) => {
  const host = document.createElement('div');
  host.innerHTML = svg;
  return host.querySelector('svg')?.innerHTML ?? '';
};
// clip ids differ by source (page counter vs useId): compare them by position
const norm = (s: string) => {
  const seen = new Map<string, string>();
  return s.replace(/(id="|url\(#)([^")]+)/g, (_, pre: string, id: string) => {
    if (!seen.has(id)) seen.set(id, `clip${seen.size}`);
    return `${pre}${seen.get(id)}`;
  });
};
const svgOf = (el: HTMLElement) => el.querySelector('svg') as SVGSVGElement;

describe('AgentGlyph', () => {
  it('renders the page glyph for every preset and state', () => {
    for (const p of CAST)
      for (const st of STATES)
        for (const size of [16, 20, 24, 32] as const) {
          const { container, unmount } = render(<AgentGlyph agent={p.id} size={size} state={st} />);
          expect(norm(svgOf(container).innerHTML), `${p.id} ${st} ${size}`).toBe(
            norm(inner(glyph(p, size, st))),
          );
          unmount();
        }
  });

  it('lifts by optPx when optical, not when box', () => {
    const radar = CAST.find(p => p.id === 'radar');
    const { container, rerender } = render(<AgentGlyph agent='radar' size={20} />);
    expect(svgOf(container).style.getPropertyValue('--oy')).toBe(`${radar && optPx(radar, 20)}px`);
    expect(svgOf(container).getAttribute('class')).toContain('translate-y-[var(--oy)]');
    rerender(<AgentGlyph agent='radar' size={20} align='box' />);
    expect(svgOf(container).style.getPropertyValue('--oy')).toBe('');
    expect(svgOf(container).getAttribute('class')).not.toContain('translate-y');
  });

  it('draws the crown only for partial coverage with applications, on duty', () => {
    const crown = (el: HTMLElement) => svgOf(el).querySelector('clipPath');
    const radar = CAST.find(p => p.id === 'radar');
    const a = render(<AgentGlyph agent='radar' size={20} hasApplications coverage='partial' />);
    expect(crown(a.container)).not.toBeNull();
    expect(norm(svgOf(a.container).innerHTML)).toBe(
      norm(inner(radar ? glyph(radar, 20, 'partly') : '')),
    );
    for (const el of [
      render(<AgentGlyph agent='radar' size={20} coverage='partial' />).container,
      render(<AgentGlyph agent='radar' size={20} hasApplications coverage='full' />).container,
      render(
        <AgentGlyph agent='radar' size={20} hasApplications coverage='partial' state='needs' />,
      ).container,
    ])
      expect(crown(el)).toBeNull();
  });

  it('names each crown clip by its shape, so copies and React roots can share an id safely', () => {
    const { container } = render(
      <div>
        <AgentGlyph agent='sift' size={20} hasApplications coverage='partial' />
        <AgentGlyph agent='sift' size={32} hasApplications coverage='partial' />
        <AgentGlyph agent='radar' size={20} hasApplications coverage='partial' />
      </div>,
    );
    const clips = [...container.querySelectorAll('clipPath')];
    expect(clips.map(c => c.id)).toEqual([
      'agent-glyph-crown-cushion',
      'agent-glyph-crown-cushion',
      'agent-glyph-crown-gumdrop',
    ]);
    // same id ⇒ the same clip geometry, whichever one url(#…) resolves to
    expect(clips[0]?.innerHTML).toBe(clips[1]?.innerHTML);
    for (const svg of container.querySelectorAll('svg')) {
      const id = svg.querySelector('clipPath')?.id;
      expect(svg.querySelector('g')?.getAttribute('clip-path')).toBe(`url(#${id})`);
    }
  });

  it('never draws Wally for a missing or unknown agent', () => {
    const wally = render(<AgentGlyph agent='wally' size={20} />).container.innerHTML;
    const missing = render(
      <AgentGlyph {...({ size: 20 } as unknown as { agent: 'radar'; size: 20 })} />,
    ).container;
    const unknown = render(<AgentGlyph agent={'deep-agent-7' as 'radar'} size={20} />).container;
    for (const el of [missing, unknown]) {
      expect(el.innerHTML).not.toBe(wally);
      expect(el.innerHTML).not.toContain('#FF4D2E'); // coral is Wally's only
    }
  });

  it('clips to its box like the page glyph', () => {
    const { container } = render(<AgentGlyph agent='radar' size={20} />);
    expect(svgOf(container).getAttribute('class')).not.toContain('overflow-visible');
  });

  it('draws a look, and falls back like the page for ids outside the kit', () => {
    const look = { v: 1, shape: 'kettle', color: 'butter', eyes: 'oval', prop: 'beanie' } as const;
    const { container } = render(<AgentGlyph look={look} size={24} state='needs' />);
    expect(norm(svgOf(container).innerHTML)).toBe(norm(inner(glyph(look, 24, 'needs'))));
    const odd = {
      v: 1,
      shape: 'teapot',
      color: 'x',
      eyes: 'y',
      prop: 'z',
    } as unknown as typeof look;
    expect(() => render(<AgentGlyph look={odd} size={20} />)).not.toThrow();
  });

  it('dims the whole glyph when not set up, as the page does', () => {
    const { container } = render(<AgentGlyph agent='trim' size={20} state='box' />);
    expect(svgOf(container).getAttribute('class')).toContain('opacity-55');
  });

  it('forwards ref, className, data-testid and data attributes', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(
      <AgentGlyph ref={ref} agent='acquit' size={16} className='ml-4' data-testid='g' />,
    );
    const svg = svgOf(container);
    expect(ref.current).toBe(svg);
    expect(svg.getAttribute('class')).toContain('ml-4');
    expect(svg.getAttribute('data-testid')).toBe('g');
    expect(svg.getAttribute('data-slot')).toBe('agent-glyph');
    expect(svg.getAttribute('data-agent')).toBe('acquit');
    expect(svg.getAttribute('data-state')).toBe('idle');
    expect([
      svg.getAttribute('width'),
      svg.getAttribute('height'),
      svg.getAttribute('viewBox'),
    ]).toEqual(['16', '15', '-8 -14 136 128']);
  });
});
