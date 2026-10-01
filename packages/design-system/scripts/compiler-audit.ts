/**
 * React Compiler bailout audit.
 *
 * The build compiles components with Rspack's native (SWC) React Compiler,
 * which has no logger. This script runs the reference Babel implementation
 * (babel-plugin-react-compiler, same `target`/`panicThreshold`) over the
 * published source and reports every function the compiler skipped, grouped
 * by category and file. A bailout is safe — the function is simply left
 * uncompiled — but it means no automatic memoization there.
 *
 * Usage: pnpm compiler:audit [--json <out.json>]
 */

import { transformAsync } from '@babel/core';
import { globSync } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface CompilerEventDetail {
  reason?: string;
  category?: string;
  options?: { reason?: string; category?: string };
}

interface CompilerEvent {
  kind: string;
  fnLoc?: { start?: { line?: number } } | null;
  detail?: CompilerEventDetail;
  reason?: string;
}

interface Bailout {
  file: string;
  line: number | null;
  kind: string;
  category: string;
  reason: string;
}

const firstLine = (text: string | undefined): string => (text ?? '').split('\n')[0] ?? '';

const ROOT = path.resolve(import.meta.dirname, '..');

const files = globSync('src/**/*.{ts,tsx}', {
  cwd: ROOT,
  ignore: [
    '**/*.test.*',
    '**/*.stories.*',
    '**/*.e2e.*',
    '**/story-content/**',
    'src/testUtils/**',
    '**/*.d.ts',
  ],
}).sort();

const bailouts: Bailout[] = [];
let compiled = 0;
let optedOut = 0;
// Functions in opted-out files still go through the pipeline (and log
// CompileSuccess), but their output is discarded — count them separately.
let skippedByDirective = 0;

for (const rel of files) {
  const filename = path.join(ROOT, rel);
  const code = readFileSync(filename, 'utf8');
  const fileOptedOut = /^\s*(?:\/\/.*\n\s*)*['"]use no memo['"]/.test(code);
  if (fileOptedOut) optedOut++;

  await transformAsync(code, {
    filename,
    babelrc: false,
    configFile: false,
    // Babel 7 on purpose: babel-plugin-react-compiler 1.0.0 misreads Babel 8's AST.
    presets: ['@babel/preset-typescript'],
    parserOpts: { plugins: rel.endsWith('.tsx') ? ['jsx'] : [] },
    plugins: [
      [
        'babel-plugin-react-compiler',
        {
          target: '19',
          panicThreshold: 'none',
          logger: {
            logEvent(_file: string, event: CompilerEvent) {
              if (event.kind === 'CompileSuccess') {
                if (fileOptedOut) skippedByDirective++;
                else compiled++;
                return;
              }
              if (event.kind === 'CompileSkip' || event.kind === 'CompileDiagnostic') return;
              const detail = event.detail;
              bailouts.push({
                file: rel,
                line: event.fnLoc?.start?.line ?? null,
                kind: event.kind,
                category: detail?.category ?? detail?.options?.category ?? 'Unknown',
                reason: firstLine(detail?.reason ?? detail?.options?.reason ?? event.reason),
              });
            },
          },
        },
      ],
    ],
  });
}

const countBy = (key: (b: Bailout) => string) =>
  Object.fromEntries(
    Object.entries(
      bailouts.reduce<Record<string, number>>((acc, b) => {
        acc[key(b)] = (acc[key(b)] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort(([, a], [, b]) => b - a),
  );

const report = {
  files: files.length,
  optedOutFiles: optedOut,
  optedOutFunctions: skippedByDirective,
  compiledFunctions: compiled,
  bailouts: bailouts.length,
  bailoutFiles: new Set(bailouts.map(b => b.file)).size,
  byCategory: countBy(b => `${b.category}: ${b.reason}`),
  byFile: countBy(b => b.file),
  details: bailouts,
};

const jsonFlag = process.argv.indexOf('--json');
const jsonOut = jsonFlag === -1 ? undefined : process.argv[jsonFlag + 1];
if (jsonOut) {
  writeFileSync(path.resolve(jsonOut), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(
  `React Compiler audit: ${report.files} files, ${report.compiledFunctions} functions compiled, ` +
    `${report.bailouts} bailouts in ${report.bailoutFiles} files, ${report.optedOutFiles} files (${report.optedOutFunctions} functions) opted out ('use no memo').`,
);
console.log('\nBy category:');
for (const [k, v] of Object.entries(report.byCategory))
  console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nBy file:');
for (const b of bailouts) console.log(`  ${b.file}:${b.line ?? '?'}  [${b.category}] ${b.reason}`);
