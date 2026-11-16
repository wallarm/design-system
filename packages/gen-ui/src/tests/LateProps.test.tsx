import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccordionComponent } from '../components/Accordion';
import { DialogComponent } from '../components/Dialog';
import { DrawerComponent } from '../components/Drawer';
import { TableComponent } from '../components/Table';
import { TextComponent } from '../components/Text';
import type { GenUiComponent } from '../core/define';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

// jsdom has none of these; the DS Table measures its container and scroll edges.
const noop = () => undefined;
class NoopObserver {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
  takeRecords() {
    return [];
  }
}
globalThis.ResizeObserver ??= NoopObserver;
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
Element.prototype.scrollBy ??= noop;
afterEach(cleanup);

const CATALOG: GenUiComponent[] = [
  AccordionComponent,
  DrawerComponent,
  DialogComponent,
  TableComponent,
  TextComponent,
];
const catalog = createJsonRenderCatalog(CATALOG, []);

/** One element with a Text child, as json-render streams it; props may change between renders. */
const surface = (type: string, props: Record<string, unknown>, state?: unknown) => (
  <JsonRenderSurface
    catalog={catalog}
    spec={specFromLines([
      ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
      { op: 'add', path: '/root', value: 'root' },
      { op: 'add', path: '/elements/root', value: { type, props, children: ['t'] } },
      { op: 'add', path: '/elements/t', value: { type: 'Text', props: { text: 'Body' } } },
    ])}
    onAction={rstest.fn()}
  />
);

/**
 * The DS reads some props only on mount. A prop that streams in after the first render must still
 * apply, and a row that leaves the app's data must not reopen its drawer when it comes back.
 */
describe('props that arrive after the first render', () => {
  it('Accordion opens the first section when openFirst arrives late', async () => {
    const view = render(surface('Accordion', { labels: ['A'] }));
    expect((await screen.findByRole('button', { name: 'A' })).getAttribute('aria-expanded')).toBe(
      'false',
    );
    view.rerender(surface('Accordion', { labels: ['A'], openFirst: true }));
    expect((await screen.findByRole('button', { name: 'A' })).getAttribute('aria-expanded')).toBe(
      'true',
    );
  });

  for (const [type, prop, value, width] of [
    ['Drawer', 'width', 'large', '1130px'],
    ['Dialog', 'size', 'large', '960px'],
  ] as const) {
    it(`${type} opens at the ${prop} that arrived late`, async () => {
      const base = { triggerLabel: 'Open', title: 'Req' };
      const view = render(surface(type, base));
      await screen.findByRole('button', { name: 'Open' });
      view.rerender(surface(type, { ...base, [prop]: value }));
      await userEvent.click(screen.getByRole('button', { name: 'Open' }));
      const dialog = await screen.findByRole('dialog', { name: 'Req' });
      expect(dialog.outerHTML).toContain(width);
    });
  }
});

describe('Table row detail', () => {
  const table = {
    rowKey: 'id',
    columns: [
      { key: 'time', header: 'Time', type: 'datetime', format: 'date' },
      { key: 'id', header: 'Id' },
    ],
    rows: { $state: '/rows' },
    detail: { fields: [{ key: 'id', label: 'Request' }] },
  };
  const A = { id: 'a', time: '2026-11-12T10:00:00Z' };
  const B = { id: 'b', time: '' };

  it('titles the drawer with the first column as that column draws it, or a fallback', async () => {
    render(surface('Table', { ...table, title: 'Requests' }, { rows: [A, B] }));
    const [aTime, bTime] = await screen.findAllByRole('cell');
    if (!aTime) throw new Error('no cells');
    await userEvent.click(aTime.firstElementChild ?? aTime);
    const drawer = await screen.findByRole('dialog');
    expect(drawer.textContent).not.toContain('2026-11-12T10:00:00Z');
    expect(bTime).toBeTruthy();
    const cells = screen.getAllByRole('cell');
    const bFirst = cells[2];
    if (!bFirst) throw new Error('no second row');
    await userEvent.click(bFirst.firstElementChild ?? bFirst);
    expect(await screen.findByRole('dialog', { name: 'Requests' })).toBeTruthy();
  });

  it('does not reopen a drawer whose row left the data and came back', async () => {
    const view = render(surface('Table', table, { rows: [A, B] }));
    const [first] = await screen.findAllByRole('cell');
    if (!first) throw new Error('no cells');
    await userEvent.click(first.firstElementChild ?? first);
    expect(await screen.findByRole('dialog')).toBeTruthy();
    // Closing may leave the panel in the DOM while it animates out: read its state.
    const isOpen = () => document.querySelector('[role="dialog"][data-state="open"]') !== null;
    view.rerender(surface('Table', table, { rows: [B] }));
    await waitFor(() => expect(isOpen()).toBe(false));
    view.rerender(surface('Table', table, { rows: [A, B] }));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(isOpen()).toBe(false);
  });
});
