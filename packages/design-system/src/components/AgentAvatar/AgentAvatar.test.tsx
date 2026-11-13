import { createRef } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render } from '@testing-library/react';
import { charTree } from '../../lib/agent-characters/char';
import { CAST } from '../../lib/agent-characters/data.gen';
import { toSvgString } from '../../lib/agent-characters/svg';
import { AgentAvatar } from './AgentAvatar';

// The component's markup before any bake equals the core tree, which matches the page (char.test): classes become
// data-part tokens and the .ch classes become data attributes on the root.
const asPage = (svg: SVGSVGElement) => {
  const c = svg.cloneNode(true) as SVGSVGElement;
  // data-part back to the leading class attribute, keeping every other attribute in its order
  for (const n of c.querySelectorAll('[data-part]')) {
    const rest = [...n.attributes]
      .filter(a => a.name !== 'data-part')
      .map(a => [a.name, a.value] as const);
    const part = n.getAttribute('data-part') as string;
    for (const [k] of rest) n.removeAttribute(k);
    n.removeAttribute('data-part');
    n.setAttribute('class', part);
    for (const [k, v] of rest) n.setAttribute(k, v);
  }
  return c.innerHTML.replace(/(id="|url\(#)([^"\)]+?)(g|k|c|vg|eg|s|v)(["\)])/g, '$1ID$3$4');
};
const corePage = (tree: ReturnType<typeof charTree>) => {
  const host = document.createElement('div');
  host.innerHTML = toSvgString('svg', {}, tree.children);
  return (host.querySelector('svg') as SVGSVGElement).innerHTML.replace(
    /(id="|url\(#)([^"\)]+?)(g|k|c|vg|eg|s|v)(["\)])/g,
    '$1ID$3$4',
  );
};
const svgOf = (el: HTMLElement) => el.querySelector('svg') as SVGSVGElement;

describe('AgentAvatar (static)', () => {
  it('renders the core static frame for every preset and state', () => {
    for (const p of CAST)
      for (const state of [
        'idle',
        'needs',
        'working',
        'failed',
        'off',
        'box',
        'invite',
        'hello',
        'done',
      ] as const) {
        const { container, unmount } = render(
          <AgentAvatar agent={p.id} seed={p.id} size={72} state={state} shadow />,
        );
        const tree = charTree(p, { size: 72, state, shadow: true, cover: false, ids: 'x' });
        expect(asPage(svgOf(container)), `${p.id} ${state}`).toBe(corePage(tree));
        const root = svgOf(container);
        expect(root.getAttribute('data-state')).toBe(state);
        expect(root.hasAttribute('data-ghosting')).toBe(tree.ghosting);
        expect(root.hasAttribute('data-veiled')).toBe(tree.veiled);
        unmount();
      }
  });

  it('keeps the crown in every state but Deactivated (04 §4.11)', () => {
    for (const state of ['needs', 'working', 'failed'] as const) {
      const { container } = render(
        <AgentAvatar
          agent='sift'
          seed='s'
          size={72}
          hasApplications
          coverage='partial'
          state={state}
        />,
      );
      expect(svgOf(container).hasAttribute('data-ghosting'), state).toBe(true);
    }
    const off = render(
      <AgentAvatar
        agent='sift'
        seed='s'
        size={72}
        hasApplications
        coverage='partial'
        state='off'
      />,
    );
    expect(svgOf(off.container).hasAttribute('data-ghosting')).toBe(false);
  });

  it('draws the crown for partial coverage with applications, on duty', () => {
    const { container } = render(
      <AgentAvatar agent='sift' seed='s' size={72} hasApplications coverage='partial' />,
    );
    expect(svgOf(container).hasAttribute('data-ghosting')).toBe(true);
    expect(svgOf(container).hasAttribute('data-veiled')).toBe(false);
  });

  it('gives two avatars different SVG ids', () => {
    const { container } = render(
      <div>
        <AgentAvatar agent='radar' seed='a' size={72} />
        <AgentAvatar agent='radar' seed='b' size={72} />
      </div>,
    );
    const ids = [...container.querySelectorAll('[id]')].map(n => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is decorative without a label and an image with one', () => {
    const a = svgOf(render(<AgentAvatar agent='tune' seed='m' size={48} />).container);
    expect([a.getAttribute('aria-hidden'), a.getAttribute('role')]).toEqual(['true', null]);
    const b = svgOf(render(<AgentAvatar agent='tune' seed='m' size={48} label='Tune' />).container);
    expect([
      b.getAttribute('aria-hidden'),
      b.getAttribute('role'),
      b.getAttribute('aria-label'),
    ]).toEqual([null, 'img', 'Tune']);
  });

  it('never draws Wally for an unknown agent', () => {
    const { container } = render(
      <AgentAvatar agent={'deep-agent-1' as 'radar'} seed='d' size={48} />,
    );
    expect(container.innerHTML).not.toContain('#FF4D2E');
  });

  it('forwards ref, className and data-testid', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(
      <AgentAvatar ref={ref} agent='trim' seed='t' size={40} className='ml-4' data-testid='av' />,
    );
    const svg = svgOf(container);
    expect(ref.current).toBe(svg);
    expect(svg.getAttribute('class')).toContain('ml-4');
    expect(svg.getAttribute('data-testid')).toBe('av');
    expect(svg.getAttribute('data-slot')).toBe('agent-avatar');
    expect([svg.getAttribute('width'), svg.getAttribute('height')]).toEqual(['40', '38']);
  });
});
