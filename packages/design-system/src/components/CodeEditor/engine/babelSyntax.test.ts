import { describe, expect, it } from '@rstest/core';
import { babelDiagnostics, babelSyntaxDiagnostics, loadBabelParser } from './babelSyntax';

describe('babelSyntaxDiagnostics', () => {
  it('reports nothing for valid modern JS/TS', async () => {
    const valid: readonly [string, 'javascript' | 'typescript'][] = [
      ['const f = (x): x is Rule => true;', 'typescript'],
      ['declare module "m" { export const x: number }', 'typescript'],
      ['const {b: {c = 2} = {}, ...r} = o;', 'javascript'],
      ['const {b: {c = 2} = {}, ...r} = o;', 'typescript'],
      ['function f({ a = 1 }) {}', 'javascript'],
      ['function f({ a = 1 }) {}', 'typescript'],
      ['using r = g();', 'javascript'],
      ['using r = g();', 'typescript'],
      ['return 1;', 'javascript'],
      ['const el = <div className="x">{a}</div>;', 'javascript'],
    ];
    for (const [text, language] of valid) {
      expect(await babelSyntaxDiagnostics(text, language), text).toEqual([]);
    }
  });

  it('accepts decorators and auto-accessors (Angular/NestJS-style TS, Stage-3 JS)', async () => {
    const angular = [
      "@Component({ selector: 'app-root' })",
      'export class AppComponent {',
      "  @Input() name = '';",
      '  @Output() changed = new EventEmitter<string>();',
      '  accessor count = 0;',
      '  constructor(@Inject(TOKEN) private readonly service: Service) {}',
      '}',
    ].join('\n');
    expect(await babelSyntaxDiagnostics(angular, 'typescript')).toEqual([]);
    expect(
      await babelSyntaxDiagnostics(
        '@Controller("rules")\nexport class RulesController {\n  @Get(":id") find(@Param("id") id: string) { return id; }\n}',
        'typescript',
      ),
    ).toEqual([]);
    expect(await babelSyntaxDiagnostics('@dec export class A {}', 'javascript')).toEqual([]);
    expect(await babelSyntaxDiagnostics('export @dec class B {}', 'javascript')).toEqual([]);
    expect(
      await babelSyntaxDiagnostics('class C { @dec accessor x = 1; @dec m() {} }', 'javascript'),
    ).toEqual([]);
  });

  it('reports recovered errors at error.pos without the "(line:col)" suffix', async () => {
    expect(await babelSyntaxDiagnostics('let a: = 1;', 'typescript')).toEqual([
      { from: 7, to: 8, severity: 'error', source: 'syntax', message: 'Unexpected token' },
    ]);
    expect(await babelSyntaxDiagnostics('function f({ a = }) {}', 'javascript')).toMatchObject([
      { from: 17, to: 18, severity: 'error', source: 'syntax' },
    ]);
  });

  it('reports a thrown fatal error', async () => {
    const [diagnostic, ...rest] = await babelSyntaxDiagnostics(
      'function f( {\n  return 1\n}',
      'javascript',
    );
    expect(rest).toEqual([]);
    expect(diagnostic).toEqual({
      from: 23,
      to: 24,
      severity: 'error',
      source: 'syntax',
      message: 'Unexpected token, expected ","',
    });
  });

  it('still reports shorthand initialisers outside a pattern', async () => {
    expect((await babelSyntaxDiagnostics('f({ a = 1 })', 'javascript')).length).toBeGreaterThan(0);
  });

  it('clamps to the text end, dedupes positions and shifts by base', async () => {
    const parser = await loadBabelParser();
    const atEnd = babelDiagnostics(parser, 'const a = ', 'javascript');
    expect(atEnd).toHaveLength(1);
    expect(atEnd[0]).toMatchObject({ from: 10, to: 10 });

    const shifted = babelDiagnostics(parser, 'let a: = 1;', 'typescript', 100);
    expect(shifted[0]).toMatchObject({ from: 107, to: 108 });
    expect(new Set(shifted.map(d => d.from)).size).toBe(shifted.length);
  });

  it('caches the parser module', async () => {
    expect(loadBabelParser()).toBe(loadBabelParser());
  });
});
