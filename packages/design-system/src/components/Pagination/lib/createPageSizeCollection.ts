import { createListCollection } from '@ark-ui/react/collection';

/** Build the Select collection for the "rows per page" control. */
export const createPageSizeCollection = (options: number[]) =>
  createListCollection({
    items: options.map(value => ({ label: String(value), value: String(value) })),
  });
