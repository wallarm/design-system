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
import { NumberInputComponent } from '../components/NumberInput';
import { SliderComponent } from '../components/Slider';
import { StackComponent } from '../components/Stack';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';

afterEach(cleanup);

const CATALOG = [StackComponent, NumberInputComponent, SliderComponent, ButtonComponent];
const ACTIONS = [{ name: 'submit', description: 'Sends the form.' }];

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
    type: 'NumberInput',
    prop: 'value',
    props: { label: 'Requests per minute' },
    openUiArgs: b => `"Requests per minute", ${b}`,
    fill: async () => userEvent.type(await screen.findByLabelText('Requests per minute'), '120'),
    sent: 120,
    literal: 5,
    read: () => (screen.getByLabelText('Requests per minute') as HTMLInputElement).value,
    afterLiteral: '5120',
  },
  {
    type: 'Slider',
    prop: 'value',
    props: { label: 'Sensitivity', min: 0, max: 10 },
    openUiArgs: b => `"Sensitivity", ${b}, 0, 10`,
    fill: async () => {
      // jsdom has no layout: drive the thumb by keyboard.
      (await screen.findByRole('slider')).focus();
      await userEvent.keyboard('{ArrowRight}');
    },
    sent: 1,
    literal: 7,
    read: () => screen.getByRole('slider').getAttribute('aria-valuenow'),
    afterLiteral: '8',
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
        'go = Button("Send", null, null, null, @submit({v: $v}))',
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

it('writes nothing to the path while the number field is empty', async () => {
  const onAction = rstest.fn();
  render(surfaces(CASES[0]!).A2UI(onAction));
  const field = await screen.findByLabelText('Requests per minute');
  await userEvent.type(field, '7');
  await userEvent.clear(field);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(onAction).toHaveBeenCalledWith('submit', { v: undefined });
});

it('keeps a half-typed negative number and sends it once typed', async () => {
  const onAction = rstest.fn();
  render(surfaces(CASES[0]!).A2UI(onAction));
  const field = (await screen.findByLabelText('Requests per minute')) as HTMLInputElement;
  await userEvent.type(field, '-');
  expect(field.value).toBe('-');
  await userEvent.type(field, '5');
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(onAction).toHaveBeenCalledWith('submit', { v: -5 });
});
