import type { SpecStreamLine } from '@json-render/core';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { EmptyStateComponent } from '../components/EmptyState';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [EmptyStateComponent];
const ACTIONS = [{ name: 'reset_filters', description: 'Clears the attack filters.' }];
const TITLE = 'No attacks found';
const DESCRIPTION = 'Try a different filter or reset it.';

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/empty', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'EmptyState', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (
  props: Record<string, unknown>,
  state?: unknown,
  on?: Record<string, unknown>,
): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  {
    op: 'add',
    path: '/elements/root',
    value: { type: 'EmptyState', props, ...(on ? { on } : {}), children: [] },
  },
];

const renderA2ui = (messages: A2uiMessage[], onAction = rstest.fn()) =>
  render(
    <A2uiSurfaces
      catalog={createA2uiCatalog(CATALOG)}
      messages={messages}
      actions={ACTIONS}
      onAction={onAction}
    />,
  );

const renderJsonRender = (lines: SpecStreamLine[], onAction = rstest.fn()) =>
  render(
    <JsonRenderSurface
      catalog={createJsonRenderCatalog(CATALOG, ACTIONS)}
      spec={specFromLines(lines)}
      onAction={onAction}
    />,
  );

const renderOpenUi = (program: string, data?: Record<string, unknown>, onAction = rstest.fn()) =>
  render(
    <OpenUiSurface
      library={createOpenUiLibrary(CATALOG, ACTIONS)}
      program={program}
      data={data}
      onAction={onAction}
      onError={rstest.fn()}
    />,
  );

const expectEmptyState = async (description = true) => {
  expect(await screen.findByText(TITLE)).toBeTruthy();
  expect(screen.getByRole('status')).toBeTruthy();
  expect(screen.queryByText(DESCRIPTION) !== null).toBe(description);
};

const expectPlaceholder = async () => {
  expect(await findPlaceholder('EmptyState')).toBeTruthy();
  expect(screen.queryByText(TITLE)).toBeNull();
};

const pressReset = async (onAction: ReturnType<typeof rstest.fn>) => {
  await userEvent.click(await screen.findByRole('button', { name: 'Reset filters' }));
  await waitFor(() => expect(onAction).toHaveBeenCalledWith('reset_filters', { scope: 'all' }));
  expect(onAction).toHaveBeenCalledTimes(1);
};

describe('EmptyState', () => {
  let error: ReturnType<typeof rstest.spyOn>;
  beforeEach(() => {
    error = rstest.spyOn(console, 'error');
  });
  afterEach(() => {
    cleanup();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('renders literal props in A2UI, with no button without actionLabel', async () => {
    renderA2ui(a2ui({ title: TITLE, description: DESCRIPTION }));
    await expectEmptyState();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(jsonRender({ title: TITLE, type: 'no-results' }));
    await expectEmptyState(false);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders literal props in OpenUI', async () => {
    renderOpenUi(`root = EmptyState("${TITLE}", "${DESCRIPTION}", "collection-empty")`);
    await expectEmptyState();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders props bound to the A2UI data model', async () => {
    renderA2ui(
      a2ui(
        { title: { '@path': '/empty/title' }, description: { '@path': '/empty/description' } },
        { title: TITLE, description: DESCRIPTION },
      ),
    );
    await expectEmptyState();
  });

  it('renders props bound to json-render state', async () => {
    renderJsonRender(
      jsonRender(
        { title: { $state: '/empty/title' }, description: { $state: '/empty/description' } },
        { empty: { title: TITLE, description: DESCRIPTION } },
      ),
    );
    await expectEmptyState();
  });

  it('renders props bound to OpenUI data', async () => {
    renderOpenUi('root = EmptyState($empty.title, $empty.description)', {
      empty: { title: TITLE, description: DESCRIPTION },
    });
    await expectEmptyState();
  });

  it('sends an allowlisted action on press in A2UI', async () => {
    const onAction = rstest.fn();
    renderA2ui(
      a2ui({
        title: TITLE,
        actionLabel: 'Reset filters',
        press: { event: { name: 'reset_filters', context: { scope: 'all' } } },
      }),
      onAction,
    );
    await pressReset(onAction);
  });

  it('sends an allowlisted action on press in json-render', async () => {
    const onAction = rstest.fn();
    renderJsonRender(
      jsonRender({ title: TITLE, actionLabel: 'Reset filters' }, undefined, {
        press: { action: 'reset_filters', params: { scope: 'all' } },
      }),
      onAction,
    );
    await pressReset(onAction);
  });

  it('sends an allowlisted action on press in OpenUI', async () => {
    const onAction = rstest.fn();
    renderOpenUi(
      `root = EmptyState("${TITLE}", null, null, "Reset filters", @reset_filters({scope: "all"}))`,
      undefined,
      onAction,
    );
    await pressReset(onAction);
  });

  it('holds a placeholder while bound data has not arrived', async () => {
    renderA2ui(a2ui({ title: { '@path': '/empty/title' } }));
    await expectPlaceholder();
    cleanup();
    renderJsonRender(jsonRender({ title: { $state: '/empty/title' } }));
    await expectPlaceholder();
    cleanup();
    renderOpenUi('root = EmptyState($empty.title)');
    await expectPlaceholder();
  });

  it('holds a placeholder for a blank title and drops a blank action label', async () => {
    renderJsonRender(jsonRender({ title: '   ' }));
    await expectPlaceholder();
    cleanup();
    renderJsonRender(jsonRender({ title: TITLE, actionLabel: '  ' }));
    await expectEmptyState(false);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders hostile strings as text, never as markup', async () => {
    renderJsonRender(jsonRender({ title: '<img src=x onerror=alert(1)>' }));
    expect(await screen.findByText('<img src=x onerror=alert(1)>')).toBeTruthy();
    expect(document.querySelector('img')).toBeNull();
  });

  it('never draws an unknown type', async () => {
    // A2UI enums stay literal: the processor rejects the component and it never renders.
    renderA2ui(a2ui({ title: TITLE, type: 'error' }));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(screen.queryByText(TITLE)).toBeNull();
    cleanup();
    renderJsonRender(jsonRender({ title: TITLE, type: 'error' }));
    await expectPlaceholder();
    cleanup();
    // OpenUI's parser drops a bad literal; a bound one reaches the schema check.
    renderOpenUi(`root = EmptyState("${TITLE}", null, $empty.type)`, { empty: { type: 'error' } });
    await expectPlaceholder();
  });
});
