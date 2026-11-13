import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { CardComponent } from '../components/Card';
import { SeparatorComponent } from '../components/Separator';
import { StackComponent } from '../components/Stack';
import { TextComponent } from '../components/Text';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [CardComponent, StackComponent, TextComponent, SeparatorComponent];

const a2ui = (text: unknown, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/note', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [
          { id: 'root', component: 'Card', children: ['stack'] },
          { id: 'stack', component: 'Stack', children: ['a', 'sep', 'b'] },
          { id: 'a', component: 'Text', text: 'Before' },
          { id: 'sep', component: 'Separator' },
          { id: 'b', component: 'Text', text },
        ],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (text: unknown, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Card', props: {}, children: ['stack'] } },
  {
    op: 'add',
    path: '/elements/stack',
    value: { type: 'Stack', props: {}, children: ['a', 'sep', 'b'] },
  },
  { op: 'add', path: '/elements/a', value: { type: 'Text', props: { text: 'Before' } } },
  { op: 'add', path: '/elements/sep', value: { type: 'Separator', props: {} } },
  { op: 'add', path: '/elements/b', value: { type: 'Text', props: { text } } },
];

const openUi = (text: string) =>
  `root = Card([stack])\nstack = Stack(null, null, [a, sep, b])\na = Text("Before")\nsep = Separator()\nb = Text(${text})`;

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

const expectSeparated = async () => {
  expect(await screen.findByText('After')).toBeTruthy();
  expect(screen.getByText('Before')).toBeTruthy();
  expect(screen.getByRole('separator')).toBeTruthy();
};

describe('Separator', () => {
  it('renders a separator in A2UI, literal and bound', async () => {
    const view = renderA2ui(a2ui('After'));
    await expectSeparated();
    view.unmount();
    renderA2ui(a2ui({ '@path': '/note/text' }, { text: 'After' }));
    await expectSeparated();
  });

  it('renders a separator in json-render, literal and bound', async () => {
    const view = renderJsonRender(jsonRender('After'));
    await expectSeparated();
    view.unmount();
    renderJsonRender(jsonRender({ $state: '/note/text' }, { note: { text: 'After' } }));
    await expectSeparated();
  });

  it('renders a separator in OpenUI Lang, literal and bound', async () => {
    const view = renderOpenUi(openUi('"After"'));
    await expectSeparated();
    view.unmount();
    renderOpenUi(openUi('$note.text'), { note: { text: 'After' } });
    await expectSeparated();
  });

  it('keeps the separator while a sibling waits for data, with no console error', async () => {
    const error = rstest.spyOn(console, 'error');
    const view = renderA2ui(a2ui({ '@path': '/note/text' }));
    expect(await findPlaceholder('Text')).toBeTruthy();
    expect(screen.getByRole('separator')).toBeTruthy();
    view.unmount();
    const json = renderJsonRender(jsonRender({ $state: '/none' }));
    expect(await findPlaceholder('Text')).toBeTruthy();
    expect(screen.getByRole('separator')).toBeTruthy();
    json.unmount();
    renderOpenUi(openUi('$note.text'));
    expect(await screen.findByRole('separator')).toBeTruthy();
    expect(screen.queryByText('After')).toBeNull();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('ignores stray agent props and arguments, with no console error', async () => {
    const error = rstest.spyOn(console, 'error');
    const stray = { text: '<b>x</b>', spacing: 144, orientation: 'vertical', decorative: true };
    const messages = a2ui('After');
    const update = messages.at(-1) as unknown as { updateComponents: { components: object[] } };
    update.updateComponents.components[3] = { id: 'sep', component: 'Separator', ...stray };
    const view = renderA2ui(messages);
    await expectSeparated();
    view.unmount();
    const lines = jsonRender('After');
    lines[4] = { op: 'add', path: '/elements/sep', value: { type: 'Separator', props: stray } };
    const json = renderJsonRender(lines);
    await expectSeparated();
    json.unmount();
    renderOpenUi(openUi('"After"').replace('Separator()', 'Separator("<b>x</b>", 144)'));
    await expectSeparated();
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
    expect(screen.queryByText('<b>x</b>')).toBeNull();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
