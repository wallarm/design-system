import type { LineChartDatum, LineChartSeries } from '../LineChartContext';

// Deterministic pseudo-random in [0, 1) so the same `(i, seed, salt)` produces
// the same value across runs — keeps screenshot tests stable while letting us
// add point-to-point jitter that monotone smooths out and linear preserves.
const jitter = (i: number, seed: number, salt: number): number => {
  const v = Math.sin((i + seed) * salt) * 43758.5453;
  return v - Math.floor(v);
};

export const genHourly = (count: number, seed = 1): LineChartDatum[] => {
  // Local-time anchor so the first sample reads `00:00` in the viewer's
  // timezone instead of drifting by the UTC offset.
  const start = new Date(2025, 0, 1, 0, 0, 0).getTime();
  const out: LineChartDatum[] = [];
  for (let i = 0; i < count; i++) {
    const t = start + i * 60 * 60 * 1000;
    const requests = Math.round(
      120 + Math.sin((i + seed) / 4) * 30 + (jitter(i, seed, 12.9898) - 0.5) * 80,
    );
    const errors = Math.round(
      24 + Math.cos((i + seed) / 5) * 10 + (jitter(i, seed, 78.233) - 0.5) * 32,
    );
    const latency = Math.round(
      80 + Math.sin((i + seed) / 6) * 14 + (jitter(i, seed, 39.346) - 0.5) * 40,
    );
    out.push({ timestamp: t, requests, errors, latency });
  }
  return out;
};

export const genDaily = (count: number): LineChartDatum[] => {
  const start = new Date(2024, 0, 1, 0, 0, 0).getTime();
  const out: LineChartDatum[] = [];
  for (let i = 0; i < count; i++) {
    const t = start + i * 24 * 60 * 60 * 1000;
    const requests = Math.round(1000 + Math.sin(i / 9) * 400 + (i % 13) * 12);
    const errors = Math.round(80 + Math.cos(i / 11) * 30 + (i % 7) * 3);
    out.push({ timestamp: t, requests, errors });
  }
  return out;
};

export const singleSeries: LineChartSeries[] = [
  { key: 'requests', label: 'Requests', color: 'brand' },
];

export const multiSeries: LineChartSeries[] = [
  { key: 'requests', label: 'Requests', color: 'brand' },
  { key: 'errors', label: 'Errors', color: 'red' },
  { key: 'latency', label: 'Latency', color: 'blue' },
];

export const dashedSeries: LineChartSeries[] = [
  { key: 'requests', label: 'Requests', color: 'brand' },
  { key: 'errors', label: 'Errors (target)', color: 'red', variant: 'dashed' },
];

export const customColorSeries: LineChartSeries[] = [
  { key: 'requests', label: 'Requests', color: 'var(--color-violet-500)' },
  { key: 'errors', label: 'Errors', color: 'var(--color-emerald-500)' },
];

export const hourlyData24 = genHourly(24);
export const hourlyDataA = genHourly(24, 1);
export const hourlyDataB = genHourly(24, 7);
export const dailyData60 = genDaily(60);
export const hourlyData1000 = genHourly(1000);

export const singlePointData: LineChartDatum[] = [
  { timestamp: new Date(2025, 0, 1, 12, 0, 0).getTime(), requests: 142 },
];

export const dataWithErrorGaps: LineChartDatum[] = hourlyData24.map((d, i) => {
  if ((i >= 6 && i <= 8) || (i >= 15 && i <= 16)) {
    return { ...d, errors: null };
  }
  return d;
});

export const unitsByKey: Record<string, string> = {
  requests: ' req',
  errors: ' err',
  latency: ' ms',
};

// Attack spike: 5-minute buckets from 10:20 to 12:20 against the usual level for the same time.
const SPIKE_BUCKET_START = new Date(2025, 0, 1, 10, 20, 0).getTime();
export const SPIKE_BUCKET_MS = 5 * 60 * 1000;
const spikeAt = (hours: number, minutes: number) => new Date(2025, 0, 1, hours, minutes).getTime();
const SPIKE_ATTACKS = [
  112, 96, 131, 104, 88, 120, 109, 94, 127, 101, 115, 98, 640, 1820, 3250, 2930, 2275, 1410, 720,
  180, 118, 92, 124, 105, 99,
];
const SPIKE_USUAL = [
  102, 98, 105, 101, 97, 103, 100, 104, 99, 102, 106, 101, 103, 100, 98, 104, 102, 99, 101, 105,
  100, 97, 103, 101, 99,
];

export const spikeData: LineChartDatum[] = SPIKE_ATTACKS.map((attacks, i) => ({
  timestamp: SPIKE_BUCKET_START + i * SPIKE_BUCKET_MS,
  attacks,
  usual: SPIKE_USUAL[i] ?? null,
}));

export const spikeSeries: LineChartSeries[] = [
  { key: 'attacks', label: 'Attacks', color: 'slate' },
  { key: 'usual', label: 'Usual', color: 'var(--color-border-strong-primary)', variant: 'dashed' },
];

export const SPIKE_START = spikeAt(11, 20);
export const SPIKE_END = spikeAt(11, 52);
export const EARLY_START = spikeAt(10, 0);
export const EARLY_END = spikeAt(10, 40);
