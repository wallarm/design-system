import { describe, expect, it } from '@rstest/core';
import { migration } from '../avatar-size-rename';
import { apply } from './harness';

// Before -> after code lives in __fixtures__/avatar-size-rename; these assert reports.
const IMPORT = "import { Avatar } from '@wallarm-org/design-system';\n";
const run = (body: string) => apply(migration, IMPORT + body);

describe('avatar-size-rename', () => {
  it('static, migrated and missing sizes report nothing (also on re-run)', () => {
    for (const body of [
      "<Avatar size='xs' />",
      "<Avatar size={'sm'}>x</Avatar>",
      "<Avatar size='md' />",
      "<Avatar size='lg' />",
      '<Avatar />',
      "<Avatar {...p} size='xs' />",
    ]) {
      expect(run(body).reports).toEqual([]);
    }
  });

  it('reports each non-static size or spread once', () => {
    for (const body of [
      '<Avatar size={size} />',
      "<Avatar size={big ? 'sm' : 'xs'} />",
      '<Avatar {...props} />',
    ]) {
      const r = run(body);
      expect(r.reports).toHaveLength(1);
      expect(r.reports[0]).toContain('Avatar size');
    }
  });

  it('spread after size: reports the possible override', () => {
    const r = run("<Avatar size='xs' {...p} />");
    expect(r.reports).toHaveLength(1);
    expect(r.reports[0]).toContain('may override');
  });

  it('keeps CRLF', () => {
    const input = `${IMPORT}<div>\n<Avatar size='xs' />\n</div>`.split('\n').join('\r\n');
    const r = apply(migration, input);
    expect(r.code).toBe(input.replace("'xs'", "'md'"));
    expect(r.code).toContain('\r\n');
  });

  it('local Avatar untouched', () => {
    const code = "import { Avatar } from './Avatar';\n<Avatar size='xs' />";
    const r = apply(migration, code);
    expect(r.code).toBe(code);
    expect(r.reports).toEqual([]);
  });
});
