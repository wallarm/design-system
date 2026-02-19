import type { StorybookConfig } from 'storybook-react-rsbuild';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  framework: getAbsolutePath('storybook-react-rsbuild'),
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', '../src/**/*.mdx'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-mcp'),
    getAbsolutePath('@storybook/addon-themes'),
  ],
  features: {
    experimentalComponentsManifest: true,
    experimentalCodeExamples: true,
  },
  staticDirs: ['./assets'],
  rsbuildFinal: async (config, { configType }) => {
    if (configType === 'PRODUCTION' && config.output) {
      config.output.assetPrefix = '/design-system/';
    }

    config.server ??= {};
    config.server.publicDir = [{ name: resolve(__dirname, 'assets') }];

    return config;
  },
};

export default config;

function getAbsolutePath(value: string): never {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
