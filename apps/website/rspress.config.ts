import { mergeRsbuildConfig } from '@rsbuild/core';
import { defineConfig } from '@rspress/core';
import path from 'node:path';
import { rsbuildConfig } from '@wallarm-org/rsbuild-config/rsbuild.config';
import { postcssConfig } from '@wallarm-org/tailwind-config/postcss';
import { cleanSearchIndex } from './plugins/cleanSearchIndex';
import { STORYBOOK_URL } from './theme/storybookRedirect';
import { THEME_SCRIPT } from './theme/themeScript';

const dir = import.meta.dirname;
const siteOrigin = process.env.DOCS_SITE_ORIGIN ?? 'https://wallarm.github.io';
// `preview:local` builds elsewhere so it never overwrites the production `doc_build`.
const outDir = process.env.DOCS_OUT_DIR ?? 'doc_build';
// Storybook mark (Simple Icons, CC0); fill follows the nav text colour like the GitHub icon.
const STORYBOOK_ICON =
  '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><title>Storybook</title><path d="M16.71.243l-.12 2.71a.18.18 0 00.29.15l1.06-.8.9.7a.18.18 0 00.28-.14l-.1-2.76 1.33-.1a1.2 1.2 0 011.279 1.2v21.596a1.2 1.2 0 01-1.26 1.2l-16.096-.72a1.2 1.2 0 01-1.15-1.16l-.75-19.797a1.2 1.2 0 011.13-1.27L16.7.222zM13.64 9.3c0 .47 3.16.24 3.59-.08 0-3.2-1.72-4.89-4.859-4.89-3.15 0-4.899 1.72-4.899 4.29 0 4.45 5.999 4.53 5.999 6.959 0 .7-.32 1.1-1.05 1.1-.96 0-1.35-.49-1.3-2.16 0-.36-3.649-.48-3.769 0-.27 4.03 2.23 5.2 5.099 5.2 2.79 0 4.969-1.49 4.969-4.18 0-4.77-6.099-4.64-6.099-6.999 0-.97.72-1.1 1.13-1.1.45 0 1.25.07 1.19 1.87z"/></svg>';

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
      {
        icon: { svg: STORYBOOK_ICON },
        mode: 'link',
        content: STORYBOOK_URL,
      },
      { icon: 'github', mode: 'link', content: 'https://github.com/wallarm/design-system' },
    ],
    editLink: {
      docRepoBaseUrl: 'https://github.com/wallarm/design-system/tree/main/apps/website/docs',
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
