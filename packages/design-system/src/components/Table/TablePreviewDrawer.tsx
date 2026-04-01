import type { FC } from 'react';
import { useRef } from 'react';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from '../Drawer';
import { useTableContext } from './TableContext';

export const TablePreviewDrawer: FC = () => {
  const { table, previewRowId, setPreviewRowId, renderPreviewContent } = useTableContext();

  const row = previewRowId ? table.getRowModel().rowsById[previewRowId] : undefined;
  const preview = row && renderPreviewContent ? renderPreviewContent(row) : undefined;

  // Keep the last valid preview so drawer content doesn't flash empty during close animation
  const lastPreviewRef = useRef(preview);
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
    >
      {displayPreview && (
        <DrawerContent>
          {displayPreview.title && (
            <DrawerHeader>
              <DrawerTitle>{displayPreview.title}</DrawerTitle>
            </DrawerHeader>
          )}
          <DrawerBody>{displayPreview.content}</DrawerBody>
        </DrawerContent>
      )}
    </Drawer>
  );
};

TablePreviewDrawer.displayName = 'TablePreviewDrawer';
