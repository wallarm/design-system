import { Project, type SourceFile } from 'ts-morph';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, join, resolve } from 'node:path';
import { buildCanvasScripts, readInlineScript } from '../bundle/rslib-build';
import { CLAUDE_DESIGN, DESIGN_SYSTEM_DIR, PACKAGE_DIR } from '../config';

const require = createRequire(import.meta.url);
const { findStoryFiles, readStoryTitle } =
  require('../../../design-system/scripts/metadata/story-source.ts') as {
    findStoryFiles: (project: Project, dir: string) => string[];
    readStoryTitle: (file: SourceFile) => string | undefined;
  };
const htmlEscape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export type PreviewRow = { file: string; story: string };
export type PreviewGroup = { name: string; group: string; rows: PreviewRow[] };

/** Stories that load the Shiki or highlight.js adapter, which the Claude Design bundle stubs out. */
const EXCLUDED_ADAPTER =
  /\b(loadShikiAdapter|loadHighlightJsAdapter|shikiAdapter|highlightJsAdapter)\b/;

/** One group per guide: a component, or a story file for `splitByStoryFile` components. */
export async function previewGroups(
  only?: string[],
): Promise<{ groups: PreviewGroup[]; omitted: string[] }> {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });
  const componentsDir = resolve(DESIGN_SYSTEM_DIR, 'src/components');
  const names = (await readdir(componentsDir, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
  const groups: PreviewGroup[] = [];
  const omitted: string[] = [];
  for (const name of names) {
    if (CLAUDE_DESIGN.internal.has(name) || (only && !only.includes(name))) continue;
    const files = findStoryFiles(project, join(componentsDir, name)).sort(
      (a, b) =>
        Number(basename(b) === `${name}.stories.tsx`) -
        Number(basename(a) === `${name}.stories.tsx`),
    );
    const bySplit = CLAUDE_DESIGN.splitByStoryFile.has(name);
    const found = new Map<string, PreviewGroup>();
    for (const file of files) {
      const source = project.addSourceFileAtPath(file);
      const group = readStoryTitle(source)?.split('/')[0] ?? 'Components';
      const guide = bySplit ? basename(file, '.stories.tsx') : name;
      const target = found.get(guide) ?? { name: guide, group, rows: [] };
      found.set(guide, target);
      for (const decl of source
        .getVariableStatements()
        .filter(v => v.hasExportKeyword())
        .flatMap(v => v.getDeclarations()))
        if (EXCLUDED_ADAPTER.test(decl.getText()))
          omitted.push(
            `${name}/${decl.getName()}: preview omitted; Shiki/highlight.js adapters are not bundled (source in guide).`,
          );
        else target.rows.push({ file, story: decl.getName() });
    }
    groups.push(...[...found.values()].filter(g => g.rows.length));
  }
  return { groups, omitted };
}

/** `maxBytes` is the per-file cap; `only` limits the build to named components (tests). */
export async function buildPreviews({
  outDir,
  maxBytes = 512_000,
  only,
}: {
  outDir: string;
  maxBytes?: number;
  only?: string[];
}) {
  const meta = JSON.parse(
    await readFile(resolve(PACKAGE_DIR, '.claude-design/meta.json'), 'utf8'),
  ) as { exports: string[] };
  const withPreview: string[] = [];
  const { groups, omitted } = await previewGroups(only);
  const entryDir = resolve(PACKAGE_DIR, '.claude-design/runtime/previews');
  await mkdir(entryDir, { recursive: true });
  const partsOf = (rows: PreviewRow[], count: number): PreviewRow[][] => {
    const size = Math.ceil(rows.length / count);
    return Array.from({ length: Math.ceil(rows.length / size) }, (_, i) =>
      rows.slice(i * size, (i + 1) * size),
    );
  };
  const entryFor = async (key: string, rows: PreviewRow[]): Promise<string> => {
    const imports = rows
      .map(
        ({ file, story }, i) =>
          `import meta${i}, {${story} as Story${i}} from ${JSON.stringify(file)};`,
      )
      .join('\n');
    const source = `${imports}
      import React from 'react';
      const rows=[${rows.map(({ story }, i) => `{name:${JSON.stringify(story)},story:Story${i},meta:meta${i}}`).join(',')}];
      function Example({entry}) {
        const {story,meta}=entry; const args={...meta.args,...story.args};
        let Render=(typeof story==='function'||story.$$typeof)?story:story.render||meta.render||meta.component;
        let child=()=>React.createElement(Render,args);
        const context={args,globals:{theme:'light'},parameters:{...meta.parameters,...story.parameters},viewMode:'story'};
        for(const decorate of [...(meta.decorators||[]),...(story.decorators||[])].reverse()) { const previous=child; child=()=>decorate(previous,context); }
        return React.createElement('section',{'data-preview-story':entry.name,className:'p-16'},React.createElement('h2',{className:'text-sm mb-12'},entry.name),React.createElement(child));
      }
      window.WallarmPreview={mount(node){const root=window.ReactDOM.createRoot(node);root.render(React.createElement(window.WallarmDS.Root,null,rows.map((entry,i)=>React.createElement(Example,{key:i,entry}))));return root;}};
    `;
    const entry = join(entryDir, `${key.replaceAll('/', '__')}.tsx`);
    await writeFile(entry, source);
    return entry;
  };
  const scriptPath = (name: string, script: string) =>
    join(outDir, 'components', name, `${script}.js`);
  const build = async (entries: Record<string, string>) =>
    buildCanvasScripts({
      entries,
      outDir: join(outDir, 'components'),
      globalExports: meta.exports,
    });
  const readScript = async (name: string, script: string): Promise<string> => {
    const code = await readInlineScript(scriptPath(name, script));
    if (/<\/script|<!--/i.test(code)) throw new Error(`${name} preview is unsafe to inline`);
    return code;
  };

  const whole: Record<string, string> = {};
  for (const g of groups) whole[`${g.name}/stories`] = await entryFor(`${g.name}/stories`, g.rows);
  await build(whole);

  for (const g of groups) {
    const dir = join(outDir, 'components', g.name);
    let scripts = [await readScript(g.name, 'stories')];
    let names = ['stories'];
    // A script over the platform's text cap is rebuilt in as few parts as fit.
    for (let count = 2; scripts.some(code => Buffer.byteLength(code) > maxBytes); count++) {
      if (count > g.rows.length)
        throw new Error(`${g.name} preview exceeds ${maxBytes} bytes even with one story per part`);
      const parts = partsOf(g.rows, count);
      const entries: Record<string, string> = {};
      for (const [i, rows] of parts.entries())
        entries[`${g.name}/stories-${i + 1}`] = await entryFor(`${g.name}/stories-${i + 1}`, rows);
      await build(entries);
      names = parts.map((_, i) => `stories-${i + 1}`);
      scripts = await Promise.all(names.map(script => readScript(g.name, script)));
    }
    if (names.length > 1) await rm(join(dir, 'stories.js'));
    for (const [i, script] of names.entries()) {
      await writeFile(join(dir, `${script}.js`), scripts[i]!);
      await writeFile(
        join(dir, i === 0 ? 'preview.html' : `preview-${i + 1}.html`),
        `<!-- @dsCard group="${htmlEscape(g.group)}" height=480 -->\n<!doctype html><html><head><meta charset="utf-8"></head><body><div id="preview"></div><script src="./${script}.js"></script><script>window.WallarmPreview.mount(document.getElementById('preview'));</script></body></html>\n`,
      );
    }
    withPreview.push(g.name);
  }
  return { withPreview, omitted };
}
