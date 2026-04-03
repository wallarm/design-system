import type { FC, ReactNode } from 'react';
import { useRef } from 'react';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '../Drawer';
import { useTableContext } from './TableContext';

export const TablePreviewDrawer: FC = () => {
  const { table, previewRowId, setPreviewRowId, renderPreviewContent } = useTableContext();

  const row = previewRowId ? table.getRowModel().rowsById[previewRowId] : undefined;
  const preview = row && renderPreviewContent ? renderPreviewContent(row) : undefined;

  // Keep the last valid preview so drawer content doesn't flash empty during close animation
  const lastPreviewRef = useRef<ReactNode>(null);
  if (preview) lastPreviewRef.current = preview;
  const displayPreview = preview ?? lastPreviewRef.current;

  if (!renderPreviewContent) return null;

  return (
    <Drawer
      open={!!row}
      onOpenChange={open => {
        if (!open) setPreviewRowId(null);
      }}
      modal={false}
      overlay={false}
      closeOnOutsideClick={false}
      width={960}
    >
      <DrawerContent>
        <DrawerHeader>
          <span />
        </DrawerHeader>
        <DrawerBody>{displayPreview}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

TablePreviewDrawer.displayName = 'TablePreviewDrawer';
