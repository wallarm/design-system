import type { FC } from 'react';
import { TableSettingsMenu } from './TableSettingsMenu';
import { useTableSettingsMenuContext } from './TableSettingsMenuContext';

interface TableSettingsMenuSlotProps {
  hasConsumerMenu: boolean;
}

/**
 * Internal anchor for the settings menu. Registers its DOM node with the
 * context so a consumer-rendered `<TableSettingsMenu>` can portal into it, and
 * renders the default menu when the consumer did not supply one.
 */
export const TableSettingsMenuSlot: FC<TableSettingsMenuSlotProps> = ({ hasConsumerMenu }) => {
  const { setAnchorNode } = useTableSettingsMenuContext();

  return (
    <>
      <div ref={setAnchorNode} />
      {!hasConsumerMenu && <TableSettingsMenu />}
    </>
  );
};

TableSettingsMenuSlot.displayName = 'TableSettingsMenuSlot';
