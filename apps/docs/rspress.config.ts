import { mergeRsbuildConfig } from '@rsbuild/core';
import { defineConfig } from '@rspress/core';
import path from 'node:path';
import { rsbuildConfig } from '@wallarm-org/rsbuild-config/rsbuild.config';
import { postcssConfig } from '@wallarm-org/tailwind-config/postcss';
import { THEME_SCRIPT } from './theme/themeScript';

const dir = import.meta.dirname;

export default defineConfig({
  root: 'docs',
  base: '/design-system/',
  siteOrigin: 'https://wallarm.github.io',
  title: 'Wallarm Design System',
  description: 'React components, tokens and AI tooling for Wallarm products',
  llms: true,
  globalStyles: path.join(dir, 'styles/global.css'),
  markdown: {
    globalComponents: [
      path.join(dir, 'theme/components/StoryPreview.tsx'),
      path.join(dir, 'theme/components/Explorer.tsx'),
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
      html: { tags: [{ tag: 'script', children: THEME_SCRIPT, head: true, append: false }] },
      tools: {
        postcss: { postcssOptions: { plugins: postcssConfig.plugins } },
        // Resolve DS imports to packages/design-system/src.
        rspack: { resolve: { conditionNames: ['development', '...'] } },
      },
    },
  ),
});
