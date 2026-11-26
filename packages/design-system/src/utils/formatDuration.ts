/** A duration in milliseconds, or an ISO 8601 duration ("PT2M13S", "P1DT2H"). */
export type DurationValue = number | string | null | undefined;

const UNITS = [
  ['d', 86_400],
  ['h', 3_600],
  ['m', 60],
  ['s', 1],
] as const;

const ISO_DURATION =
  /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/** Milliseconds, or undefined when the value is not a non-negative duration. */
export const toDurationMs = (value: DurationValue): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : undefined;
  if (!value) return undefined;
  const match = ISO_DURATION.exec(value);
  if (!match || value === 'P' || value.endsWith('T')) return undefined;
  const [d = 0, h = 0, m = 0, s = 0] = match.slice(1).map(v => Number(v ?? 0));
  return (((d * 24 + h) * 60 + m) * 60 + s) * 1000;
};

export interface DurationParts {
  /** The two largest units: "1h 30m", "30m 23s", "45s". */
  display: string;
  /** Every unit: "1h 30m 23s". Equals `display` unless smaller units were dropped. */
  full: string;
  /** ISO 8601 duration for `<time dateTime>`. */
  iso: string;
}

export const describeDuration = (ms: number): DurationParts => {
  let rest = Math.round(ms / 1000);
  const counts = UNITS.map(([, size]) => {
    const n = Math.floor(rest / size);
    rest -= n * size;
    return n;
  });
  const [d = 0, h = 0, m = 0, s = 0] = counts;
  const time = `${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}`;
  const iso = d || time ? `P${d ? `${d}D` : ''}${time ? `T${time}` : ''}` : 'PT0S';

  const first = counts.findIndex(n => n > 0);
  if (first === -1) {
    const zero = ms > 0 ? '<1s' : '0s';
    return { display: zero, full: zero, iso };
  }
  const join = (from: number, to: number) =>
    counts
      .slice(from, to)
      .map((n, i) => (n ? `${n}${UNITS[from + i]?.[0]}` : ''))
      .filter(Boolean)
      .join(' ');

  return { display: join(first, first + 2), full: join(first, counts.length), iso };
};

/** "1h 30m", "30m 23s", "45s"; "—" when the value is not a duration. */
export const formatDuration = (value: DurationValue): string => {
  const ms = toDurationMs(value);
  return ms == null ? '—' : describeDuration(ms).display;
};
