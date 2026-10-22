import { describe, expect, it } from '@rstest/core';
import { migration } from '../numeric-badge-type-color';
import { apply } from './harness';

const IMPORT = "import { NumericBadge } from '@wallarm-org/design-system';\n";
const run = (body: string) => apply(migration, IMPORT + body);

describe('numeric-badge-type-color', () => {
  const rows: [string, string, string][] = [
    ['primary', 'secondary', 'neutral'],
    ['primary-alt', 'secondary', 'neutral-alt'],
    ['brand', 'solid', 'brand'],
    ['destructive', 'solid', 'danger'],
    ['outline', 'outline', 'neutral'],
    ['info', 'secondary', 'info'],
  ];
  for (const [from, type, color] of rows) {
    it(`${from} -> type='${type}' color='${color}'`, () => {
      const r = run(`<NumericBadge type='${from}'>3</NumericBadge>`);
      expect(r.code).toBe(
        `${IMPORT}<NumericBadge type='${type}' color='${color}'>3</NumericBadge>`,
      );
      expect(r.reports).toEqual([]);
    });
  }

  it('color inserted right after type, same quote char', () => {
    expect(run('<NumericBadge type="brand" size="small">3</NumericBadge>').code).toBe(
      `${IMPORT}<NumericBadge type="solid" color="brand" size="small">3</NumericBadge>`,
    );
  });

  it('handles braced literal and several elements', () => {
    expect(run("<><NumericBadge type={'brand'} /><NumericBadge type='info' /></>").code).toBe(
      `${IMPORT}<><NumericBadge type={'solid'} color='brand' /><NumericBadge type='secondary' color='info' /></>`,
    );
  });

  it('template-literal type gets a quoted color', () => {
    expect(run('<NumericBadge type={`brand`} />').code).toBe(
      `${IMPORT}<NumericBadge type={\`solid\`} color='brand' />`,
    );
  });

  it('no type: unchanged, no report', () => {
    const r = run('<NumericBadge>3</NumericBadge>');
    expect(r.code).toBe(`${IMPORT}<NumericBadge>3</NumericBadge>`);
    expect(r.reports).toEqual([]);
  });

  it('reports without changing code', () => {
    for (const body of [
      '<NumericBadge type={t} />',
      "<NumericBadge type='brand' color='red' />",
      '<NumericBadge {...p} />',
    ]) {
      const r = run(body);
      expect(r.code).toBe(IMPORT + body);
      expect(r.reports).toHaveLength(1);
    }
  });

  it('already migrated (new type value + color): no edit, no report', () => {
    for (const body of [
      "<NumericBadge type='outline' color='brand' />",
      "<NumericBadge type='solid' color='danger' />",
      "<NumericBadge type='secondary' color='info' />",
    ]) {
      const r = run(body);
      expect(r.code).toBe(IMPORT + body);
      expect(r.reports).toEqual([]);
    }
  });

  it('is idempotent', () => {
    for (const from of ['brand', 'outline', 'primary']) {
      const once = run(`<NumericBadge type='${from}' />`).code;
      const r = apply(migration, once);
      expect(r.code).toBe(once);
      expect(r.reports).toEqual([]);
    }
  });

  it('local NumericBadge untouched', () => {
    const code = "import { NumericBadge } from './x';\n<NumericBadge type='brand' />";
    const r = apply(migration, code);
    expect(r.code).toBe(code);
    expect(r.reports).toEqual([]);
  });
});
