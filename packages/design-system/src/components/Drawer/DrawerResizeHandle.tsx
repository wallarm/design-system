import {
  type ButtonHTMLAttributes,
  type FC,
  type MouseEvent as ReactMouseEvent,
  type Ref,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';
import { throttle } from '../../utils/throttle';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useDrawerContext } from './DrawerContext';

const drawerResizeHandleVariants = cva(
  cn(
    'absolute left-0 top-0 bottom-0 z-1',
    '-translate-x-1/2',
    'w-12 py-12',
    'outline-none cursor-col-resize',
    'flex items-center justify-center',

    // pseudo-element (resize bar)
    'before:content-[""]',
    'before:block',
    'before:w-3 before:h-full',
    'before:rounded-full',
    'before:bg-bg-fill-brand',
    'before:transition-opacity before:duration-150',
  ),
  {
    variants: {
      barIsVisible: {
        true: 'before:opacity-100',
        false: 'before:opacity-0',
      },
    },
  },
);

interface DrawerResizeHandleCoordinates {
  startX: number;
  startWidth: number;
  currentWidth: number;
}

export interface DrawerResizeHandleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color' | 'value'>,
    TestableProps {
  ref?: Ref<HTMLButtonElement>;
  /**
   * A real `<button>`'s `value` DOM property is always a string at runtime;
   * the wider `string | number | readonly string[]` union on
   * `ButtonHTMLAttributes` only exists because that interface is shared with
   * `<input>`/`<select>`. Narrowed here to match Ark UI's `TooltipTrigger`
   * (which types `value` as `string | undefined` for its trigger-identity
   * feature) so this prop object can be spread onto it without widening or
   * dropping the field.
   */
  value?: string;
  /** Fired when the user starts dragging the resize handle. */
  onResizeStart?: () => void;
  /** Fired when the user releases the resize handle, with the final pixel width. */
  onResizeEnd?: (width: number) => void;
}

export const DrawerResizeHandle: FC<DrawerResizeHandleProps> = ({
  ref,
  'data-testid': testIdProp,
  onResizeStart,
  onResizeEnd,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  className,
  ...rest
}) => {
  const { setWidth, setIsResizing, minWidth, maxWidth } = useDrawerContext();
  const testId = useTestId('resize-handle', testIdProp);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStateRef = useRef<DrawerResizeHandleCoordinates>({
    startX: 0,
    startWidth: 0,
    currentWidth: 0,
  });

  // Avoid stale closures: useEffect's mouseup handler must see the latest callback.
  const onResizeEndRef = useRef(onResizeEnd);
  useEffect(() => {
    onResizeEndRef.current = onResizeEnd;
  }, [onResizeEnd]);

  const handleMouseEnter = (e: ReactMouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(e);
    if (e.defaultPrevented) return;
    setIsHovered(true);
  };

  const handleMouseLeave = (e: ReactMouseEvent<HTMLButtonElement>) => {
    onMouseLeave?.(e);
    if (e.defaultPrevented) return;
    setIsHovered(false);
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLButtonElement>) => {
    onMouseDown?.(e);
    if (e.defaultPrevented) return;

    e.preventDefault();

    const drawerContent = e.currentTarget.closest('[role="dialog"]') as HTMLElement | null;
    if (!drawerContent) return;

    const currentWidth = drawerContent.offsetWidth;

    dragStateRef.current = {
      startX: e.clientX,
      startWidth: currentWidth,
      currentWidth,
    };

    setIsDragging(true);
    setIsResizing(true);
    onResizeStart?.();
  };

  // Throttled mouse move handler - memoized to prevent recreation
  const handleMouseMove = useMemo(
    () =>
      throttle((e: MouseEvent) => {
        const { startX, startWidth } = dragStateRef.current;
        // Moving left increases width, moving right decreases
        const delta = startX - e.clientX;
        const newWidth = Math.min(Math.max(startWidth + delta, minWidth), maxWidth);
        setWidth(newWidth);
        dragStateRef.current.currentWidth = newWidth;
      }, 16), // ~60fps
    [minWidth, maxWidth, setWidth],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      handleMouseMove.cancel();
      onResizeEndRef.current?.(dragStateRef.current.currentWidth);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      handleMouseMove.cancel();
    };
  }, [isDragging, handleMouseMove, setIsResizing]);

  const barIsVisible = isHovered || isDragging;

  return (
    <Tooltip positioning={{ placement: 'left' }} open={isHovered && !isDragging}>
      <TooltipTrigger
        {...rest}
        ref={ref}
        data-slot='resize-handle'
        data-resizing={isDragging || undefined}
        data-testid={testId}
        className={cn(drawerResizeHandleVariants({ barIsVisible }), className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
      />

      <TooltipContent>Drag to resize</TooltipContent>
    </Tooltip>
  );
};

DrawerResizeHandle.displayName = 'DrawerResizeHandle';
