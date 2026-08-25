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
  // lockup too small to read. 226px is the SVG's native width, so it renders 1:1
  // with no upscaling. The brand slot is only ~207px, hence the +19px allowance —
  // it borrows the empty gutter before the settings button and still tracks the
  // slot (keeping a 9px gap) if the sidebar is dragged narrower.
  managerHead: head => `${head}
    <style>
      #storybook-sidebar-region img {
        width: 226px !important;
        max-width: calc(100% + 19px) !important;
        height: auto !important;
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
