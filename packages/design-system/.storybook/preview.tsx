import { withThemeByClassName } from '@storybook/addon-themes';
import type { Decorator, Preview } from 'storybook-react-rsbuild';
import { ThemeProvider, Toaster } from '../src';
import './preview.css';

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
        showNav: false,
        showPanel: false,
        showToolbar: false,
      },
      storySort: {
        order: ['Documentation'],
      },
    },
  },
  tags: ['autodocs'],
};

export const decorators: Decorator[] = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
  Story => (
    <ThemeProvider>
      <Story />
      <Toaster />
    </ThemeProvider>
  ),
];

export default preview;
