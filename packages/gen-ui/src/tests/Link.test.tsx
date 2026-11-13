import type { SpecStreamLine } from '@json-render/core';
import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { cleanup, render, screen } from '@testing-library/react';
import {
  type A2uiMessage,
  A2uiSurfaces,
  createA2uiCatalog,
  WALLARM_A2UI_CATALOG_ID,
} from '../a2ui';
import { LinkComponent } from '../components/Link';
import { isSafeHref } from '../core/guards';
import { createJsonRenderCatalog, JsonRenderSurface, specFromLines } from '../json-render';
import { createOpenUiLibrary, OpenUiSurface } from '../openui';
import { findPlaceholder } from './findPlaceholder';

const CATALOG = [LinkComponent];

const SAFE = ['https://nvd.nist.gov/vuln/detail/CVE-2026-1234', '/api-inventory?host=a', '/'];
const UNSAFE = [
  'javascript:alert(1)',
  'JavaScript:alert(1)',
  ' javascript:alert(1)',
  'java\tscript:alert(1)',
  'data:text/html,<b>x</b>',
  'vbscript:msgbox(1)',
  'blob:https://example.com/x',
  'http://example.com',
  'HTTPS://example.com',
  '//evil.com',
  '/\\evil.com',
  '\\\\evil.com',
  'https:/evil.com',
  'https://',
  'https://exa mple.com',
  'https://nvd.nist.gov@evil.com',
  'https://user:pass@evil.com',
  'https:\\\\evil.com',
  '/docs\u0000',
  '/docs\n',
  'docs/page',
  '',
];

const a2ui = (props: Record<string, unknown>, data?: unknown): A2uiMessage[] =>
  [
    { version: '1.0', createSurface: { surfaceId: 's', catalogId: WALLARM_A2UI_CATALOG_ID } },
    ...(data === undefined
      ? []
      : [{ version: '1.0', updateDataModel: { surfaceId: 's', path: '/ref', value: data } }]),
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 's',
        components: [{ id: 'root', component: 'Link', ...props }],
      },
    },
  ] as unknown as A2uiMessage[];

const jsonRender = (props: Record<string, unknown>, state?: unknown): SpecStreamLine[] => [
  ...(state === undefined ? [] : [{ op: 'add' as const, path: '/state', value: state }]),
  { op: 'add', path: '/root', value: 'root' },
  { op: 'add', path: '/elements/root', value: { type: 'Link', props, children: [] } },
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

const expectLink = async (href: string) => {
  const link = await screen.findByRole('link', { name: 'CVE-2026-1234' });
  expect(link.getAttribute('href')).toBe(href);
  return link;
};

const expectNoLink = async () => {
  expect(await findPlaceholder('Link')).toBeTruthy();
  expect(screen.queryByRole('link')).toBeNull();
  expect(document.querySelector('a')).toBeNull();
};

const CVE = 'https://nvd.nist.gov/vuln/detail/CVE-2026-1234';

describe('isSafeHref', () => {
  it.each(SAFE)('allows %j', href => expect(isSafeHref(href)).toBe(true));
  it.each(UNSAFE)('rejects %j', href => expect(isSafeHref(href)).toBe(false));
});

describe('Link', () => {
  let error: ReturnType<typeof rstest.spyOn>;
  beforeEach(() => {
    error = rstest.spyOn(console, 'error');
  });
  afterEach(() => {
    cleanup();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('renders literal props in A2UI; external links open in a new tab', async () => {
    renderA2ui(a2ui({ label: 'CVE-2026-1234', href: CVE }));
    const link = await expectLink(CVE);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer nofollow');
  });

  it('renders literal props in json-render; app paths stay in the tab', async () => {
    renderJsonRender(jsonRender({ label: 'CVE-2026-1234', href: '/cves/1234', tone: 'muted' }));
    const link = await expectLink('/cves/1234');
    expect(link.getAttribute('target')).toBeNull();
    expect(link.getAttribute('rel')).toBeNull();
  });

  it('renders literal props in OpenUI', async () => {
    renderOpenUi(`root = Link("CVE-2026-1234", "${CVE}", "muted")`);
    await expectLink(CVE);
  });

  it('renders props bound to the A2UI data model', async () => {
    renderA2ui(
      a2ui(
        { label: { '@path': '/ref/label' }, href: { '@path': '/ref/href' } },
        { label: 'CVE-2026-1234', href: CVE },
      ),
    );
    await expectLink(CVE);
  });

  it('renders props bound to json-render state', async () => {
    renderJsonRender(
      jsonRender(
        { label: { $state: '/ref/label' }, href: { $state: '/ref/href' } },
        { ref: { label: 'CVE-2026-1234', href: CVE } },
      ),
    );
    await expectLink(CVE);
  });

  it('renders props bound to OpenUI data', async () => {
    renderOpenUi('root = Link($ref.label, $ref.href)', {
      ref: { label: 'CVE-2026-1234', href: CVE },
    });
    await expectLink(CVE);
  });

  it('holds a placeholder while bound data has not arrived', async () => {
    renderA2ui(a2ui({ label: 'CVE-2026-1234', href: { '@path': '/ref/href' } }));
    await expectNoLink();
    cleanup();
    renderJsonRender(jsonRender({ label: 'CVE-2026-1234', href: { $state: '/ref/href' } }));
    await expectNoLink();
    cleanup();
    renderOpenUi('root = Link("CVE-2026-1234", $ref.href)');
    await expectNoLink();
  });

  it.each(UNSAFE)('shows a placeholder, not an anchor, for %j', async href => {
    renderA2ui(a2ui({ label: 'x', href }));
    await expectNoLink();
    cleanup();
    renderJsonRender(jsonRender({ label: 'x', href }));
    await expectNoLink();
    cleanup();
    renderOpenUi(`root = Link("x", ${JSON.stringify(href)})`);
    await expectNoLink();
  });

  it('shows a placeholder for an empty label', async () => {
    renderA2ui(a2ui({ label: '', href: CVE }));
    await expectNoLink();
    cleanup();
    renderJsonRender(jsonRender({ label: '', href: CVE }));
    await expectNoLink();
  });

  // A2UI drops a message that breaks its JSON schema outright (it logs a warning), so nothing renders.
  it.each([
    ['a missing href', { label: 'x' }],
    ['a non-string href', { label: 'x', href: 42 }],
    ['an unknown tone', { label: 'x', href: CVE, tone: 'danger' }],
  ])('renders no anchor for %s', async (_, props) => {
    renderA2ui(a2ui(props));
    expect(document.querySelector('a')).toBeNull();
    cleanup();
    renderJsonRender(jsonRender(props));
    await expectNoLink();
  });
});
