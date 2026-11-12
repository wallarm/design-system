import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { HorizontalBarStackComponent } from '../components/HorizontalBarStack';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const COMPONENTS = [HorizontalBarStackComponent];
const ITEMS = [
  { name: 'Critical', value: 42, color: 'red' },
  { name: 'High', value: 31, color: 'amber' },
];
const S = 'hbs';

const a2ui = (props: Record<string, unknown>, data?: unknown) =>
  render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(COMPONENTS)}
      messages={
        [
          { version: '1.0', createSurface: { surfaceId: S, catalogId: WALLARM_A2UI_CATALOG_ID } },
          ...(data === undefined
            ? []
            : [{ version: '1.0', updateDataModel: { surfaceId: S, path: '/sev', value: data } }]),
          {
            version: '1.0',
            updateComponents: {
              surfaceId: S,
              components: [{ id: 'root', component: 'HorizontalBarStack', ...props }],
            },
          },
        ] as unknown as A2uiMessage[]
      }
      actions={[]}
      onAction={rstest.fn()}
    />,
  );

const jsonRender = (props: Record<string, unknown>, state?: unknown) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(COMPONENTS, [])}
      spec={specFromLines([
        ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
        { op: 'add', path: '/root', value: 'root' },
        {
          op: 'add',
          path: '/elements/root',
          value: { type: 'HorizontalBarStack', props, children: [] },
        },
      ])}
      onAction={rstest.fn()}
    />,
  );

const expectBar = async () => {
  expect(await screen.findByText('Incidents by severity')).toBeTruthy();
  expect(screen.getByText('Critical')).toBeTruthy();
  expect(screen.getByText('High')).toBeTruthy();
};

describe('HorizontalBarStack', () => {
  it('A2UI: literal props', async () => {
    a2ui({ title: 'Incidents by severity', value: 1240, format: 'compact', items: ITEMS });
    await expectBar();
    expect(screen.getByText('1.2K')).toBeTruthy();
  });

  it('A2UI: bound items', async () => {
    a2ui({ title: 'Incidents by severity', items: { '@path': '/sev' } }, ITEMS);
    await expectBar();
  });

  it('json-render: literal props', async () => {
    jsonRender({ title: 'Incidents by severity', value: 73, items: ITEMS });
    await expectBar();
    expect(screen.getByText('73')).toBeTruthy();
  });

  it('json-render: bound items', async () => {
    jsonRender({ title: 'Incidents by severity', items: { $state: '/sev' } }, { sev: ITEMS });
    await expectBar();
  });

  it('holds a placeholder while bound items are still undefined', async () => {
    const view = a2ui({ title: 'Incidents by severity', items: { '@path': '/sev' } });
    expect(await screen.findByText('HorizontalBarStack')).toBeTruthy();
    view.unmount();
    jsonRender({ title: 'Incidents by severity', items: { $state: '/sev' } }, {});
    expect(await screen.findByText('HorizontalBarStack')).toBeTruthy();
  });
});
