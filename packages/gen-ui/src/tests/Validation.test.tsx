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
import { DateRangeInputComponent } from '../components/DateRangeInput';
import { InputComponent } from '../components/Input';
import { SelectComponent } from '../components/Select';
import { StackComponent } from '../components/Stack';
import { NOT_BEFORE_AFTER, rangeError, textError, textRules } from '../core/validate';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';

afterEach(cleanup);

const CATALOG = [StackComponent, InputComponent, ButtonComponent];
const ACTIONS = [{ name: 'submit', description: 'Sends the form.' }];
const FIELD = { label: 'Name', required: true, minLength: 3 };

/** A required Input bound to `/v`, a submit Button and a plain one, both sending `/v`. */
const surfaces = {
  A2UI: (onAction: () => void) => {
    const press = { event: { name: 'submit', context: { v: { '@path': '/v' } } } };
    return (
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
                  { id: 'root', component: 'Stack', children: ['f', 'go', 'plain'] },
                  { id: 'f', component: 'Input', ...FIELD, value: { '@path': '/v' } },
                  { id: 'go', component: 'Button', label: 'Send', submit: true, press },
                  { id: 'plain', component: 'Button', label: 'Plain', press },
                ],
              },
            },
          ] as unknown as A2uiMessage[]
        }
        actions={ACTIONS}
        onAction={onAction}
      />
    );
  },
  'json-render': (onAction: () => void) => {
    const on = { press: { action: 'submit', params: { v: { $state: '/v' } } } };
    const element = (id: string, value: Record<string, unknown>) => ({
      op: 'add' as const,
      path: `/elements/${id}`,
      value: { children: [], ...value },
    });
    return (
      <JsonRenderSurface
        catalog={createJsonRenderCatalog(CATALOG, ACTIONS)}
        spec={specFromLines([
          { op: 'add', path: '/state', value: {} },
          { op: 'add', path: '/root', value: 'root' },
          element('root', { type: 'Stack', children: ['f', 'go', 'plain'] }),
          element('f', { type: 'Input', props: { ...FIELD, value: { $bindState: '/v' } } }),
          element('go', { type: 'Button', props: { label: 'Send', submit: true }, on }),
          element('plain', { type: 'Button', props: { label: 'Plain' }, on }),
        ])}
        onAction={onAction}
      />
    );
  },
  OpenUI: (onAction: () => void) => (
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, ACTIONS)}
      program={[
        'root = Stack(null, null, [f, go, plain])',
        'f = Input("Name", $v, null, null, true, 3)',
        'go = Button("Send", null, null, true, @submit({v: $v}))',
        'plain = Button("Plain", null, null, null, @submit({v: $v}))',
        '$v = null',
      ].join('\n')}
      onAction={onAction}
      onError={rstest.fn()}
    />
  ),
};

for (const [format, surface] of Object.entries(surfaces)) {
  describe(`form validation in ${format}`, () => {
    it('shows no error before the user touches the form, then the one for the value', async () => {
      render(surface(rstest.fn()));
      const field = await screen.findByLabelText(/Name/);
      expect(screen.queryByRole('alert')).toBeNull();
      await userEvent.type(field, 'ab');
      expect(await screen.findByText('At least 3 characters')).toBeTruthy();
    });

    it('holds a submit back and shows the errors, then sends once the value is fixed', async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      await userEvent.click(await screen.findByRole('button', { name: 'Send' }));
      expect(await screen.findByText('Required')).toBeTruthy();
      expect(onAction).not.toHaveBeenCalled();
      await userEvent.type(screen.getByLabelText(/Name/), 'abc');
      expect(screen.queryByRole('alert')).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'Send' }));
      expect(onAction).toHaveBeenCalledWith('submit', { v: 'abc' });
    });

    it('lets a plain Button fire whatever the form holds', async () => {
      const onAction = rstest.fn();
      render(surface(onAction));
      await userEvent.click(await screen.findByRole('button', { name: 'Plain' }));
      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });
}

it.each([
  [textError({ value: '' }), undefined],
  [textError({ value: '  ', required: true }), 'Required'],
  [textError({ value: '', minLength: 3 }), undefined],
  [textError({ value: 'ab', minLength: 3 }), 'At least 3 characters'],
  [textError({ value: 'abcd', maxLength: 3 }), 'At most 3 characters'],
  [textError({ value: 'web-01', pattern: '[a-z0-9-]+' }), undefined],
  [textError({ value: 'web-01x', pattern: '[a-z]+' }), "Doesn't match the expected format"],
  [textError({ value: 'a b', pattern: '\\S+', patternMessage: 'No spaces' }), 'No spaces'],
  [rangeError({ value: undefined }), undefined],
  [rangeError({ value: undefined, required: true }), 'Required'],
  [rangeError({ value: 0, min: 1, max: 10 }), 'At least 1'],
  [rangeError({ value: 11, min: 1, max: 10 }), 'At most 10'],
  [rangeError({ value: 10, min: 1, max: 10 }), undefined],
  [
    rangeError({ value: '2026-10-31', min: '2026-11-01' }, NOT_BEFORE_AFTER),
    'Not before 2026-11-01',
  ],
  [rangeError({ value: '18:00', max: '17:59' }, NOT_BEFORE_AFTER), 'Not after 17:59'],
  [SelectComponent.validate?.({ label: 'L', options: [], required: true }), 'Required'],
  [
    DateRangeInputComponent.validate?.({
      label: 'L',
      value: { start: '2026-11-01' },
      required: true,
    }),
    'Required',
  ],
])('validates edge case %#', (actual, expected) => {
  expect(actual).toBe(expected);
});

it('rejects a pattern that is not a regular expression', () => {
  expect(textRules.pattern.safeParse('[a-').success).toBe(false);
});
