import type { SpecStreamLine } from '@json-render/core';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { ProgressComponent } from '../components/Progress';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [ProgressComponent];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/scan', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'Progress', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Progress', props, children: [] } },
];

const renderA2ui = (messages: A2uiMessage[]) =>
  render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(CATALOG)}
      messages={messages}
      actions={[]}
      onAction={rstest.fn()}
    />,
  );

const renderJsonRender = (lines: SpecStreamLine[]) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(CATALOG, [])}
      spec={specFromLines(lines)}
      onAction={rstest.fn()}
    />,
  );

const renderOpenUi = (program: string, data?: Record<string, unknown>) =>
  render(
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, [])}
      program={program}
      data={data}
      onAction={rstest.fn()}
      onError={rstest.fn()}
    />,
  );

const expectProgress = async (now: string, max = '100') => {
  const bar = await screen.findByRole('progressbar');
  expect(bar.getAttribute('aria-valuenow')).toBe(now);
  expect(bar.getAttribute('aria-valuemax')).toBe(max);
  return bar;
};

const expectPlaceholder = async () => {
  expect(await findPlaceholder('Progress')).toBeTruthy();
  expect(screen.queryByRole('progressbar')).toBeNull();
};

describe('Progress', () => {
  let error: ReturnType<typeof rstest.spyOn>;
  beforeEach(() => {
    error = rstest.spyOn(console, 'error');
  });
  afterEach(() => {
    cleanup();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('renders literal props in A2UI with the caption and percent', async () => {
    renderA2ui(a2ui({ value: 42, label: 'Scan progress', showValue: true, color: 'green' }));
    await expectProgress('42');
    expect(screen.getByText('Scan progress')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(jsonRender({ value: 30, max: 60, label: 'Quota used' }));
    await expectProgress('30', '60');
    expect(screen.getByText('Quota used')).toBeTruthy();
  });

  it('renders literal props in OpenUI', async () => {
    renderOpenUi('root = Progress(42, null, "Scan progress")');
    await expectProgress('42');
    expect(screen.getByText('Scan progress')).toBeTruthy();
  });

  it('renders a value bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ value: { '@path': '/scan/done' }, max: 200 }, { done: 50 }));
    await expectProgress('50', '200');
  });

  it('renders a value bound to json-render state', async () => {
    renderJsonRender(jsonRender({ value: { $state: '/scan/done' } }, { scan: { done: 75 } }));
    await expectProgress('75');
  });

  it('renders a value bound to OpenUI data', async () => {
    renderOpenUi('root = Progress($scan.done, $scan.total)', { scan: { done: 9, total: 12 } });
    await expectProgress('9', '12');
  });

  it('clamps a value above max', async () => {
    renderA2ui(a2ui({ value: 150 }));
    await expectProgress('100');
    cleanup();
    renderJsonRender(jsonRender({ value: 9, max: 5 }));
    await expectProgress('5', '5');
    cleanup();
    renderOpenUi('root = Progress(120)');
    await expectProgress('100');
  });

  it('holds the skeleton for a null value: there is no indeterminate bar', async () => {
    renderJsonRender(jsonRender({ value: null, label: 'Starting' }));
    expect(await findPlaceholder('Progress')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('re-clamps when streamed data moves past max', async () => {
    const view = renderOpenUi('root = Progress($done, $total)', { done: 3, total: 10 });
    await expectProgress('3', '10');
    view.rerender(
      <OpenUiSurface
        library={createOpenUiLibrary(CATALOG, [])}
        program='root = Progress($done, $total)'
        data={{ done: 40, total: 20 }}
        onAction={rstest.fn()}
        onError={rstest.fn()}
      />,
    );
    await expectProgress('20', '20');
  });

  it('holds a placeholder while bound data has not arrived', async () => {
    renderA2ui(a2ui({ value: { '@path': '/scan/done' } }));
    await expectPlaceholder();
    cleanup();
    renderJsonRender(jsonRender({ value: { $state: '/scan/done' } }));
    await expectPlaceholder();
    cleanup();
    renderOpenUi('root = Progress($scan.done)');
    await expectPlaceholder();
  });

  it('shows a placeholder for invalid props', async () => {
    renderA2ui(a2ui({ value: -1 }));
    await expectPlaceholder();
    cleanup();
    renderJsonRender(jsonRender({ value: 10, max: 0 }));
    await expectPlaceholder();
    cleanup();
    // OpenUI's parser drops a literal of the wrong type; bound data reaches the schema.
    renderOpenUi('root = Progress($done)', { done: 'half' });
    await expectPlaceholder();
  });
});
