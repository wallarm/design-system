import { describe, expect, it } from '@rstest/core';
import { migration } from '../avatar-size-rename';
import { apply } from './harness';

const IMPORT = "import { Avatar } from '@wallarm-org/design-system';\n";
const run = (body: string) => apply(migration, IMPORT + body);

describe('avatar-size-rename', () => {
  it('renames xs to md and sm to lg', () => {
    expect(run("<Avatar size='xs' />").code).toBe(`${IMPORT}<Avatar size='md' />`);
    expect(run("<Avatar size='sm' />").code).toBe(`${IMPORT}<Avatar size='lg' />`);
  });

  it('keeps double quotes', () => {
    expect(run('<Avatar size="sm" />').code).toBe(`${IMPORT}<Avatar size="lg" />`);
  });

  it('handles expression-wrapped literal and opening elements', () => {
    expect(run("<Avatar size={'xs'}>x</Avatar>").code).toBe(
      `${IMPORT}<Avatar size={'md'}>x</Avatar>`,
    );
  });

  it('one pass, not chained', () => {
    expect(run("<><Avatar size='xs' /><Avatar size='sm' /></>").code).toBe(
      `${IMPORT}<><Avatar size='md' /><Avatar size='lg' /></>`,
    );
  });

  it('leaves md/lg and missing size unchanged without reports', () => {
    for (const body of ["<Avatar size='md' />", "<Avatar size='lg' />", '<Avatar />']) {
      const r = run(body);
      expect(r.code).toBe(IMPORT + body);
      expect(r.reports).toEqual([]);
    }
  });

  it('keeps CRLF', () => {
    const input = `${IMPORT}<div>\n<Avatar size='xs' />\n</div>`.split('\n').join('\r\n');
    const r = apply(migration, input);
    expect(r.code).toBe(input.replace("'xs'", "'md'"));
    expect(r.code).toContain('\r\n');
  });

  it('reports non-static sizes and spreads without changing code', () => {
    for (const body of [
      '<Avatar size={size} />',
      "<Avatar size={big ? 'sm' : 'xs'} />",
      '<Avatar {...props} />',
    ]) {
      const r = run(body);
      expect(r.code).toBe(IMPORT + body);
      expect(r.reports).toHaveLength(1);
      expect(r.reports[0]).toContain('Avatar size');
    }
  });

  it('rewrites spread with explicit literal size, no report', () => {
    const r = run("<Avatar {...p} size='xs' />");
    expect(r.code).toBe(`${IMPORT}<Avatar {...p} size='md' />`);
    expect(r.reports).toEqual([]);
  });

  it('local Avatar untouched', () => {
    const code = "import { Avatar } from './Avatar';\n<Avatar size='xs' />";
    const r = apply(migration, code);
    expect(r.code).toBe(code);
    expect(r.reports).toEqual([]);
  });

  it('is idempotent for literal cases', () => {
    const once = run("<Avatar size='xs' />").code;
    expect(apply(migration, once).code).toBe(once);
  });
});
