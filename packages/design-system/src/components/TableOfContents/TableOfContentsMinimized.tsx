import { type FC, type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Popover as ArkUiPopover } from '@ark-ui/react/popover';
import { useTestId } from '../../utils/testId';
import { PopoverContent } from '../Popover/PopoverContent';
import { TableOfContentsContext } from './TableOfContentsContext';

const OPEN_DELAY = 100;
const CLOSE_DELAY = 300;
const POPOVER_WIDTH = '220px';

interface TableOfContentsMinimizedProps {
  /** Id of the header row with the expand button — the popover anchors under it. */
  anchorId: string;
  title: string;
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  children: ReactNode;
}

/** Dashes plus the popover that opens over them: hover (mouse) or tap (touch / pen). */
export const TableOfContentsMinimized: FC<TableOfContentsMinimizedProps> = ({
  anchorId,
  title,
  value,
  onValueChange,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [dashes, setDashes] = useState<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pointerType = useRef('mouse');
  const dashesTestId = useTestId('dashes');
  const popoverTestId = useTestId('popover');

  useEffect(() => () => clearTimeout(timer.current), []);

  const setOpenNow = (next: boolean) => {
    clearTimeout(timer.current);
    setOpen(next);
  };

  const setOpenLater = (next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  };

  const handleOpenChange = (details: ArkUiPopover.OpenChangeDetails) => setOpenNow(details.open);

  const handlePointerDown = (event: PointerEvent) => {
    pointerType.current = event.pointerType;
  };

  const handleDashesClick = () => {
    if (pointerType.current !== 'mouse') setOpenNow(!open);
  };

  const handlePointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setOpenLater(true, OPEN_DELAY);
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') setOpenLater(false, CLOSE_DELAY);
  };

  const handleContentPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') clearTimeout(timer.current);
  };

  const handleItemSelect = () => setOpenNow(false);

  return (
    <ArkUiPopover.Root
      ids={{ anchor: anchorId }}
      open={open}
      onOpenChange={handleOpenChange}
      // A tap on the dashes is the toggle, not an outside interaction.
      persistentElements={[() => dashes]}
      positioning={{ placement: 'bottom-end', gutter: 4 }}
      autoFocus={false}
      lazyMount
      unmountOnExit
    >
      <div
        ref={setDashes}
        aria-hidden
        data-slot='table-of-contents-dashes'
        data-testid={dashesTestId}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleDashesClick}
        className='flex min-h-0 cursor-pointer flex-col overflow-hidden px-4 pb-4'
      >
        <TableOfContentsContext value={{ value, onValueChange, mode: 'dash' }}>
          {children}
        </TableOfContentsContext>
      </div>
      <PopoverContent
        aria-label={title}
        data-slot='table-of-contents-popover'
        data-testid={popoverTestId}
        minWidth={POPOVER_WIDTH}
        maxWidth={POPOVER_WIDTH}
        onPointerEnter={handleContentPointerEnter}
        onPointerLeave={handlePointerLeave}
        className='p-8'
      >
        <TableOfContentsContext
          value={{ value, onValueChange, mode: 'row', onItemSelect: handleItemSelect }}
        >
          <ul className='flex flex-col gap-1'>{children}</ul>
        </TableOfContentsContext>
      </PopoverContent>
    </ArkUiPopover.Root>
  );
};

TableOfContentsMinimized.displayName = 'TableOfContentsMinimized';
