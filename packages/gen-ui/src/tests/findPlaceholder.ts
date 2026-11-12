import { waitFor } from '@testing-library/react';

/** Waits for the skeleton that stands in for `id` (a component type or an agent's id). */
export const findPlaceholder = (id: string) =>
  waitFor(() => {
    const el = document.querySelector(`[data-gen-ui-placeholder="${id}"]`);
    if (!el) throw new Error(`no placeholder for ${id}`);
    return el;
  });
