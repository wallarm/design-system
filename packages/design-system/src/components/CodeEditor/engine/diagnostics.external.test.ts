import type { Diagnostic } from '@codemirror/lint';
import { Text } from '@codemirror/state';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  activeDiagnostics,
  destroyLintedViews,
  flushLint,
  mountLinted,
} from '../../../testUtils/codeEditorDiagnostics';
import type { CodeEditorDiagnostic } from '../types';
import { type SchemaDiagnosticsSource, toCmDiagnostic, toPublicDiagnostic } from './diagnostics';

const DOC = 'first line\nsecond line';
const doc = Text.of(DOC.split('\n'));

afterEach(() => {
  destroyLintedViews();
  vi.restoreAllMocks();
});

describe('toCmDiagnostic', () => {
  it('maps absolute lines (startingLineNumber 10) and 1-based columns to offsets', () => {
    expect(
      toCmDiagnostic(
        doc,
        {
          from: { line: 11, column: 1 },
          to: { line: 11, column: 7 },
          severity: 'warning',
          message: 'w',
          source: 'api',
        },
        10,
      ),
    ).toEqual({ from: 11, to: 17, severity: 'warning', message: 'w', source: 'api' });
  });

  it('covers one character without `to`, or a point at the end of the line', () => {
    expect(
      toCmDiagnostic(doc, { from: { line: 10, column: 3 }, severity: 'info', message: 'i' }, 10),
    ).toEqual({ from: 2, to: 3, severity: 'info', message: 'i' });
    expect(
      toCmDiagnostic(doc, { from: { line: 10, column: 99 }, severity: 'info', message: 'i' }, 10),
    ).toEqual({ from: 10, to: 10, severity: 'info', message: 'i' });
  });

  it('drops a diagnostic whose start line is outside the document', () => {
    for (const line of [9, 12]) {
      expect(
        toCmDiagnostic(doc, { from: { line, column: 1 }, severity: 'error', message: 'x' }, 10),
      ).toBeNull();
    }
  });

  it('clamps an out-of-range `to` to the document end and never ends before `from`', () => {
    expect(
      toCmDiagnostic(
        doc,
        {
          from: { line: 10, column: 2 },
          to: { line: 50, column: 1 },
          severity: 'error',
          message: 'x',
        },
        10,
      ),
    ).toMatchObject({ from: 1, to: DOC.length });
    expect(
      toCmDiagnostic(
        doc,
        {
          from: { line: 11, column: 5 },
          to: { line: 10, column: 1 },
          severity: 'error',
          message: 'x',
        },
        10,
      ),
    ).toMatchObject({ from: 15, to: 15 });
  });
});

describe('toPublicDiagnostic', () => {
  it('maps offsets back to absolute positions and keeps severity and source', () => {
    const diagnostic: Diagnostic = {
      from: 11,
      to: 17,
      severity: 'error',
      message: 'e',
      source: 'syntax',
    };
    expect(toPublicDiagnostic(doc, diagnostic, 10)).toEqual({
      from: { line: 11, column: 1 },
      to: { line: 11, column: 7 },
      severity: 'error',
      message: 'e',
      source: 'syntax',
    });
  });

  it("reads CodeMirror's `hint` severity as `info` and omits a missing source", () => {
    expect(toPublicDiagnostic(doc, { from: 0, to: 1, severity: 'hint', message: 'h' }, 1)).toEqual({
      from: { line: 1, column: 1 },
      to: { line: 1, column: 2 },
      severity: 'info',
      message: 'h',
    });
  });
});

describe('diagnosticsExtension — external diagnostics', () => {
  const external: CodeEditorDiagnostic[] = [
    { from: { line: 10, column: 1 }, to: { line: 10, column: 6 }, severity: 'error', message: 'e' },
    { from: { line: 11, column: 1 }, severity: 'warning', message: 'w', source: 'api' },
    { from: { line: 11, column: 8 }, severity: 'info', message: 'i' },
    { from: { line: 99, column: 1 }, severity: 'error', message: 'dropped' },
  ];

  it('converts in-range diagnostics with their severity and drops out-of-range ones', async () => {
    const { view } = mountLinted(DOC, { language: 'text', external, startingLineNumber: 10 });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      { from: 0, to: 5, severity: 'error', message: 'e', source: undefined },
      { from: 11, to: 12, severity: 'warning', message: 'w', source: 'api' },
      { from: 18, to: 19, severity: 'info', message: 'i', source: undefined },
    ]);
  });

  it('merges JSON syntax errors with external diagnostics', async () => {
    const { view, onChange } = mountLinted('{"a" 1}', {
      language: 'json',
      external: [{ from: { line: 1, column: 1 }, severity: 'info', message: 'ext' }],
    });
    await flushLint(view);

    expect(onChange).toHaveBeenLastCalledWith([
      {
        from: { line: 1, column: 6 },
        to: { line: 1, column: 7 },
        severity: 'error',
        message: "Expected ':' after property name",
        source: 'syntax',
      },
      {
        from: { line: 1, column: 1 },
        to: { line: 1, column: 2 },
        severity: 'info',
        message: 'ext',
      },
    ]);
  });
});

describe('diagnosticsExtension — onChange', () => {
  it('is not called while the list stays empty', async () => {
    const { view, onChange } = mountLinted('{"a": 1}', { language: 'json' });
    await flushLint(view);
    view.dispatch({ changes: { from: 7, insert: ' ' } });
    await flushLint(view);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('is called once per distinct list, in public form', async () => {
    const { view, onChange } = mountLinted('{"a": 1,}', {
      language: 'json',
      startingLineNumber: 5,
    });
    await flushLint(view);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([
      {
        from: { line: 5, column: 9 },
        to: { line: 5, column: 10 },
        severity: 'error',
        message: 'Expected double-quoted property name',
        source: 'syntax',
      },
    ]);

    // Same error after an edit that does not move it → no new call.
    view.dispatch({ changes: { from: 9, insert: '\n' } });
    await flushLint(view);
    expect(onChange).toHaveBeenCalledTimes(1);

    // Fixed → one call with the empty list.
    view.dispatch({ changes: { from: 7, to: 8 } });
    await flushLint(view);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('diagnosticsExtension — schema hook', () => {
  const schemaDiagnostic: Diagnostic = {
    from: 6,
    to: 7,
    severity: 'warning',
    message: 'Expected string',
  };

  it('runs schemaSource only when schema is set and the JSON parses, defaulting source to "schema"', async () => {
    const schemaSource = vi.fn<SchemaDiagnosticsSource>(async () => [schemaDiagnostic]);

    const withoutSchema = mountLinted('{"a": 1}', { language: 'json', schemaSource });
    await flushLint(withoutSchema.view);
    expect(schemaSource).not.toHaveBeenCalled();

    const invalid = mountLinted('{"a": 1,}', { language: 'json', schema: {}, schemaSource });
    await flushLint(invalid.view);
    expect(schemaSource).not.toHaveBeenCalled();

    const valid = mountLinted('{"a": 1}', { language: 'json', schema: {}, schemaSource });
    await flushLint(valid.view);
    expect(schemaSource).toHaveBeenCalledTimes(1);
    const [state, region] = schemaSource.mock.calls[0] ?? [];
    expect(state?.doc.toString()).toBe('{"a": 1}');
    expect(region).toEqual({ from: 0, to: 8 });
    expect(activeDiagnostics(valid.view.state)).toEqual([
      { from: 6, to: 7, severity: 'warning', message: 'Expected string', source: 'schema' },
    ]);
  });

  it('keeps external diagnostics when schemaSource rejects', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { view } = mountLinted('{"a": 1}', {
      language: 'json',
      schema: {},
      schemaSource: async () => {
        throw new Error('boom');
      },
      external: [{ from: { line: 1, column: 1 }, severity: 'info', message: 'ext' }],
    });
    await flushLint(view);

    expect(activeDiagnostics(view.state)).toEqual([
      { from: 0, to: 1, severity: 'info', message: 'ext', source: undefined },
    ]);
    expect(consoleError).toHaveBeenCalledWith(
      '[CodeEditor] JSON Schema validation failed',
      expect.any(Error),
    );
  });
});
