import { describe, expect, it } from '@rstest/core';
import { getCompiledSchema, loadSchemaLibrary, parseJson } from './loadSchema';

describe('loadSchemaLibrary', () => {
  it('caches the import promise', async () => {
    const first = loadSchemaLibrary();
    expect(loadSchemaLibrary()).toBe(first);
    const library = await first;
    expect(typeof library.compileSchema).toBe('function');
    expect(loadSchemaLibrary()).toBe(first);
  });
});

describe('getCompiledSchema', () => {
  it('compiles once per schema object identity', async () => {
    const schema = { type: 'string' };
    const node = await getCompiledSchema(schema);
    expect(await getCompiledSchema(schema)).toBe(node);
    expect(await getCompiledSchema({ type: 'string' })).not.toBe(node);
    expect(node.validate('ok').valid).toBe(true);
    expect(node.validate(1).valid).toBe(false);
  });

  it('supports boolean schemas', async () => {
    expect((await getCompiledSchema(true)).validate(1).valid).toBe(true);
    expect((await getCompiledSchema(false)).validate(1).valid).toBe(false);
    expect(await getCompiledSchema(false)).toBe(await getCompiledSchema(false));
  });
});

describe('parseJson', () => {
  it('never throws', () => {
    expect(parseJson('{"a": 1}')).toEqual({ ok: true, value: { a: 1 } });
    expect(parseJson('{"a": ')).toEqual({ ok: false });
  });
});
