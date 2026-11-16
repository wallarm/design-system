import type { SpecStreamLine } from '@json-render/core';
import { afterEach, describe, expect, it, rstest } from '@rstest/core';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { DialogComponent } from '../components/Dialog';
import { TextComponent } from '../components/Text';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

afterEach(cleanup);

const CATALOG = [DialogComponent, TextComponent];
const PROPS = { triggerLabel: 'Show payload', description: 'Blocked at 12:04' };

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
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
          { id: 'root', component: 'Dialog', ...props, children: ['body'] },
          { id: 'body', component: 'Text', text: 'POST /login' },
        ],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Dialog', props, children: ['body'] } },
  {
    op: 'add',
    path: '/elements/body',
    value: { type: 'Text', props: { text: 'POST /login' }, children: [] },
  },
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

const renderOpenUi = (title: string, data?: Record<string, unknown>) =>
  render(
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, [])}
      program={`root = Dialog("Show payload", ${title}, "Blocked at 12:04", "large", [body])\nbody = Text("POST /login")`}
      data={data}
      onAction={rstest.fn()}
      onError={rstest.fn()}
    />,
  );

/** Opens the dialog, checks its content, then closes it with Escape. */
const expectDialog = async () => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Show payload' }));
  expect(await screen.findByRole('dialog', { name: 'Request 42' })).toBeTruthy();
  expect(screen.getByText('Blocked at 12:04')).toBeTruthy();
  expect(screen.getByText('POST /login')).toBeTruthy();
  // zag registers its Escape listener a frame after opening.
  await act(() => new Promise(resolve => setTimeout(resolve, 50)));
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByText('POST /login')).toBeNull());
};

describe('Dialog', () => {
  it('opens literal props from A2UI', async () => {
    renderA2ui(a2ui({ ...PROPS, title: 'Request 42', size: 'small' }));
    await expectDialog();
  });

  it('opens a title bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ ...PROPS, title: { '@path': '/req/title' } }, { title: 'Request 42' }));
    await expectDialog();
  });

  it('opens literal props from json-render', async () => {
    renderJsonRender(jsonRender({ ...PROPS, title: 'Request 42' }));
    await expectDialog();
  });

  it('opens a title bound to json-render state', async () => {
    renderJsonRender(
      jsonRender({ ...PROPS, title: { $state: '/req/title' } }, { req: { title: 'Request 42' } }),
    );
    await expectDialog();
  });

  it('opens a literal OpenUI program', async () => {
    renderOpenUi('"Request 42"');
    await expectDialog();
  });

  it('opens an OpenUI title bound to app data', async () => {
    renderOpenUi('$req.title', { req: { title: 'Request 42' } });
    await expectDialog();
  });

  it('holds a placeholder while the title is missing', async () => {
    const error = rstest.spyOn(console, 'error');
    renderA2ui(a2ui({ ...PROPS, title: { '@path': '/req/title' } }));
    expect(await findPlaceholder('Dialog')).toBeTruthy();
    cleanup();
    renderJsonRender(jsonRender(PROPS));
    expect(await findPlaceholder('Dialog')).toBeTruthy();
    cleanup();
    renderJsonRender(jsonRender({ ...PROPS, title: { $state: '/none' } }));
    expect(await findPlaceholder('Dialog')).toBeTruthy();
    cleanup();
    renderOpenUi('$req.title');
    expect(await findPlaceholder('Dialog')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Show payload' })).toBeNull();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('holds a placeholder for an empty label or title and an unknown size', async () => {
    const error = rstest.spyOn(console, 'error');
    for (const props of [
      { ...PROPS, triggerLabel: '', title: 'Request 42' },
      { ...PROPS, title: '' },
      { ...PROPS, title: 'Request 42', size: 'huge' },
      { ...PROPS, title: 42 },
    ]) {
      renderJsonRender(jsonRender(props));
      expect(await findPlaceholder('Dialog')).toBeTruthy();
      expect(screen.queryByText('POST /login')).toBeNull();
      cleanup();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
