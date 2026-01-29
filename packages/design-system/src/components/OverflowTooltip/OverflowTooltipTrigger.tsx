import {
  type ComponentPropsWithRef,
  cloneElement,
  type FC,
  isValidElement,
  type ReactElement,
  type Ref,
  useEffect,
  useRef,
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
 * Checks for actual overflow by comparing scrollWidth/Height with clientWidth/Height.
 */
export const OverflowTooltipTrigger: FC<OverflowTooltipTriggerProps> = ({
  children,
  asChild = true,
  ref,
}) => {
  const { setIsOverflowing } = useOverflowTooltip();
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkOverflow = () => {
      // Check overflow only on the container itself
      const hasOverflow =
        container.scrollWidth > container.clientWidth ||
        container.scrollHeight > container.clientHeight;

      setIsOverflowing(hasOverflow);
    };

    // Initial check
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
  }, [setIsOverflowing]);

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

  return (
    <TooltipTrigger asChild={asChild}>
      {isValidElement(children)
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cloneElement<ComponentPropsWithRef<any>>(children, {
            ref: setRefs,
          })
        : children}
    </TooltipTrigger>
  );
};

OverflowTooltipTrigger.displayName = 'OverflowTooltipTrigger';
