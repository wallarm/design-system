/**
 * `pnpm evals`: asks a model every eval case and prints how its answers score. It calls the
 * Anthropic Messages API with fetch, so it adds no dependency.
 *
 *   ANTHROPIC_API_KEY=… pnpm evals [--model claude-sonnet-5-5] [--format a2ui|json-render|openui]
 *                                  [--case security-dashboard]
 *
 * GEN_UI_EVAL_MODEL and GEN_UI_EVAL_FORMAT set the defaults. Not part of the build.
 */

import type { SpecStreamLine } from '@json-render/core';
import { parseArgs } from 'node:util';
import type { A2uiMessage } from '../a2ui/catalog';
import { a2uiPrompt } from '../a2ui/prompt';
import { wallarmComponents } from '../components';
import { COMPOSITION_RULES } from '../core/composition';
import { isRecord } from '../core/guards';
import { createJsonRenderCatalog } from '../json-render/catalog';
import { specFromLines } from '../json-render/spec';
import { createOpenUiLibrary } from '../openui/catalog';
import { EVAL_CASES, type EvalCase } from './cases';
import { type EvalAnswer, scoreAnswer } from './score';

const FORMATS = ['a2ui', 'json-render', 'openui'] as const;
type Format = (typeof FORMATS)[number];
const isFormat = (value: string): value is Format => FORMATS.some(f => f === value);

const print = (text: string) => process.stdout.write(`${text}\n`);

const { values } = parseArgs({
  options: {
    model: { type: 'string', default: process.env.GEN_UI_EVAL_MODEL ?? 'claude-sonnet-5-5' },
    format: { type: 'string', default: process.env.GEN_UI_EVAL_FORMAT ?? 'json-render' },
    case: { type: 'string' },
  },
});
const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  print('Skipped: set ANTHROPIC_API_KEY to run the gen-ui evals.');
  process.exit(0);
}
const format = values.format;
if (!isFormat(format)) throw new Error(`--format is one of ${FORMATS.join(', ')}`);
const cases = EVAL_CASES.filter(c => !values.case || c.id === values.case);
if (!cases.length) throw new Error(`No eval case "${values.case}"`);

/** How each format writes a binding, since the app's data never goes into the answer. */
const BINDING: Record<Format, string> = {
  a2ui: 'Bind a prop with {"@path": "/kpi/attacks"}. Answer with the JSON messages only.',
  'json-render':
    'Bind a prop with {"$state": "/kpi/attacks"}, a form field with {"$bindState": "/reason"}.',
  openui:
    'Bind a prop with a $variable: /kpi/attacks is $kpi.attacks. Answer with the program only.',
};

const systemPrompt = async (c: EvalCase) => {
  if (format === 'a2ui') {
    // @a2ui/react defines a custom element when it loads; the prompt needs none of it.
    globalThis.HTMLElement ??= class {} as typeof HTMLElement;
    const { createA2uiCatalog } = await import('../a2ui/catalog');
    return a2uiPrompt(createA2uiCatalog(wallarmComponents), { format: 'json', actions: c.actions });
  }
  if (format === 'json-render')
    return createJsonRenderCatalog(wallarmComponents, c.actions).catalog.prompt({
      customRules: [...COMPOSITION_RULES],
    });
  return createOpenUiLibrary(wallarmComponents, c.actions).library.prompt({
    additionalRules: [...COMPOSITION_RULES],
  });
};

const userPrompt = (c: EvalCase) =>
  [
    c.prompt,
    '',
    'The app fills these paths; bind to them, never write their values in:',
    ...Object.entries(c.data).map(([path, what]) => `- ${path}: ${what}`),
    BINDING[format],
  ].join('\n');

const ask = async (c: EvalCase): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: values.model,
      max_tokens: 16_000,
      system: await systemPrompt(c),
      messages: [{ role: 'user', content: userPrompt(c) }],
    }),
  });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  const content = isRecord(body) && Array.isArray(body.content) ? body.content : [];
  return content
    .map(block => (isRecord(block) && typeof block.text === 'string' ? block.text : ''))
    .join('');
};

/** The model's text as an answer: code fences dropped, JSON read line by line (or as an array). */
const toAnswer = (text: string): EvalAnswer => {
  const body = text.replace(/^```\w*$/gm, '').trim();
  if (format === 'openui') return { format, program: body };
  const parsed: unknown[] = [];
  try {
    const whole: unknown = JSON.parse(body);
    parsed.push(...(Array.isArray(whole) ? whole : [whole]));
  } catch {
    for (const line of body.split('\n'))
      try {
        parsed.push(JSON.parse(line));
      } catch {
        // Prose between the lines.
      }
  }
  // Read as the format's lines unchecked: the scorer reports what doesn't fit.
  if (format === 'a2ui') return { format, messages: parsed as A2uiMessage[] };
  return { format, spec: specFromLines(parsed as SpecStreamLine[]) };
};

print(`gen-ui evals: ${values.model}, ${format}, ${cases.length} cases\n`);
let total = 0;
for (const c of cases) {
  const result = scoreAnswer(c, toAnswer(await ask(c)));
  total += result.score;
  print(`${result.pass ? 'PASS' : 'FAIL'} ${c.id}  ${result.score.toFixed(2)}`);
  for (const e of result.expectations) print(`  ${e.pass ? '✓' : '✗'} ${e.description}`);
  for (const i of [...result.errors, ...result.warnings])
    print(
      `  ${i.severity === 'warning' ? 'warning' : 'error'} ${i.id}${i.prop ? `.${i.prop}` : ''}: ${i.message}`,
    );
}
print(`\nMean score ${(total / cases.length).toFixed(2)}`);
