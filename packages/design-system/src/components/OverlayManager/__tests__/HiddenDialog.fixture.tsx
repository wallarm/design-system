import type { OverlayProps } from '../types';

// Not exported on purpose: declarationEmit.fixture.tsx must not need to name it.
interface HiddenProps extends OverlayProps<boolean> {
  entityId: string;
}
export const HiddenDialog = ({ entityId }: HiddenProps) => <span>{entityId}</span>;
