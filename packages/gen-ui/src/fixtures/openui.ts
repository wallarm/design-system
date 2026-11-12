/**
 * A recorded A2UI answer as the OpenUI Lang a model would write: a statement per component, the
 * arguments in the entry's prop order, bindings as `$variables`. The app's data stays out of the
 * program: its lines are data writes the surface gets as `data`. Data the agent sends itself
 * becomes a `$variable` declaration.
 */
import type { A2uiMessage } from '../a2ui/catalog';
import { wallarmComponents } from '../components';
import { isRecord } from '../core/guards';
import type { DataValue, StreamLine } from './stream';

/** One line of an OpenUI answer: a statement from the agent, or a data write from the app. */
export type OpenUiLine = string | DataValue;

export const toOpenUiLines = (
  lines: readonly StreamLine<A2uiMessage>[],
): StreamLine<OpenUiLine>[] =>
  lines.flatMap(({ origin, line }): StreamLine<OpenUiLine>[] => {
    if ('updateDataModel' in line) {
      const { path = '/', value } = line.updateDataModel;
      return origin === 'app'
        ? [{ origin, line: { path, value } }]
        : [{ origin, line: `${variable(path)} = ${literal(value)}` }];
    }
    const components =
      'createSurface' in line
        ? line.createSurface.components
        : 'updateComponents' in line
          ? line.updateComponents.components
          : undefined;
    return (components ?? []).map(c => ({ origin, line: statement(c) }));
  });

/** The program and the app's data so far, as `OpenUiSurface` takes them. */
export const openUiAnswer = (lines: readonly StreamLine<OpenUiLine>[]) => {
  const program: string[] = [];
  let data: Record<string, unknown> = {};
  for (const { line } of lines) {
    if (typeof line === 'string') program.push(line);
    else data = setAt(data, line.path.split('/').filter(Boolean), line.value);
  }
  return { program: program.join('\n'), data };
};

const statement = ({
  id,
  component,
  children,
  ...props
}: {
  id: string;
  component: string;
  [key: string]: unknown;
}) => {
  const entry = wallarmComponents.find(c => c.name === component);
  if (!entry) throw new Error(`no catalog entry "${component}"`);
  const keys = [
    ...Object.keys(entry.props.shape),
    ...(entry.events ?? []),
    ...(entry.hasChildren ? ['children'] : []),
  ];
  const args = keys.map(key =>
    key === 'children'
      ? Array.isArray(children) && `[${children.join(', ')}]`
      : (entry.events ?? []).includes(key)
        ? step(props[key])
        : props[key] !== undefined && literal(props[key]),
  );
  while (args.length && !args[args.length - 1]) args.pop();
  return `${id} = ${component}(${args.map(arg => arg || 'null').join(', ')})`;
};

/** An A2UI action, `{ event: { name, context } }`, as a library action step. */
const step = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.event)) return false;
  const { name, context } = value.event;
  return `@${String(name)}(${isRecord(context) && Object.keys(context).length ? literal(context) : ''})`;
};

const literal = (value: unknown): string => {
  if (isRecord(value) && typeof value['@path'] === 'string') return variable(value['@path']);
  if (Array.isArray(value)) return `[${value.map(literal).join(', ')}]`;
  if (isRecord(value))
    return `{${Object.entries(value)
      .map(([k, v]) => `${/^[A-Za-z_]\w*$/.test(k) ? k : JSON.stringify(k)}: ${literal(v)}`)
      .join(', ')}}`;
  return JSON.stringify(value);
};

/** `/kpi/attacks` → `$kpi.attacks`, `/rows/0` → `$rows[0]`. */
const variable = (path: string) => {
  const [first, ...rest] = path.split('/').filter(Boolean);
  return `$${first}${rest.map(s => (/^\d+$/.test(s) ? `[${s}]` : `.${s}`)).join('')}`;
};

const setAt = (
  target: Record<string, unknown>,
  [key, ...rest]: string[],
  value: unknown,
): Record<string, unknown> => {
  if (key === undefined) return isRecord(value) ? value : target;
  const current = target[key];
  return {
    ...target,
    [key]: rest.length ? setAt(isRecord(current) ? current : {}, rest, value) : value,
  };
};
