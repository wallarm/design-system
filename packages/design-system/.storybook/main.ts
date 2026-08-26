import type { StorybookConfig } from 'storybook-react-rsbuild';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  framework: getAbsolutePath('storybook-react-rsbuild'),
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', '../src/**/*.mdx'],
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-themes')],
  docs: {
    // The sidebar entry reads "Overview" instead of Storybook's default "Docs".
    defaultName: 'Overview',
  },
  staticDirs: ['./assets'],
  // Storybook hard-caps the sidebar brand image at 150px wide, which renders our
  // lockup too small to read. Size it by height instead: 24px, with the width
  // left to follow the lockup's 226:28 ratio, so it lands at ~194px and sits
  // inside the brand slot rather than overflowing it the way a width-driven rule
  // had to. `max-width` keeps that true if the sidebar is dragged narrow —
  // `contain` scales the lockup down whole instead of letting it spill or squash.
  managerHead: head => `${head}
    <style>
      #storybook-sidebar-region img {
        height: 24px !important;
        width: auto !important;
        max-width: 100% !important;
        object-fit: contain;
        object-position: left center;
      }
    </style>
  `,
  rsbuildFinal: async (config, { configType }) => {
    if (configType === 'PRODUCTION' && config.output) {
      config.output.assetPrefix = '/design-system/';
    }

    return config;
  },
};

export default config;

function getAbsolutePath(value: string): never {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
