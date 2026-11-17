// Checked with declaration emit by tsconfig.typetest.json: the inferred definition type must not need
// the non-exported props interface (TS4023), which library packages hit with a plain Omit.
// The props live in another module on purpose: TS4023 only arises across modules, because the emitted
// .d.ts can always name an interface declared in the same file.
import { defineOverlay } from '../defineOverlay';
import { HiddenDialog } from './HiddenDialog.fixture';

export const HiddenOverlay = defineOverlay(async () => HiddenDialog);
