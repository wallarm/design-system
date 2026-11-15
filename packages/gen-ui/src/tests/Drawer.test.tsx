import type { SpecStreamLine } from '@json-render/core';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { DrawerComponent } from '../components/Drawer';
import { TextComponent } from '../components/Text';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [DrawerComponent, TextComponent];
const PROPS = { triggerLabel: 'Show request', title: 'Request', description: 'Raw HTTP' };

const a2ui = (
  props: Record<string, unknown>,
  text: unknown = 'GET /login',
  data?: unknown,
): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/req', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [
          { id: 'root', component: 'Drawer', ...props, children: ['t'] },
          { id: 't', component: 'Text', text },
        ],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (
  props: Record<string, unknown>,
  text: unknown = 'GET /login',
  state?: unknown,
): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Drawer', props, children: ['t'] } },
  { op: 'add', path: '/elements/t', value: { type: 'Text', props: { text }, children: [] } },
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

const OPEN_UI = (text: string) =>
  `root = Drawer("Show request", "Request", "Raw HTTP", null, [t])\nt = Text(${text})`;

const expectOpens = async () => {
  const trigger = await screen.findByRole('button', { name: 'Show request' });
  expect(screen.queryByText('Request')).toBeNull();
  fireEvent.click(trigger);
  expect(await screen.findByText('Request')).toBeTruthy();
  expect(screen.getByText('Raw HTTP')).toBeTruthy();
  expect(screen.getByText('GET /login')).toBeTruthy();
};

describe('Drawer', () => {
  let error: ReturnType<typeof rstest.spyOn>;
  beforeEach(() => {
    error = rstest.spyOn(console, 'error');
  });
  afterEach(() => {
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('opens on the trigger with literal props in A2UI', async () => {
    renderA2ui(a2ui(PROPS));
    await expectOpens();
  });

  it('opens on the trigger with literal props in json-render', async () => {
    renderJsonRender(jsonRender(PROPS));
    await expectOpens();
  });

  it('opens on the trigger with literal props in OpenUI', async () => {
    renderOpenUi(OPEN_UI('"GET /login"'));
    await expectOpens();
  });

  it('renders children bound to the A2UI data model', async () => {
    renderA2ui(a2ui(PROPS, { '@path': '/req/line' }, { line: 'GET /login' }));
    await expectOpens();
  });

  it('renders children bound to json-render state', async () => {
    renderJsonRender(jsonRender(PROPS, { $state: '/req/line' }, { req: { line: 'GET /login' } }));
    await expectOpens();
  });

  it('renders children bound to OpenUI data', async () => {
    renderOpenUi(OPEN_UI('$req.line'), { req: { line: 'GET /login' } });
    await expectOpens();
  });

  it('holds a placeholder while the trigger label has not arrived, in every format', async () => {
    const { triggerLabel: _, ...rest } = PROPS;
    const a = renderA2ui(a2ui({ ...rest, triggerLabel: { '@path': '/req/label' } }));
    expect(await findPlaceholder('Drawer')).toBeTruthy();
    a.unmount();
    const j = renderJsonRender(jsonRender({ ...rest, triggerLabel: { $state: '/none' } }));
    expect(await findPlaceholder('Drawer')).toBeTruthy();
    j.unmount();
    renderOpenUi('root = Drawer($req.label, "Request", null, null, [t])\nt = Text("GET /login")');
    expect(await findPlaceholder('Drawer')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows a placeholder for invalid props instead of a broken drawer', async () => {
    const j = renderJsonRender(jsonRender({ ...PROPS, width: 'huge' }));
    expect(await findPlaceholder('Drawer')).toBeTruthy();
    j.unmount();
    renderJsonRender(jsonRender({ ...PROPS, triggerLabel: '' }));
    expect(await findPlaceholder('Drawer')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders hostile strings as text and applies the width preset', async () => {
    renderJsonRender(
      jsonRender({
        triggerLabel: 'Show request',
        title: '<img src=x onerror=alert(1)>',
        width: 'small',
      }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Show request' }));
    const dialog = await screen.findByRole('dialog', { name: '<img src=x onerror=alert(1)>' });
    expect(document.querySelector('img')).toBeNull();
    expect(dialog.style.width).toBe('640px');
  });
});
