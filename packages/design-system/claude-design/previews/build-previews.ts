import { Project, type SourceFile } from 'ts-morph';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, join, resolve } from 'node:path';
import { buildCanvasScripts, readInlineScript } from '../bundle/rslib-build';
import { PACKAGE_DIR } from '../config';

const require = createRequire(import.meta.url);
const { findStoryFiles, readStoryTitle } = require('../../scripts/metadata/story-source.ts') as {
  findStoryFiles: (project: Project, dir: string) => string[];
  readStoryTitle: (file: SourceFile) => string | undefined;
};
const NO_CARD = new Set([
  'ThemeProvider',
  'DateFormatProvider',
  'ButtonBase',
  'Polymorphic',
  'TemporalCore',
  'Checkmark',
  'BulkBar',
  'NavPanel',
  'SimpleCharts',
]);
const htmlEscape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export async function buildPreviews({ outDir }: { outDir: string }) {
  const meta = JSON.parse(
    await readFile(resolve(PACKAGE_DIR, '.claude-design/meta.json'), 'utf8'),
  ) as { exports: string[] };
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });
  const withPreview: string[] = [];
  const withoutStories: string[] = [];
  const componentsDir = resolve(PACKAGE_DIR, 'src/components');
  const names = (await readdir(componentsDir, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
  const entries: Record<string, string> = {};
  const previews: { name: string; group: string }[] = [];
  const entryDir = resolve(PACKAGE_DIR, '.claude-design/runtime/previews');
  await mkdir(entryDir, { recursive: true });
  for (const name of names) {
    if (NO_CARD.has(name)) continue;
    const files = findStoryFiles(project, join(componentsDir, name)).sort(
      (a, b) =>
        Number(basename(b) === `${name}.stories.tsx`) -
        Number(basename(a) === `${name}.stories.tsx`),
    );
    const selected: { file: string; story: string; group: string }[] = [];
    for (const file of files) {
      const source = project.addSourceFileAtPath(file);
      const group = readStoryTitle(source)?.split('/')[0] ?? 'Components';
      const stories = source
        .getVariableStatements()
        .filter(v => v.hasExportKeyword())
        .flatMap(v => v.getDeclarations().map(d => d.getName()));
      for (const story of stories.slice(0, 4 - selected.length))
        selected.push({ file, story, group });
      if (selected.length === 4) break;
    }
    if (!selected.length) {
      withoutStories.push(name);
      continue;
    }
    const imports = selected
      .map(
        ({ file, story }, i) =>
          `import meta${i}, {${story} as Story${i}} from ${JSON.stringify(file)};`,
      )
      .join('\n');
    const source = `${imports}
      import React from 'react';
      const rows=[${selected.map(({ story }, i) => `{name:${JSON.stringify(story)},story:Story${i},meta:meta${i}}`).join(',')}];
      function Example({entry}) {
        const {story,meta}=entry; const args={...meta.args,...story.args};
        let Render=(typeof story==='function'||story.$$typeof)?story:story.render||meta.render||meta.component;
        let child=()=>React.createElement(Render,args);
        const context={args,globals:{theme:'light'},parameters:{...meta.parameters,...story.parameters},viewMode:'story'};
        for(const decorate of [...(meta.decorators||[]),...(story.decorators||[])].reverse()) { const previous=child; child=()=>decorate(previous,context); }
        return React.createElement('section',{'data-preview-story':entry.name,className:'p-16'},React.createElement('h2',{className:'text-sm mb-12'},entry.name),React.createElement(child));
      }
      window.WallarmPreview={mount(node){const root=window.ReactDOM.createRoot(node);root.render(React.createElement(window.WallarmDS.Root,null,rows.map(entry=>React.createElement(Example,{key:entry.name,entry}))));return root;}};
    `;
    const entry = join(entryDir, `${name}.tsx`);
    await writeFile(entry, source);
    entries[`${name}/stories`] = entry;
    previews.push({ name, group: selected[0]!.group });
  }
  await buildCanvasScripts({
    entries,
    outDir: join(outDir, 'components'),
    globalExports: meta.exports,
  });
  for (const { name, group } of previews) {
    const code = await readInlineScript(join(outDir, 'components', name, 'stories.js'));
    if (Buffer.byteLength(code) > 512_000)
      throw new Error(
        `${name} preview exceeds 512 KB (${Buffer.byteLength(code)}); check duplicate component imports`,
      );
    if (/<\/script|<!--/i.test(code)) throw new Error(`${name} preview is unsafe to inline`);
    const dir = join(outDir, 'components', name);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'stories.js'), code);
    await writeFile(
      join(dir, 'preview.html'),
      `<!-- @dsCard group="${htmlEscape(group)}" height=480 -->\n<!doctype html><html><head><meta charset="utf-8"></head><body><div id="preview"></div><script src="./stories.js"></script><script>window.WallarmPreview.mount(document.getElementById('preview'));</script></body></html>\n`,
    );
    withPreview.push(name);
  }
  return { withPreview, withoutStories };
}
