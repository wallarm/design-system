import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { ButtonComponent } from '../components/Button';
import { CheckboxComponent } from '../components/Checkbox';
import { InputComponent } from '../components/Input';
import { SelectComponent } from '../components/Select';
import { StackComponent } from '../components/Stack';
import { SwitchComponent } from '../components/Switch';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';

afterEach(cleanup);
// jsdom has no scrolling; Ark's select scrolls its list to the highlighted option.
Element.prototype.scrollTo ??= () => undefined;

const CATALOG = [
  StackComponent,
  InputComponent,
  SwitchComponent,
  CheckboxComponent,
  SelectComponent,
  ButtonComponent,
];
const ACTIONS = [{ name: 'submit', description: 'Sends the form.' }];
const OPTIONS = [
  { value: 'block', label: 'Block' },
  { value: 'monitor', label: 'Monitor' },
];

interface FieldCase {
  type: string;
  /** The bindable prop and the other props, in the entry's order for OpenUI. */
  prop: string;
  props: Record<string, unknown>;
  openUiArgs: (binding: string) => string;
  /** What the user does, and the value the action then gets. */
  fill: () => Promise<void>;
  sent: unknown;
  /** A literal the agent sends, and how the field reads after `fill` from there. */
  literal: unknown;
  read: () => unknown;
  afterLiteral: unknown;
}

const CASES: FieldCase[] = [
  {
    type: 'Input',
    prop: 'value',
    props: { label: 'IP address' },
    openUiArgs: b => `"IP address", ${b}`,
    fill: async () => userEvent.type(await screen.findByLabelText('IP address'), '203.0.113.7'),
    sent: '203.0.113.7',
    literal: '10.0.0.1',
    read: () => (screen.getByLabelText('IP address') as HTMLInputElement).value,
    afterLiteral: '10.0.0.1203.0.113.7',
  },
  {
    type: 'Switch',
    prop: 'checked',
    props: { label: 'Blocking mode' },
    openUiArgs: b => `"Blocking mode", ${b}`,
    fill: async () => userEvent.click(await screen.findByText('Blocking mode')),
    sent: true,
    literal: true,
    read: () => (screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked,
    afterLiteral: false,
  },
  {
    type: 'Checkbox',
    prop: 'checked',
    props: { label: 'Also block the subnet' },
    openUiArgs: b => `"Also block the subnet", ${b}`,
    fill: async () => userEvent.click(await screen.findByText('Also block the subnet')),
    sent: true,
    literal: true,
    read: () => (screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement).checked,
    afterLiteral: false,
  },
  {
    type: 'Select',
    prop: 'value',
    props: { label: 'Mode', options: OPTIONS },
    openUiArgs: b =>
      `"Mode", [{value: "block", label: "Block"}, {value: "monitor", label: "Monitor"}], ${b}`,
    fill: async () => {
      await userEvent.click(await screen.findByRole('combobox'));
      await userEvent.click(await screen.findByRole('option', { name: 'Monitor' }));
    },
    sent: 'monitor',
    literal: 'block',
    read: () => screen.getByRole('combobox').textContent,
    afterLiteral: 'Monitor',
  },
];

/** The field bound to `/v`, and a button that sends `/v`: what the user did reaches the action. */
const surfaces = (c: FieldCase) => ({
  A2UI: (onAction: () => void, value: unknown = { '@path': '/v' }) => (
    <A2uiSurfaces
      catalog={createA2uiCatalog(CATALOG)}
      messages={
        [
          {
            version: '1.0',
            createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID },
          },
          {
            version: '1.0',
            updateComponents: {
              surfaceId: 's',
              components: [
                { id: 'root', component: 'Stack', children: ['f', 'go'] },
                { id: 'f', component: c.type, ...c.props, [c.prop]: value },
                {
                  id: 'go',
                  component: 'Button',
                  label: 'Send',
                  press: { event: { name: 'submit', context: { v: { '@path': '/v' } } } },
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
  'json-render': (onAction: () => void) => (
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(CATALOG, ACTIONS)}
      spec={specFromLines([
        { op: 'add', path: '/state', value: {} },
        { op: 'add', path: '/root', value: 'root' },
        { op: 'add', path: '/elements/root', value: { type: 'Stack', children: ['f', 'go'] } },
        {
          op: 'add',
          path: '/elements/f',
          value: {
            type: c.type,
            props: { ...c.props, [c.prop]: { $bindState: '/v' } },
            children: [],
          },
        },
        {
          op: 'add',
          path: '/elements/go',
          value: {
            type: 'Button',
            props: { label: 'Send' },
            on: { press: { action: 'submit', params: { v: { $state: '/v' } } } },
            children: [],
          },
        },
      ])}
      onAction={onAction}
    />
  ),
  OpenUI: (onAction: () => void) => (
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, ACTIONS)}
      program={[
        'root = Stack(null, null, [f, go])',
        `f = ${c.type}(${c.openUiArgs('$v')})`,
        'go = Button("Send", null, null, @submit({v: $v}))',
        '$v = null',
      ].join('\n')}
      onAction={onAction}
      onError={rstest.fn()}
    />
  ),
});

for (const c of CASES) {
  describe(c.type, () => {
    for (const [format, surface] of Object.entries(surfaces(c))) {
      it(`sends what the user entered through the bound path in ${format}`, async () => {
        const onAction = rstest.fn();
        render(surface(onAction));
        await c.fill();
        await userEvent.click(screen.getByRole('button', { name: 'Send' }));
        expect(onAction).toHaveBeenCalledWith('submit', { v: c.sent });
      });
    }

    it('starts from a literal the agent sent and still takes input', async () => {
      render(surfaces(c).A2UI(rstest.fn(), c.literal));
      await c.fill();
      expect(c.read()).toBe(c.afterLiteral);
    });
  });
}
