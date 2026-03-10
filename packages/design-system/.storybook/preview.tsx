import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Decorator, Preview } from 'storybook-react-rsbuild';
import { ThemeProvider, Toaster } from '../src';
import './preview.css';

const isDev = process.env.NODE_ENV === 'development';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      initialActive: 'canvas',
      layout: {
        isFullscreen: true,
        showNav: isDev,
        showPanel: isDev,
        showToolbar: isDev,
      },
      storySort: {
        order: ['Documentation'],
      },
    },
  },
  tags: ['autodocs'],
};

export const decorators: Decorator[] = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
  Story => (
    <ThemeProvider>
      <Story />
      <Toaster />
    </ThemeProvider>
  ),
];

export default preview;
