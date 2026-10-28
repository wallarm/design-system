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

import { useComposedRefs } from '@radix-ui/react-compose-refs';

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

  const child = children as ReactElement<ComponentPropsWithRef<'span'>>;
  const setRefs = useComposedRefs(containerRef, ref, child.props.ref);

  const mergePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      handlePointerEnter();
      child.props.onPointerEnter?.(e);
    },
    [handlePointerEnter, child],
  );

  return (
    <TooltipTrigger asChild={asChild}>
      {isValidElement(children)
        ? cloneElement<ComponentPropsWithRef<'span'>>(child, {
            ref: setRefs,
            onPointerEnter: mergePointerEnter,
          })
        : children}
    </TooltipTrigger>
  );
};

OverflowTooltipTrigger.displayName = 'OverflowTooltipTrigger';
