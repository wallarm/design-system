import path from 'node:path';

import { mergeRsbuildConfig } from '@rsbuild/core';
import { defineConfig } from '@rspress/core';
import { rsbuildConfig } from '@wallarm-org/rsbuild-config/rsbuild.config';
import { postcssConfig } from '@wallarm-org/tailwind-config/postcss';

import { cleanSearchIndex } from './plugins/cleanSearchIndex';
import { THEME_SCRIPT } from './theme/themeScript';

const dir = import.meta.dirname;
const siteOrigin = process.env.DOCS_SITE_ORIGIN ?? 'https://wallarm.github.io';
// `preview:local` builds elsewhere so it never overwrites the production `doc_build`.
const outDir = process.env.DOCS_OUT_DIR ?? 'doc_build';

export default defineConfig({
  root: 'docs',
  base: '/design-system/',
  // Baked into llms.txt / llms-full.txt and the per-page "For AI agents" hint.
  siteOrigin,
  outDir,
  title: 'Wallarm Design System',
  description: 'React components, tokens and AI tooling for Wallarm products',
  llms: true,
  plugins: [cleanSearchIndex()],
  // Example code is noise in search results; headings, prose and prop tables stay.
  search: { codeBlocks: false },
  globalStyles: path.join(dir, 'styles/global.css'),
  globalUIComponents: [path.join(dir, 'theme/StorybookRedirect.tsx')],
  markdown: {
    globalComponents: [
      path.join(dir, 'theme/components/StoryPreview.tsx'),
      path.join(dir, 'theme/components/Explorer.tsx'),
      path.join(dir, 'theme/components/TokenTable.tsx'),
    ],
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', mode: 'link', content: 'https://github.com/wallarm/design-system' },
    ],
    editLink: {
      docRepoBaseUrl: 'https://github.com/wallarm/design-system/tree/main/apps/docs/docs',
    },
    llmsUI: { viewOptions: ['markdownLink', 'chatgpt', 'claude'] },
  },
  // Rspress skips its own pluginReact because the shared config already has one (with React Compiler).
  // Only the shared plugins: its CircularDependencyRspackPlugin(failOnError) trips on existing
  // cycles in DS source (Table, FilterInput), which the site bundles from src.
  builderConfig: mergeRsbuildConfig(
    { plugins: rsbuildConfig.plugins },
    {
      // Not Rspress `head`: its tuple form can't carry inline script content.
      // The origin is compiled into modules; without it in the key a local build poisons the cache.
      performance: { buildCache: { cacheDigest: [siteOrigin] } },
      html: { tags: [{ tag: 'script', children: THEME_SCRIPT, head: true, append: false }] },
      tools: {
        postcss: { postcssOptions: { plugins: postcssConfig.plugins } },
        // Resolve DS imports to packages/design-system/src.
        rspack: { resolve: { conditionNames: ['development', '...'] } },
      },
    },
  ),
});
