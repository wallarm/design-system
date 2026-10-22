import { useEffect } from 'react';
import { storybookRedirectTarget } from './storybookRedirect';

// Old Storybook deep links hit the docs site (or its 404.html); forward them to /storybook/.
export default function StorybookRedirect() {
  useEffect(() => {
    const target = storybookRedirectTarget(window.location, '/design-system/');
    if (target) window.location.replace(target);
  }, []);
  return null;
}
