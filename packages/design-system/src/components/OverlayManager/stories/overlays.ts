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
