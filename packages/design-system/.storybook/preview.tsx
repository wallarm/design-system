import { type FC, useEffect, useState } from 'react';
import "./react-aria-polyfill";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Decorator, Preview } from "storybook-react-rsbuild";
import { ThemeProvider, Toaster } from "../src";
import "./preview.css";

let toasterMountCount = 0;

const SingletonToaster: FC = () => {
  const [isFirst, setIsFirst] = useState(false);

  useEffect(() => {
    toasterMountCount++;
    if (toasterMountCount === 1) {
      setIsFirst(true);
    }
    return () => {
      toasterMountCount--;
    };
  }, []);

  return isFirst ? <Toaster /> : null;
};

const isDev = process.env.NODE_ENV === "development";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      initialActive: "canvas",
      layout: {
        isFullscreen: true,
        showNav: isDev,
        showPanel: isDev,
        showToolbar: isDev,
      },
      storySort: {
        order: [
          "Documentation",
          ["Patterns", { FilterInput: ["Composition", "*"] }],
          "Components",
        ],
      },
    },
  },
  tags: ["autodocs"],
};

export const decorators: Decorator[] = [
  withThemeByDataAttribute({
    themes: {
      light: "light",
      dark: "dark",
    },
    defaultTheme: "light",
    attributeName: "data-theme",
  }),
  (Story) => (
    <ThemeProvider>
      <Story />
      <SingletonToaster />
    </ThemeProvider>
  ),
];

export default preview;
