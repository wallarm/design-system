import { mergeRsbuildConfig } from '@rsbuild/core';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';

import { rsbuildConfig } from '@wallarm/rsbuild-config/rsbuild.config';

export default mergeRsbuildConfig(rsbuildConfig, {
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: 'react',
          autoCodeSplitting: true,
          semicolons: true,
        }),
      ],
    },
  },
  html: {
    title: 'WADS Playground',
    favicon: './public/favicon.png',
    meta: {
      viewport: 'width=device-width, initial-scale=1',
      'theme-color': '#000000',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black',
    },
  },
});
