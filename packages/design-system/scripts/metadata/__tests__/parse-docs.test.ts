import path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, it } from '@rstest/core';

import { parseComponentDocs } from '../parse-docs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS = path.resolve(__dirname, '../../../src/components');

describe('parseComponentDocs', () => {
  it('reads *_DESIGN.md at the component root', () => {
    const docs = parseComponentDocs(path.join(COMPONENTS, 'Table'));
    expect(docs.map(d => d.name)).toEqual(['TABLE_DESIGN']);
    expect(docs[0]?.markdown.startsWith('# Table')).toBe(true);
  });

  it('reads docs/*.md', () => {
    const names = parseComponentDocs(path.join(COMPONENTS, 'SimpleCharts')).map(d => d.name);
    expect(names).toContain('LineChart');
    expect(names).toContain('PieChart');
  });

  it('returns nothing for a component without docs', () => {
    expect(parseComponentDocs(path.join(COMPONENTS, 'Button'))).toEqual([]);
  });
});
