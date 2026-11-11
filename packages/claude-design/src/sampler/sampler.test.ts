import { readFileSync } from 'node:fs';

import { describe, expect, it } from '@rstest/core';

import { SKELETON_DATA, SKELETON_FILE, samplerProblems } from './sampler';

const head =
  '<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components/bundle.css">\n<script src="components/bundle.js"></script>';
const context = {
  css: '.p-16{padding:16px}.p-5{padding:5px}.w-\\[320px\\]{width:320px}.md\\:gap-24{}.gap-24{}',
  tokens: ':root{--spacing-16: 16px;--spacing-24: 24px;}',
  exports: ['Root', 'Button', 'Icons'],
};

describe('samplerProblems', () => {
  it('accepts defined, on-scale classes and exported globals', () => {
    const html = `${head}<x-import component-from-global-scope="WallarmDS.Button" class-name="p-16 w-[320px] md:gap-24"></x-import>
      <div class="p-16" style="gap: var(--spacing-24)"></div><script>h(WallarmDS.Icons.Plus, { className: 'p-16' })</script>`;
    expect(samplerProblems(html, context)).toEqual([]);
  });

  it('reports missing classes, off-scale spacing, unknown tokens and globals, and unlinked heads', () => {
    const html = `<script src="components/bundle.js"></script><link rel="stylesheet" href="tokens.css">
      <div class="p-5 gap-3" style="gap: var(--spacing-3)"></div>
      <x-import component-from-global-scope="WallarmDS.Missing"></x-import><script>({ className: 'space-y-4' })</script>`;
    expect(samplerProblems(html, context)).toEqual([
      'head must link, in order: <link rel="stylesheet" href="tokens.css"> <link rel="stylesheet" href="components/bundle.css"> <script src="components/bundle.js"></script>',
      'class p-5 is off the spacing scale',
      'class gap-3 has no rule in bundle.css',
      'class gap-3 is off the spacing scale',
      'class space-y-4 has no rule in bundle.css',
      'class space-y-4 is off the spacing scale',
      'var(--spacing-3) is not a token',
      'WallarmDS.Missing is not exported',
    ]);
  });

  it('checks names behind the DS alias too', () => {
    expect(
      samplerProblems(
        `${head}<script>var DS = WallarmDS; h(DS.Button); h(DS.NavPanel)</script>`,
        context,
      ),
    ).toEqual(['WallarmDS.NavPanel is not exported']);
  });

  it('the shipped skeleton has one APP data object, read by the script and never written', () => {
    const html = readFileSync(new URL(`./${SKELETON_FILE}`, import.meta.url), 'utf8');
    expect(html.split(SKELETON_DATA)).toHaveLength(2);
    expect(html).toContain('data-testid="product-shell"');
    expect(html).not.toMatch(/(?<!var )\bAPP(\.\w+)*\s*=[^=]/);
  });

  it('the shipped sampler links the system and mounts the Drawer by its open prop', () => {
    const html = readFileSync(new URL('./sampler.dc.html', import.meta.url), 'utf8');
    expect(html.indexOf('tokens.css')).toBeLessThan(html.indexOf('components/bundle.js'));
    expect(html).toMatch(/WallarmDS\.Drawer" open="\{\{drawerOpen\}\}"/);
    expect(html).not.toMatch(/\sdefault-open=/);
  });
});
