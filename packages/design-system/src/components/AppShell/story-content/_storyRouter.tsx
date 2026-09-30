import { createContext, type FC, type ReactNode, useCallback, useContext, useState } from 'react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { deriveProduct, type Product, productLandingPath } from './_storyLib';

// Story-only harness: every story gets its own TanStack Router on a memory history,
// so navigation never touches Storybook's iframe URL and stories don't share history.
// `story-content/**` is excluded from the published build (see rslib.config.ts).

const StoryContentContext = createContext<ReactNode>(null);

const StoryContent: FC = () => <>{useContext(StoryContentContext)}</>;

const createStoryRouter = (initialPath: string) => {
  const rootRoute = createRootRoute({ component: StoryContent });
  // Catch-all so every product URL matches; the shell reads the pathname itself.
  const splatRoute = createRoute({ getParentRoute: () => rootRoute, path: '$' });

  return createRouter({
    routeTree: rootRoute.addChildren([splatRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
};

interface StoryRouterProps {
  /** Starting URL of the memory history. */
  initialPath?: string;
  children: ReactNode;
}

/** Renders `children` inside a per-render TanStack Router with memory history. */
export const StoryRouter: FC<StoryRouterProps> = ({ initialPath = '/home', children }) => {
  const [router] = useState(() => createStoryRouter(initialPath));

  return (
    <StoryContentContext.Provider value={children}>
      <RouterProvider router={router} />
    </StoryContentContext.Provider>
  );
};

StoryRouter.displayName = 'StoryRouter';

/** Current router pathname — what a host passes to `RemoteShell`'s `pathname` prop. */
export const useStoryPathname = (): string =>
  useRouterState({ select: state => state.location.pathname });

/** Router-driven product navigation for the rail. */
export const useStoryProductNavigation = () => {
  const navigate = useNavigate();
  const pathname = useStoryPathname();

  const goToProduct = useCallback(
    (product: Product) => {
      navigate({ to: productLandingPath(product) });
    },
    [navigate],
  );

  return { pathname, activeProduct: deriveProduct(pathname), goToProduct };
};
