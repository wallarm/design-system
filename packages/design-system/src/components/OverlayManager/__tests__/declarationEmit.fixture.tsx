// Checked with declaration emit by tsconfig.typetest.json: the inferred definition type must not need
// the non-exported props interface (TS4023), which library packages hit with a plain Omit.
import { defineOverlay } from '../defineOverlay';
import type { OverlayProps } from '../types';

interface HiddenProps extends OverlayProps<boolean> {
  entityId: string;
}
const HiddenDialog = ({ entityId }: HiddenProps) => <span>{entityId}</span>;
export const HiddenOverlay = defineOverlay(async () => HiddenDialog);
