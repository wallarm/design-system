import {
  type ComponentPropsWithRef,
  cloneElement,
  type FC,
  isValidElement,
  type ReactElement,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { TooltipTrigger } from '../Tooltip';
import { useOverflowTooltip } from './OverflowTooltipContext';

export interface OverflowTooltipTriggerProps {
  children: ReactElement;
  asChild?: boolean;
  ref?: Ref<HTMLElement>;
}

/**
 * Trigger component that automatically detects overflow in the element.
 * Observers are created lazily on pointer enter for performance —
 * avoids hundreds of ResizeObserver/MutationObserver instances in virtualized lists.
 */
export const OverflowTooltipTrigger: FC<OverflowTooltipTriggerProps> = ({
  children,
  asChild = true,
  ref,
}) => {
  const { setIsOverflowing } = useOverflowTooltip();
  const containerRef = useRef<HTMLElement>(null);
  const [activated, setActivated] = useState(false);

  const handlePointerEnter = useCallback(() => {
    setActivated(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !activated) return;

    const checkOverflow = () => {
      const hasOverflow =
        container.scrollWidth > container.clientWidth ||
        container.scrollHeight > container.clientHeight;

      setIsOverflowing(hasOverflow);
    };

    // Immediate check on activation
    checkOverflow();

    // Setup ResizeObserver for container only
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(container);

    // Setup MutationObserver to watch for content changes
    const mutationObserver = new MutationObserver(checkOverflow);

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [activated, setIsOverflowing]);

  const setRefs = (node: HTMLElement) => {
    containerRef.current = node;
    // Forward ref if provided
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as { current: HTMLElement | null }).current = node;
      }
    }
    // Preserve original ref if it exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalRef = (children as ComponentPropsWithRef<any>).ref;
    if (originalRef) {
      if (typeof originalRef === 'function') {
        originalRef(node);
      } else {
        // eslint-disable-next-line react-hooks/immutability
        originalRef.current = node;
      }
    }
  };

  const mergePointerEnter = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      handlePointerEnter();
      (children as ComponentPropsWithRef<any>).props?.onPointerEnter?.(e);
    },
    [handlePointerEnter, children],
  );

  return (
    <TooltipTrigger asChild={asChild}>
      {isValidElement(children)
        ? cloneElement<ComponentPropsWithRef<any>>(children, {
            ref: setRefs,
            onPointerEnter: mergePointerEnter,
          })
        : children}
    </TooltipTrigger>
  );
};

OverflowTooltipTrigger.displayName = 'OverflowTooltipTrigger';
