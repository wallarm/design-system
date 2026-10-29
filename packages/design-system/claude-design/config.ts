import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CLAUDE_DESIGN = {
  artifactUrl: 'https://claude.ai/artifact/XyodGNRtEkFNAUfyoMD5HN',
  title: 'Wallarm Design System',
  namespace: 'WallarmDS',
  outDir: resolve(PACKAGE_DIR, '.claude-design/project'),
  bundleBudgetBytes: 5_700_000,
  cssCapBytes: 2_000_000,
  excludedModules: ['CodeSnippet/adapters/shiki', 'CodeSnippet/adapters/highlightjs'],
} as const;
