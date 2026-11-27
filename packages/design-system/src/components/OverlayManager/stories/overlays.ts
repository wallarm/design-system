import { defineOverlay } from '../defineOverlay';

// A tiny module on purpose: importing it does not pull in any dialog's code.
export const ConfirmDeleteOverlay = defineOverlay(() =>
  import('./ConfirmDeleteDialog').then(m => m.ConfirmDeleteDialog),
);

export const EditUserOverlay = defineOverlay(() =>
  import('./EditUserDrawer').then(m => m.EditUserDrawer),
);

export const UnsavedChangesOverlay = defineOverlay(() =>
  import('./UnsavedChangesDialog').then(m => m.UnsavedChangesDialog),
);

/** The delete confirm behind a slow network: its first load takes 1.5 s, like a heavy chunk. */
export const SlowConfirmDeleteOverlay = defineOverlay(async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const { ConfirmDeleteDialog } = await import('./ConfirmDeleteDialog');
  return ConfirmDeleteDialog;
});
