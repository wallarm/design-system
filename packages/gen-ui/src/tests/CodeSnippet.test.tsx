import type { SpecStreamLine } from '@json-render/core';
import { describe, expect, it, rstest } from '@rstest/core';
import { render, screen, waitFor } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { CodeSnippetComponent } from '../components/CodeSnippet';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [CodeSnippetComponent];
const CODE = 'GET /api/v1/users HTTP/1.1\nHost: api.example.com';
const HOSTILE = '<script>alert(1)</script>\n<img src=x onerror="alert(2)">';

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
        components: [{ id: 'root', component: 'CodeSnippet', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'CodeSnippet', props, children: [] } },
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

/** Highlighting splits a line into tokens, so match the line's whole text. */
const findLine = (line: string) =>
  waitFor(() => {
    const found = [...document.querySelectorAll('pre *')].find(el => el.textContent === line);
    if (!found) throw new Error(`no line ${line}`);
    return found;
  });

const expectSnippet = async () => {
  expect(await findLine('GET /api/v1/users HTTP/1.1')).toBeTruthy();
  expect(await findLine('Host: api.example.com')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
};

describe('CodeSnippet', () => {
  it('renders literal props in A2UI, with a title', async () => {
    renderA2ui(a2ui({ code: CODE, language: 'http', title: 'Request' }));
    await expectSnippet();
    expect(screen.getByText('Request')).toBeTruthy();
  });

  it('renders literal props in json-render', async () => {
    renderJsonRender(jsonRender({ code: CODE, language: 'http', wrapLines: true }));
    await expectSnippet();
  });

  it('renders literal props in OpenUI', async () => {
    renderOpenUi(`root = CodeSnippet(${JSON.stringify(CODE)}, "http", "Request")`);
    await expectSnippet();
    expect(screen.getByText('Request')).toBeTruthy();
  });

  it('renders code bound to the A2UI data model', async () => {
    renderA2ui(a2ui({ code: { '@path': '/req' }, language: 'http' }, CODE));
    await expectSnippet();
  });

  it('renders code bound to json-render state', async () => {
    renderJsonRender(jsonRender({ code: { $state: '/req' } }, { req: CODE }));
    await expectSnippet();
  });

  it('renders code bound to OpenUI data', async () => {
    renderOpenUi('root = CodeSnippet($req)', { req: CODE });
    await expectSnippet();
  });

  it('collapses past maxLines with the show-more button', async () => {
    const code = Array.from({ length: 12 }, (_, i) => `line ${i + 1}`).join('\n');
    renderA2ui(a2ui({ code, maxLines: 3 }));
    expect(await findLine('line 3')).toBeTruthy();
    expect(screen.queryByText('line 4')).toBeNull();
    expect(screen.getByRole('button', { name: /Show more/ })).toBeTruthy();
  });

  it('applies wrapLines that arrives after the code has rendered', async () => {
    const catalog = createJsonRenderCatalog(CATALOG, []);
    const spec = (props: Record<string, unknown>) => specFromLines(jsonRender(props));
    const view = render(
      <JsonRenderSurface catalog={catalog} spec={spec({ code: CODE })} onAction={rstest.fn()} />,
    );
    const line = await findLine('GET /api/v1/users HTTP/1.1');
    expect(line.closest('.whitespace-pre-wrap')).toBeNull();
    view.rerender(
      <JsonRenderSurface
        catalog={catalog}
        spec={spec({ code: CODE, wrapLines: true })}
        onAction={rstest.fn()}
      />,
    );
    await waitFor(() => {
      const wrapped = [...document.querySelectorAll('pre *')].find(
        el => el.textContent === 'GET /api/v1/users HTTP/1.1',
      );
      expect(wrapped?.closest('.whitespace-pre-wrap')).toBeTruthy();
    });
  });

  it('renders markup as literal text, creating no element', async () => {
    renderJsonRender(jsonRender({ code: HOSTILE, language: 'xml' }));
    expect(await findLine('<script>alert(1)</script>')).toBeTruthy();
    expect(await findLine('<img src=x onerror="alert(2)">')).toBeTruthy();
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
  });

  it('holds a placeholder for missing data or invalid props, without console errors', async () => {
    const error = rstest.spyOn(console, 'error');
    const cases = [
      () => renderA2ui(a2ui({ code: { '@path': '/req' } })),
      () => renderA2ui(a2ui({ code: '' })),
      () => renderA2ui(a2ui({ code: CODE, maxLines: 0 })),
      () => renderJsonRender(jsonRender({ code: { $state: '/none' } })),
      () => renderJsonRender(jsonRender({ code: CODE, language: 'cobol' })),
      () => renderOpenUi('root = CodeSnippet($req)'),
    ];
    for (const run of cases) {
      const view = run();
      expect(await findPlaceholder('CodeSnippet')).toBeTruthy();
      view.unmount();
    }
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
