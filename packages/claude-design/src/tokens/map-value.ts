export type Theme = 'light' | 'dark';
export interface MappedColor {
  value?: string;
  skipped?: string;
}

const ALIAS = /^var\(\s*(--[A-Za-z0-9_.-]+)\s*\)$/;
const HEX = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;

/** Convert only the color grammar that the Design System token editor preserves. */
export function mapColorValue(
  raw: string,
  theme: Theme,
  resolve: (name: string) => string | undefined,
): MappedColor {
  const value = raw.trim().replace(/\s+/g, ' ');
  if (HEX.test(value)) return { value: value.toLowerCase() };
  const alias = ALIAS.exec(value);
  if (alias?.[1]) return { value: `{${alias[1].slice(2)}}` };

  const alpha = /^--alpha\(\s*var\(\s*(--[\w.-]+)\s*\)\s*\/\s*([\d.]+)%\s*\)$/.exec(value);
  if (alpha?.[1]) {
    const percent = Number(alpha[2]);
    let source = resolve(alpha[1]);
    const seen = new Set([alpha[1]]);
    while (source && ALIAS.test(source.trim())) {
      const next = ALIAS.exec(source.trim())?.[1];
      if (!next || seen.has(next) || seen.size >= 16)
        return { skipped: `cyclic or deep alpha alias in ${theme}` };
      seen.add(next);
      source = resolve(next);
    }
    if (
      !source ||
      !HEX.test(source.trim()) ||
      !Number.isFinite(percent) ||
      percent < 0 ||
      percent > 100
    ) {
      return { skipped: `alpha requires a resolved hex color and 0–100% opacity in ${theme}` };
    }
    let digits = source.trim().slice(1);
    if (digits.length <= 4) digits = [...digits].map(digit => digit + digit).join('');
    const channels = [0, 2, 4].map(index => Number.parseInt(digits.slice(index, index + 2), 16));
    const opacity = Number(
      (
        (percent / 100) *
        (digits.length === 8 ? Number.parseInt(digits.slice(6), 16) / 255 : 1)
      ).toFixed(6),
    );
    return { value: `rgba(${channels.join(', ')}, ${opacity})` };
  }

  const numeric = '(?:[\\d.+eE%/ ,\\-]|deg|grad|rad|turn)+';
  if (
    new RegExp(`^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\\(${numeric}\\)$`, 'i').test(value) ||
    new RegExp(
      `^color\\((?:srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65) ${numeric}\\)$`,
      'i',
    ).test(value)
  ) {
    return { value };
  }
  return {
    skipped: value.startsWith('color-mix(')
      ? `context-dependent color-mix retained in bundle.css (${theme})`
      : `unsupported color value "${value}" (${theme})`,
  };
}
