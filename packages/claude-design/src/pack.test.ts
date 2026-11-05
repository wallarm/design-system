import { describe, expect, it } from '@rstest/core';
import { readFileSync } from 'node:fs';
import { CANVAS_SAMPLER, canvasSampler, README_SECTIONS, renderSetup } from './pack';

const template = readFileSync(new URL('../content/SETUP.md', import.meta.url), 'utf8');
const sampler = canvasSampler(
  readFileSync(new URL('./sampler/sampler.dc.html', import.meta.url), 'utf8'),
);
const readme = README_SECTIONS.map(name => `## ${name}\n`).join('\n');

describe('renderSetup', () => {
  it('fills every placeholder of the shipped template', () => {
    const guide = renderSetup({ template, readme, sampler, version: '9.8.7', files: 362 });
    expect(guide).not.toMatch(/\{\{\w+\}\}/);
    expect(guide).toContain('# Install Wallarm Design System 9.8.7 in Claude Design');
    expect(guide).toContain('The design system: 362 files');
    expect(guide).toContain(
      'Send `project/components/index.d.ts` with the content type `text/plain`',
    );
    expect(guide).toContain(
      `{"${CANVAS_SAMPLER}":{"x":0,"y":0,"w":1440,"h":900,"title":"Wallarm sampler","expand":"fill"}}`,
    );
  });

  it('fails on a placeholder without a value or a renamed README section', () => {
    expect(() =>
      renderSetup({ template: '{{nope}}', readme, sampler, version: '1.0.0', files: 1 }),
    ).toThrow('no value for {{nope}}');
    expect(() =>
      renderSetup({ template, readme: '## Rules\n', sampler, version: '1.0.0', files: 1 }),
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
