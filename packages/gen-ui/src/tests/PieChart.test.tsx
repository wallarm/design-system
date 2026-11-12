import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { PieChartComponent } from '../components/PieChart';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';

const ITEMS = [
  { label: '4XX', value: 700, color: 'amber' },
  { label: '2XX', value: 540, color: 'green' },
];
const PROPS = { title: 'Status codes', centerLabel: 'requests' };
const a2ui = createA2uiCatalog([PieChartComponent]);
const jsonRender = createJsonRenderCatalog([PieChartComponent], []);

const renderA2ui = (items: unknown, data?: unknown) => {
  const messages: A2uiMessage[] = [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
  ];
  if (data !== undefined) {
    messages.push({
      version: '1.0',
      updateDataModel: { surfaceId: 's', path: '/codes', value: data },
    });
  }
  messages.push({
    version: '1.0',
    updateComponents: {
      surfaceId: 's',
      components: [{ id: 'root', component: 'PieChart', ...PROPS, items }],
    },
  });
  return render(
    <A2uiSurfaces catalog={a2ui} messages={messages} actions={[]} onAction={rstest.fn()} />,
  );
};

const renderJsonRender = (items: unknown, state?: unknown) =>
  render(
    <JsonRenderSurface
      catalog={jsonRender}
      spec={specFromLines([
        ...(state === undefined
          ? []
          : [{ op: 'add' as const, path: '/state', value: { codes: state } }]),
        { op: 'add', path: '/root', value: 'root' },
        {
          op: 'add',
          path: '/elements/root',
          value: { type: 'PieChart', props: { ...PROPS, items }, children: [] },
        },
      ])}
      onAction={rstest.fn()}
    />,
  );

const expectChart = async () => {
  expect(await screen.findByText('Status codes')).toBeTruthy();
  expect(screen.getByText('4XX')).toBeTruthy();
  expect(screen.getByText('700')).toBeTruthy();
  expect(screen.getByText('1,240')).toBeTruthy(); // centre total
  expect(screen.getByText('requests')).toBeTruthy();
};

describe('PieChart', () => {
  it('renders literal props in A2UI', async () => {
    renderA2ui(ITEMS);
    await expectChart();
  });

  it('renders bound data in A2UI', async () => {
    renderA2ui({ '@path': '/codes' }, ITEMS);
    await expectChart();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(ITEMS);
    await expectChart();
  });

  it('renders bound state in json-render', async () => {
    renderJsonRender({ $state: '/codes' }, ITEMS);
    await expectChart();
  });

  it('holds a placeholder while a binding has not resolved yet', async () => {
    const view = renderA2ui({ '@path': '/codes' });
    expect(await screen.findByText('PieChart')).toBeTruthy();
    view.unmount();
    renderJsonRender({ $state: '/codes' });
    expect(await screen.findByText('PieChart')).toBeTruthy();
  });
});
