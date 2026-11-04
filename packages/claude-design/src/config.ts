import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** This package: `.claude-design/` (output and runtime scratch) and the exporter sources. */
export const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/** The design-system package the export is built from: `src/`, `dist/`, `scripts/`, `package.json`. */
export const DESIGN_SYSTEM_DIR = resolve(PACKAGE_DIR, '../design-system');
export const CLAUDE_DESIGN = {
  // apps/website/docs/ai/claude-design.mdx:8 repeats this URL; change both.
  artifactUrl: 'https://claude.ai/artifact/FXWSxmN7zfnpsyMemE5VD7',
  title: 'Wallarm Design System',
  namespace: 'WallarmDS',
  outDir: resolve(PACKAGE_DIR, '.claude-design/project'),
  bundleBudgetBytes: 5_700_000,
  cssCapBytes: 2_000_000,
  /** No guide, no preview: internal primitives and the providers `Root` stands in for. */
  internal: new Set([
    'ThemeProvider',
    'DateFormatProvider',
    'ButtonBase',
    'Polymorphic',
    'TemporalCore',
    'Checkmark',
  ]) as ReadonlySet<string>,
  /** One metadata entry, one guide per Storybook story file. */
  splitByStoryFile: new Set(['SimpleCharts']) as ReadonlySet<string>,
} as const;
