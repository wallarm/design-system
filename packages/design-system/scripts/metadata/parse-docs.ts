import fs from 'fs';
import path from 'path';

import type { ComponentDoc } from '@wallarm-org/mcp-core';

/** Usage docs for a component folder: `docs/*.md` (e.g. SimpleCharts) and `*_DESIGN.md` (e.g. Table). */
export const parseComponentDocs = (componentDir: string): ComponentDoc[] => {
  const read = (dir: string, match: (file: string) => boolean): ComponentDoc[] =>
    fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter(match)
          .sort()
          .map(file => ({
            name: file.replace(/\.md$/, ''),
            markdown: fs.readFileSync(path.join(dir, file), 'utf-8').trim(),
          }))
      : [];

  return [
    ...read(componentDir, file => file.endsWith('_DESIGN.md')),
    ...read(path.join(componentDir, 'docs'), file => file.endsWith('.md')),
  ];
};
