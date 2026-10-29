import { describe, expect, it } from '@rstest/core';

import { migration } from '../numeric-badge-type-color';
import { apply } from './harness';

// Before -> after code lives in __fixtures__/numeric-badge-type-color; these assert reports.
const IMPORT = "import { NumericBadge } from '@wallarm-org/design-system';\n";
const run = (body: string) => apply(migration, IMPORT + body);

describe('numeric-badge-type-color', () => {
  it('mapped, migrated (also on re-run) and missing types report nothing', () => {
    for (const from of ['primary', 'primary-alt', 'brand', 'destructive', 'outline', 'info']) {
      const once = run(`<NumericBadge type='${from}'>3</NumericBadge>`);
      expect(once.reports).toEqual([]);
      expect(apply(migration, once.code).reports).toEqual([]);
    }
    for (const body of [
      '<NumericBadge>3</NumericBadge>',
      "<NumericBadge type='outline' color='brand' />",
      "<NumericBadge type='solid' color='danger' />",
      "<NumericBadge type='secondary' color='info' />",
      '<NumericBadge {...p} type="primary" />',
    ]) {
      expect(run(body).reports).toEqual([]);
    }
  });

  it('reports each unresolvable case once', () => {
    for (const body of [
      '<NumericBadge type={t} />',
      "<NumericBadge type='brand' color='red' />",
      '<NumericBadge {...p} />',
    ]) {
      expect(run(body).reports).toHaveLength(1);
    }
  });

  it('spread after type: reports the possible override', () => {
    const r = run('<NumericBadge type="primary" {...p} />');
    expect(r.reports).toHaveLength(1);
    expect(r.reports[0]).toContain('may override');
  });

  it('local NumericBadge untouched', () => {
    const code = "import { NumericBadge } from './x';\n<NumericBadge type='brand' />";
    const r = apply(migration, code);
    expect(r.code).toBe(code);
    expect(r.reports).toEqual([]);
  });
});
