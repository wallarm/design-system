import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Replaces Storybook's own branding in the sidebar with the Wallarm Design System
// lockup. The logo lives in `./assets`, which is served as a static dir (see main.ts),
// so the relative path resolves both locally and under the /design-system/ GitHub Pages base.
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Wallarm Design System',
    brandImage: './wallarm-design-system.svg',
    brandUrl: './',
  }),
});
