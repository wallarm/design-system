// `console.warn.bind` so the DevTools stack frame points at the caller, not
// at a wrapper function. Each helper carries its own component-name prefix.
type WarnFn = (...args: unknown[]) => void;

const PROD: WarnFn = () => {};

// biome-ignore lint/suspicious/noConsole: dev-only warning surface
const DEV = console.warn;

const make = (component: string): WarnFn =>
  process.env.NODE_ENV === 'production' ? PROD : DEV.bind(console, `[${component}]`);

export const warnLineChart = make('LineChart');
export const warnLineChartLine = make('LineChartLine');
