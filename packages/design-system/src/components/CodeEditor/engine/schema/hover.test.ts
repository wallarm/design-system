import { EditorState } from '@codemirror/state';
import { EditorView, type Tooltip } from '@codemirror/view';
import { afterEach, describe, expect, it } from 'vitest';
import type { JsonSchema } from '../../types';
import { findJsonBodyRange, http } from '../languages/http';
import { json } from '../languages/json';
import { schemaHover, schemaHoverSource } from './hover';

const schema: JsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name', description: 'Rule name shown in the list' },
    meta: {
      type: 'object',
      description: 'Metadata',
      properties: { owner: { type: 'string', description: '<b>Owner</b> e-mail' } },
    },
    count: { type: 'number' },
  },
};

type RegionGetter = (state: EditorState) => { from: number; to: number } | null;

const wholeDoc: RegionGetter = state => ({ from: 0, to: state.doc.length });
const views: EditorView[] = [];
afterEach(() => {
  for (const view of views.splice(0)) view.destroy();
});

const viewFor = (doc: string, extensions = [json()]) => {
  const view = new EditorView({ state: EditorState.create({ doc, extensions }) });
  views.push(view);
  return view;
};

const hoverAt = async (view: EditorView, pos: number, getRegion: RegionGetter = wholeDoc) => {
  const result = await schemaHoverSource(() => schema, getRegion)(view, pos, 1);
  return result as Tooltip | null;
};

const render = (view: EditorView, tooltip: Tooltip | null) => tooltip?.create(view).dom;

describe('schemaHoverSource', () => {
  const doc = '{"name": "x", "meta": {"owner": "me"}, "count": 1}';

  it('shows title and description for the key under the pointer', async () => {
    const view = viewFor(doc);
    const tooltip = await hoverAt(view, doc.indexOf('name') + 1);

    expect(tooltip).toMatchObject({ pos: 1, end: 7, above: true });
    const dom = render(view, tooltip);
    expect(dom?.hasAttribute('data-schema-hover')).toBe(true);
    expect(dom?.children).toHaveLength(2);
    expect(dom?.children[0]?.textContent).toBe('Name');
    expect(dom?.children[1]?.textContent).toBe('Rule name shown in the list');
  });

  it('describes a primitive value through its property', async () => {
    const view = viewFor(doc);
    const tooltip = await hoverAt(view, doc.indexOf('"x"') + 1);
    expect(render(view, tooltip)?.textContent).toContain('Rule name');
  });

  it('describes nested keys and renders text, not markup', async () => {
    const view = viewFor(doc);
    const dom = render(view, await hoverAt(view, doc.indexOf('owner') + 1));
    expect(dom?.textContent).toBe('<b>Owner</b> e-mail');
    expect(dom?.querySelector('b')).toBeNull();
  });

  it('does not describe an object from inside it', async () => {
    const view = viewFor(doc);
    expect(await hoverAt(view, doc.indexOf('{"owner"'))).toBeNull();
  });

  it('returns null for properties without title/description', async () => {
    const view = viewFor(doc);
    expect(await hoverAt(view, doc.indexOf('count') + 1)).toBeNull();
  });

  it('works inside an HTTP JSON body', async () => {
    const head = 'POST /rules HTTP/1.1\nContent-Type: application/json\n\n';
    const view = viewFor(`${head}{"name": "x"}`, [http()]);
    const tooltip = await hoverAt(view, head.length + 2, findJsonBodyRange);
    expect(tooltip?.pos).toBe(head.length + 1);
    expect(await hoverAt(view, 2, findJsonBodyRange)).toBeNull();
  });
});

describe('schemaHover', () => {
  it('is an extension that can be added to a state', () => {
    expect(() =>
      EditorState.create({ extensions: [json(), schemaHover(() => schema, wholeDoc)] }),
    ).not.toThrow();
  });
});
