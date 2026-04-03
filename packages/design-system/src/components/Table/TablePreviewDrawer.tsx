import type { FC, ReactNode } from 'react';
import { useRef } from 'react';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '../Drawer';
import { useTableContext } from './TableContext';

export const TablePreviewDrawer: FC = () => {
  const { table, preview: previewCtx } = useTableContext();

  const row = previewCtx.rowId ? table.getRowModel().rowsById[previewCtx.rowId] : undefined;
  const header = row && previewCtx.renderHeader ? previewCtx.renderHeader(row) : undefined;
  const content = row && previewCtx.renderContent ? previewCtx.renderContent(row) : undefined;

  // Keep the last valid preview so drawer content doesn't flash empty during close animation
  const lastHeaderRef = useRef<ReactNode>(null);
  const lastPreviewRef = useRef<ReactNode>(null);
  if (header) lastHeaderRef.current = header;
  if (content) lastPreviewRef.current = content;
  const displayHeader = header ?? lastHeaderRef.current;
  const displayContent = content ?? lastPreviewRef.current;

  if (!previewCtx.renderContent) return null;

  return (
    <Drawer
      open={!!row}
      onOpenChange={open => {
        if (!open) previewCtx.setRowId(null);
      }}
      modal={false}
      overlay={false}
      closeOnOutsideClick={false}
      width={960}
    >
      <DrawerContent>
        {displayHeader ?? (
          <DrawerHeader>
            <span />
          </DrawerHeader>
        )}
        <DrawerBody>{displayContent}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

TablePreviewDrawer.displayName = 'TablePreviewDrawer';
