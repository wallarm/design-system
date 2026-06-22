import {
  type ButtonHTMLAttributes,
  createContext,
  type FC,
  type MouseEvent,
  type ReactNode,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight } from '../../icons';
import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useHorizontalScrollState } from './hooks';
import { useTableContext } from './TableContext';
import { useTableScrollHandlerContext } from './TableScrollHandlerContext';

interface TableScrollStateContextValue {
  atStart: boolean;
  atEnd: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
}

const TableScrollStateContext = createContext<TableScrollStateContextValue | null>(null);

const useTableScrollStateContext = (): TableScrollStateContextValue => {
  const ctx = useContext(TableScrollStateContext);
  if (!ctx) {
    throw new Error(
      'TableScrollHandlerLeft / TableScrollHandlerRight must be rendered inside <TableScrollHandler>',
    );
  }
  return ctx;
};

type ScrollButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'type' | 'children'
>;

export type TableScrollHandlerLeftProps = ScrollButtonProps;
export type TableScrollHandlerRightProps = ScrollButtonProps;

/**
 * "Scroll left" control. All native button attributes (`data-analytics-id`,
 * `data-analytics-props`, `aria-*`, `id`, `ref`, any `data-*`) reach the
 * underlying `<button>`. Consumer `onClick` runs first; calling
 * `event.preventDefault()` skips the internal scroll. Must be a child of
 * `<TableScrollHandler>`.
 */
export const TableScrollHandlerLeft: FC<TableScrollHandlerLeftProps> = ({
  onClick,
  disabled,
  'aria-label': ariaLabel,
  ...rest
}) => {
  const { atStart, scrollLeft } = useTableScrollStateContext();
  const isDisabled = disabled ?? atStart;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    scrollLeft();
  };

  return (
    <Tooltip disabled={isDisabled}>
      <TooltipTrigger asChild>
        <Button
          {...rest}
          type='button'
          variant='ghost'
          color='neutral'
          size='small'
          disabled={isDisabled}
          onClick={handleClick}
          aria-label={ariaLabel ?? 'Scroll left'}
        >
          <ArrowLeft />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Scroll left</TooltipContent>
    </Tooltip>
  );
};

TableScrollHandlerLeft.displayName = 'TableScrollHandlerLeft';

/** "Scroll right" control. Same pass-through contract as `TableScrollHandlerLeft`. */
export const TableScrollHandlerRight: FC<TableScrollHandlerRightProps> = ({
  onClick,
  disabled,
  'aria-label': ariaLabel,
  ...rest
}) => {
  const { atEnd, scrollRight } = useTableScrollStateContext();
  const isDisabled = disabled ?? atEnd;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    scrollRight();
  };

  return (
    <Tooltip disabled={isDisabled}>
      <TooltipTrigger asChild>
        <Button
          {...rest}
          type='button'
          variant='ghost'
          color='neutral'
          size='small'
          disabled={isDisabled}
          onClick={handleClick}
          aria-label={ariaLabel ?? 'Scroll right'}
        >
          <ArrowRight />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Scroll right</TooltipContent>
    </Tooltip>
  );
};

TableScrollHandlerRight.displayName = 'TableScrollHandlerRight';

export interface TableScrollHandlerProps {
  /**
   * Override the default controls — typically the exported
   * `TableScrollHandlerLeft` / `TableScrollHandlerRight` sub-components carrying
   * per-control analytics attributes. When omitted, both default controls
   * render.
   *
   * Render `<TableScrollHandler>` as a direct child of `<Table>` (like
   * `<TableActionBar>` / `<TableSettingsMenu>`). The DS portals it into the
   * scroll slot in the master column header and shows it only on horizontal
   * overflow — no column selection or manual positioning required.
   */
  children?: ReactNode;
}

export const TableScrollHandler: FC<TableScrollHandlerProps> = ({ children }) => {
  const { anchorNode } = useTableScrollHandlerContext();
  const { allLeafColumns, containerRef } = useTableContext();
  // Self-sufficient scroll state; works for both the default and consumer paths.
  const { atStart, atEnd } = useHorizontalScrollState(containerRef, true);

  // Visible non-pinned area width — computed at click time for accuracy.
  const getScrollPageSize = () => {
    const pinnedLeftWidth = allLeafColumns
      .filter(c => c.getIsPinned() === 'left')
      .reduce((sum, c) => sum + c.getSize(), 0);
    return Math.max((containerRef.current?.clientWidth ?? 0) - pinnedLeftWidth, 0);
  };

  const scrollLeft = () =>
    containerRef.current?.scrollBy({ left: -getScrollPageSize(), behavior: 'smooth' });
  const scrollRight = () =>
    containerRef.current?.scrollBy({ left: getScrollPageSize(), behavior: 'smooth' });

  // No anchor yet (master column not overflowing / not mounted) → render nothing.
  if (!anchorNode) return null;

  return createPortal(
    <TableScrollStateContext.Provider value={{ atStart, atEnd, scrollLeft, scrollRight }}>
      {children ?? (
        <>
          <TableScrollHandlerLeft />
          <TableScrollHandlerRight />
        </>
      )}
    </TableScrollStateContext.Provider>,
    anchorNode,
  );
};

TableScrollHandler.displayName = 'TableScrollHandler';
