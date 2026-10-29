import { type ComponentType, createElement, type SVGProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PACKAGE_DIR } from '../config';

export async function buildAssets({ outDir }: { outDir: string }) {
  const fontDir = resolve(PACKAGE_DIR, 'src/theme/fonts');
  await mkdir(join(outDir, 'fonts'), { recursive: true });
  for (const file of (await readdir(fontDir)).filter(file => file.endsWith('.woff2')).sort())
    await copyFile(join(fontDir, file), join(outDir, 'fonts', file));
  const icons = (await import(
    pathToFileURL(resolve(PACKAGE_DIR, 'dist/icons/index.js')).href
  )) as Record<string, ComponentType<SVGProps<SVGSVGElement>>>;
  const iconDir = join(outDir, 'assets/Icons');
  await mkdir(iconDir, { recursive: true });
  for (const [name, Icon] of Object.entries(icons).sort(([a], [b]) => a.localeCompare(b))) {
    const filename = name
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .toLowerCase();
    const svg = renderToStaticMarkup(
      createElement(Icon, { xmlns: 'http://www.w3.org/2000/svg', width: 24, height: 24 }),
    ).replaceAll('currentColor', '#0f172b');
    await writeFile(join(iconDir, `${filename}.svg`), `${svg}\n`);
  }
  await writeFile(
    join(iconDir, 'README.md'),
    '# Icons\n\nGenerated from src/icons. Single-ink SVG assets use #0f172b. For theme-aware components use WallarmDS.Icons.<Name> instead.\n',
  );
  const { Logo } = (await import(
    pathToFileURL(resolve(PACKAGE_DIR, 'dist/components/Logo/Logo.js')).href
  )) as { Logo: ComponentType<SVGProps<SVGSVGElement>> };
  const logoDir = join(outDir, 'assets/Logos');
  await mkdir(logoDir, { recursive: true });
  let logo = renderToStaticMarkup(createElement(Logo, { width: 118, height: 20 }));
  logo = logo
    .replace(/<g\b[\s\S]*?<\/g>/, group => group.replaceAll('currentColor', '#ff4d15'))
    .replaceAll('currentColor', '#0f172b')
    .replace(/ class="[^"]*"/g, '');
  await writeFile(join(logoDir, 'wallarm.svg'), `${logo}\n`);
  await writeFile(
    join(logoDir, 'README.md'),
    '# Logos\n\nWallarm product mark. Orange symbol and #0f172b wordmark; keep proportions and clear space.\n',
  );
  await mkdir(join(outDir, 'components/Cover'), { recursive: true });
  await writeFile(
    join(outDir, 'components/Cover/preview.html'),
    await readFile(resolve(PACKAGE_DIR, 'claude-design/assets/cover.html'), 'utf8'),
  );
  return { icons: Object.keys(icons).length };
}
