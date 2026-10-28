import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from '@rstest/core';

import {
  type AssetEntry,
  CANVAS_SAMPLER,
  CANVAS_SKELETON,
  canvasSampler,
  pack,
  README_SECTIONS,
  renderSetup,
} from './pack';

const template = readFileSync(new URL('../content/SETUP.md', import.meta.url), 'utf8');
const updateTemplate = readFileSync(new URL('../content/UPDATE.md', import.meta.url), 'utf8');
const sampler = canvasSampler(
  readFileSync(new URL('./sampler/sampler.dc.html', import.meta.url), 'utf8'),
);
const skeleton = canvasSampler(
  readFileSync(new URL('./sampler/app-skeleton.dc.html', import.meta.url), 'utf8'),
);
const readme = README_SECTIONS.map(name => `## ${name}\n`).join('\n');

describe('renderSetup', () => {
  it('fills every placeholder of the shipped template', () => {
    const guide = renderSetup({
      template,
      readme,
      sampler,
      skeleton,
      version: '9.8.7',
      files: 362,
    });
    expect(guide).not.toMatch(/\{\{\w+\}\}/);
    expect(guide).toContain('# Install Wallarm Design System 9.8.7 in Claude Design');
    expect(guide).toContain('The design system: 362 files');
    expect(guide).toContain(
      'Send `project/components/index.d.ts` with the content type `text/plain`',
    );
    expect(guide).toContain(
      `{"${CANVAS_SAMPLER}":{"x":0,"y":0,"w":1440,"h":900,"title":"Wallarm sampler","expand":"fill"}}`,
    );
    expect(guide).toContain('## 6. Build the app skeleton');
    expect(guide).toContain(
      `{"${CANVAS_SKELETON}":{"x":1520,"y":0,"w":1440,"h":900,"title":"Wallarm app","expand":"fill"}}`,
    );
    expect(guide).toContain('starts with `var APP = {`');
  });

  it('fills UPDATE.md, pinning its version, and SETUP.md keeps no copy of its steps', () => {
    const guide = renderSetup({
      name: 'UPDATE.md',
      template: updateTemplate,
      readme,
      sampler,
      skeleton,
      version: '9.8.7',
      files: 362,
    });
    expect(guide).not.toMatch(/\{\{\w+\}\}/);
    expect(guide).toContain('# Update Wallarm Design System to 9.8.7 in Claude Design');
    expect(guide).toContain(
      'npx -y @wallarm-org/claude-design@9.8.7 export --overwrite --existing current-files.json\n',
    );
    expect(guide).toContain('https://claude.ai/artifact/FXWSxmN7zfnpsyMemE5VD7');
    expect(guide).toContain(
      'npx -y @wallarm-org/claude-design@9.8.7 index --blobs wallarm-design-system/blobs.json --index current-index.json',
    );
    expect(guide).not.toContain('@latest');
    expect(guide).toContain(`Never replace or edit \`project/${CANVAS_SKELETON}\` on an update`);
    expect(template).not.toContain('current-files.json');
    expect(template).toContain('claude-design@latest update');
  });

  it('fails on a placeholder without a value or a renamed README section', () => {
    expect(() =>
      renderSetup({ template: '{{nope}}', readme, sampler, skeleton, version: '1.0.0', files: 1 }),
    ).toThrow('SETUP.md: no value for {{nope}}');
    expect(() =>
      renderSetup({
        name: 'UPDATE.md',
        template: '{{nope}}',
        readme,
        sampler,
        skeleton,
        version: '1',
        files: 1,
      }),
    ).toThrow('UPDATE.md: no value for {{nope}}');
    expect(() =>
      renderSetup({
        template,
        readme: '## Rules\n',
        sampler,
        skeleton,
        version: '1.0.0',
        files: 1,
      }),
    ).toThrow('README.md has no section');
  });
});

describe('canvasSampler', () => {
  it('links the canvas support script, then the system under ds/<folder>/', () => {
    expect(sampler).toContain(
      [
        '<script src="./support.js"></script>',
        '<link rel="stylesheet" href="ds/wallarm-design-system/tokens.css">',
        '<link rel="stylesheet" href="ds/wallarm-design-system/components/bundle.css">',
        '<script src="ds/wallarm-design-system/components/bundle.js"></script>',
      ].join('\n'),
    );
  });
});

// test:export runs after `export`, so the real build is on disk.
describe('pack', () => {
  it('packs the real export with the SVGs outside project/ and no reference to them', () => {
    const out = mkdtempSync(join(tmpdir(), 'claude-design-pack-'));
    try {
      const { files, assets } = pack(undefined, out);
      const manifest = JSON.parse(readFileSync(join(out, 'assets.json'), 'utf8')) as AssetEntry[];
      expect(manifest).toHaveLength(assets);
      expect(new Set(manifest.map(asset => asset.group))).toEqual(new Set(['Icons', 'Logos']));
      for (const asset of manifest) {
        expect(asset.path).toMatch(/^assets\/(Icons|Logos)\/[^/]+\.svg$/);
        expect(readFileSync(join(out, asset.path)).length).toBe(asset.size);
      }
      const index = JSON.parse(readFileSync(join(out, 'project/design-system.json'), 'utf8'));
      expect([index.groups, index.assetGroups]).toEqual([[], {}]);
      const paths = readdirSync(join(out, 'project'), { recursive: true }).map(String);
      expect(paths.filter(path => /^assets([/\\]|$)/.test(path))).toEqual([]);
      const referencing = paths
        .filter(path => /\.(md|json|html|css|ts)$/.test(path))
        .filter(path => readFileSync(join(out, 'project', path), 'utf8').includes('assets/'));
      expect(referencing).toEqual([]);
      const setup = readFileSync(join(out, 'SETUP.md'), 'utf8');
      expect(setup).toContain(`(${files} files)`);
      expect(setup).toContain(`${assets} SVG files`);
      expect(setup).toContain('<script src="./support.js"></script>');
      for (const file of [CANVAS_SAMPLER, CANVAS_SKELETON])
        expect(readFileSync(join(out, file), 'utf8')).toContain(
          '<script src="ds/wallarm-design-system/components/bundle.js"></script>',
        );
      expect(readFileSync(join(out, CANVAS_SKELETON), 'utf8')).toContain('var APP = {');
      const update = readFileSync(join(out, 'UPDATE.md'), 'utf8');
      expect(update).not.toMatch(/\{\{\w+\}\}/);
      expect(update).toContain(`(${files} files)`);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
