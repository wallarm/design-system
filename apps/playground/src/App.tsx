import { RouterProvider, createRouter } from '@tanstack/react-router';

import { ThemeProvider } from '@wallarm/design-system/ThemeProvider';

import { routeTree } from './routeTree.gen';

import './App.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const App = () => (
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);
