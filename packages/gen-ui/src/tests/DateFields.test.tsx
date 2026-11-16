import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateFormatProvider } from '@wallarm-org/design-system/DateFormatProvider';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { ButtonComponent } from '../components/Button';
import { DateInputComponent } from '../components/DateInput';
import { DateRangeInputComponent } from '../components/DateRangeInput';
import { StackComponent } from '../components/Stack';
import { TimeInputComponent } from '../components/TimeInput';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';

afterEach(cleanup);

const CATALOG = [
  StackComponent,
  DateInputComponent,
  DateRangeInputComponent,
  TimeInputComponent,
  ButtonComponent,
];
const ACTIONS = [{ name: 'submit', description: 'Sends the form.' }];

/** The segments read day, month, year and 24-hour time wherever the test runs. */
const withFormat = (node: ReactNode) => (
  <DateFormatProvider order='day-first' hourCycle={24}>
    {node}
  </DateFormatProvider>
);

/** Types into the segments from the first one; each full segment moves focus to the next. */
const typeSegments = async (keys: string) => {
  const segments = await screen.findAllByRole('spinbutton');
  await userEvent.click(segments[0] ?? document.body);
  await userEvent.keyboard(keys);
};

const segmentText = () => screen.getAllByRole('spinbutton').map(segment => segment.textContent);

interface DateCase {
  type: string;
  props: Record<string, unknown>;
  openUiArgs: (binding: string) => string;
  fill: () => Promise<void>;
  sent: unknown;
  /** A literal the agent sends, and how the segments read. */
  literal: unknown;
  shown: string[];
}

const DATE: DateCase = {
  type: 'DateInput',
  props: { label: 'Starts on' },
  openUiArgs: b => `"Starts on", ${b}`,
  fill: () => typeSegments('15112026'),
  sent: '2026-11-15',
  literal: '2026-03-07',
  shown: ['7', 'Mar', '2026'],
};

const CASES: DateCase[] = [
  DATE,
  {
    type: 'DateRangeInput',
    props: { label: 'Report period' },
    openUiArgs: b => `"Report period", ${b}`,
    fill: () => typeSegments('0111202615112026'),
    sent: { start: '2026-11-01', end: '2026-11-15' },
    literal: { start: '2026-03-01', end: '2026-03-07' },
    shown: ['1', 'Mar', '2026', '7', 'Mar', '2026'],
  },
  {
    type: 'TimeInput',
    props: { label: 'Window opens' },
    openUiArgs: b => `"Window opens", ${b}`,
    fill: () => typeSegments('1430'),
    sent: '14:30',
    literal: '09:05',
    shown: ['09', '05'],
  },
];

/** The field bound to `/v`, and a button that sends `/v`: what the user typed reaches the action. */
const surfaces = (c: DateCase) => ({
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
                { id: 'f', component: c.type, ...c.props, value },
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
            props: { ...c.props, value: { $bindState: '/v' } },
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
      it(`sends what the user typed as ISO through the bound path in ${format}`, async () => {
        const onAction = rstest.fn();
        render(withFormat(surface(onAction)));
        await c.fill();
        await userEvent.click(screen.getByRole('button', { name: 'Send' }));
        expect(onAction).toHaveBeenCalledWith('submit', { v: c.sent });
      });
    }

    it('shows a literal the agent sent', async () => {
      render(withFormat(surfaces(c).A2UI(rstest.fn(), c.literal)));
      await screen.findAllByRole('spinbutton');
      expect(segmentText()).toEqual(c.shown);
    });
  });
}

describe('a date the user has not finished', () => {
  it('writes nothing to the bound path', async () => {
    const onAction = rstest.fn();
    render(withFormat(surfaces(DATE).A2UI(onAction)));
    await typeSegments('1511');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onAction).toHaveBeenCalledWith('submit', {});
  });
});
