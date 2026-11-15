import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { ButtonComponent } from '../components/Button';
import { StackComponent } from '../components/Stack';
import { TableComponent } from '../components/Table';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';

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
Element.prototype.scrollTo ??= noop;
afterEach(cleanup);

const CATALOG = [StackComponent, TableComponent, ButtonComponent];
const ACTIONS = [
  { name: 'block_ips', description: 'Blocks IPs.' },
  { name: 'allow_ip', description: 'Allows one IP.' },
];
const ROWS = [
  { ip: '203.0.113.7', hits: 120 },
  { ip: '198.51.100.4', hits: 9 },
  { ip: '192.0.2.55', hits: 47 },
];
const COLUMNS = [
  { key: 'ip', header: 'IP', type: 'ip' },
  { key: 'hits', header: 'Hits', type: 'number' },
];
/** The table's own props; selection and actionRow are bound to `/sel` and `/row`. */
const TABLE = {
  rowKey: 'ip',
  columns: COLUMNS,
  selectable: true,
  rowActionItem: { label: 'Allow' },
};

const surfaces = {
  A2UI: (onAction: () => void, extra: Record<string, unknown> = {}) => (
    <A2uiSurfaces
      catalog={createA2uiCatalog(CATALOG)}
      messages={
        [
          {
            version: '1.0',
            createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID },
          },
          { version: '1.0', updateDataModel: { surfaceId: 's', path: '/rows', value: ROWS } },
          {
            version: '1.0',
            updateComponents: {
              surfaceId: 's',
              components: [
                { id: 'root', component: 'Stack', children: ['t', 'go'] },
                {
                  id: 't',
                  component: 'Table',
                  ...TABLE,
                  ...extra,
                  rows: { '@path': '/rows' },
                  selection: { '@path': '/sel' },
                  actionRow: { '@path': '/row' },
                  rowAction: { event: { name: 'allow_ip', context: { ip: { '@path': '/row' } } } },
                },
                {
                  id: 'go',
                  component: 'Button',
                  label: 'Block selected',
                  press: { event: { name: 'block_ips', context: { ips: { '@path': '/sel' } } } },
                },
              ],
            },
          },
        ] as unknown as A2uiMessage[]
      }
      actions={ACTIONS}
      onAction={onAction}
    />
  ),
  'json-render': (onAction: () => void, extra: Record<string, unknown> = {}) => (
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(CATALOG, ACTIONS)}
      spec={specFromLines([
        { op: 'add', path: '/state', value: { rows: ROWS } },
        { op: 'add', path: '/root', value: 'root' },
        { op: 'add', path: '/elements/root', value: { type: 'Stack', children: ['t', 'go'] } },
        {
          op: 'add',
          path: '/elements/t',
          value: {
            type: 'Table',
            props: {
              ...TABLE,
              ...extra,
              rows: { $state: '/rows' },
              selection: { $bindState: '/sel' },
              actionRow: { $bindState: '/row' },
            },
            on: { rowAction: { action: 'allow_ip', params: { ip: { $state: '/row' } } } },
            children: [],
          },
        },
        {
          op: 'add',
          path: '/elements/go',
          value: {
            type: 'Button',
            props: { label: 'Block selected' },
            on: { press: { action: 'block_ips', params: { ips: { $state: '/sel' } } } },
            children: [],
          },
        },
      ])}
      onAction={onAction}
    />
  ),
  OpenUI: (onAction: () => void, extra: Record<string, unknown> = {}) => (
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, ACTIONS)}
      program={[
        'root = Stack(null, null, [t, go])',
        // title, rowKey, columns, rows, detail, pageSize, selectable, selection, rowActionItem, actionRow, rowAction
        `t = Table(null, "ip", ${JSON.stringify(COLUMNS).replace(/"(\w+)":/g, '$1:')}, $rows, null, ${extra.pageSize ?? 'null'}, true, $sel, {label: "Allow"}, $row, @allow_ip({ip: $row}))`,
        'go = Button("Block selected", null, null, @block_ips({ips: $sel}))',
        '$sel = []',
        '$row = null',
      ].join('\n')}
      data={{ rows: ROWS }}
      onAction={onAction}
      onError={rstest.fn()}
    />
  ),
};

const firstCells = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map(row => within(row).getAllByRole('cell')[1]?.textContent ?? '');

for (const [format, surface] of Object.entries(surfaces)) {
  describe(`Table interactions in ${format}`, () => {
    it('sends the selected rows from a Button through the bound selection', async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      // The first checkbox is the header's select-all.
      const boxes = await screen.findAllByRole('checkbox');
      await userEvent.click(boxes[1] as HTMLElement);
      await userEvent.click(boxes[3] as HTMLElement);
      await userEvent.click(screen.getByRole('button', { name: 'Block selected' }));
      expect(onAction).toHaveBeenCalledWith('block_ips', { ips: ['203.0.113.7', '192.0.2.55'] });
    });

    it("fires the row action with the row's key", async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      const menus = await screen.findAllByRole('button', { name: 'Row actions' });
      // By keyboard, as the DS menu tests do: the menu takes focus once it has opened.
      (menus[1] as HTMLElement).focus();
      await userEvent.keyboard('{Enter}');
      await waitFor(() => expect(document.activeElement?.getAttribute('role')).toBe('menu'));
      await userEvent.keyboard('{ArrowDown}{Enter}');
      await waitFor(() =>
        expect(onAction).toHaveBeenCalledWith('allow_ip', { ip: '198.51.100.4' }),
      );
    });

    it('sorts by a header', async () => {
      render(surface(rstest.fn(), { pageSize: 5 }));
      await screen.findAllByRole('row');
      await userEvent.click(screen.getAllByLabelText(/Sort column|Sorted /i)[1] as HTMLElement);
      // A number column sorts high to low first.
      expect(firstCells()).toEqual(['203.0.113.7', '192.0.2.55', '198.51.100.4']);
    });
  });
}
