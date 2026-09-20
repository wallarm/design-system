import {
  type FC,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { CopyableProvider } from './CopyableContext';

export interface CopyableProps {
  /** The text to copy to the clipboard. */
  text: string;
  /**
   * Show a tooltip with copy feedback.
   *
   * - `true`  — "Click to copy" / "Copied"
   * - `string` — custom idle text; copied text stays "Copied"
   * - `{ idle: string; copied: string }` — fully custom tooltip text
   */
  tooltip?: boolean | string | { idle: string; copied: string };
  /** Fired after a successful copy. Use for toast feedback. */
  onCopied?: () => void;
  /** Time in ms before the `copied` state resets (default: 2000). */
  resetDelay?: number;
  children: ReactNode;
}

/**
 * Headless click-to-copy behaviour wrapper.
 *
 * Renders **no DOM node of its own** — it injects an `onClick` handler onto
 * its child via `@radix-ui/react-slot` and exposes a `copied` flag through
 * React context so descendants like `<CopyableIcon>` and `<CopyableLabel>`
 * can react to the copy state.
 *
 * @example
 * ```tsx
 * <Copyable text={value} tooltip>
 *   <Button variant="ghost" size="small">
 *     <CopyableIcon />
 *   </Button>
 * </Copyable>
 * ```
 */
export const Copyable: FC<CopyableProps> = ({
  text,
  tooltip,
  onCopied,
  resetDelay = 2000,
  children,
}) => {
  const { copied, copy } = useCopyToClipboard(resetDelay);

  // --- tooltip state (same logic as the former useCopyTooltip) ---
  const [hovering, setHovering] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const keepOpenTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const tooltipOpen = hovering || keepOpen;

  const handleClick = useCallback(
    (_event: MouseEvent) => {
      copy(text);
      onCopied?.();

      if (tooltip) {
        setKeepOpen(true);
        clearTimeout(keepOpenTimerRef.current);
        keepOpenTimerRef.current = setTimeout(() => {
          setKeepOpen(false);
        }, resetDelay);
      }
    },
    [copy, text, onCopied, tooltip, resetDelay],
  );

  const handleTooltipOpenChange = useCallback((open: boolean) => {
    setHovering(open);
  }, []);

  // Dismiss "Copied" tooltip on pointerdown outside.
  // Registered on the next frame so the triggering pointerdown doesn't fire it.
  useEffect(() => {
    if (!keepOpen) return;

    let listenerAdded = false;
    const dismiss = () => {
      setKeepOpen(false);
      clearTimeout(keepOpenTimerRef.current);
    };
    const frame = requestAnimationFrame(() => {
      document.addEventListener('pointerdown', dismiss);
      listenerAdded = true;
    });

    return () => {
      cancelAnimationFrame(frame);
      if (listenerAdded) {
        document.removeEventListener('pointerdown', dismiss);
      }
    };
  }, [keepOpen]);

  // --- resolve tooltip text ---
  const tooltipIdle =
    typeof tooltip === 'string'
      ? tooltip
      : typeof tooltip === 'object'
        ? tooltip.idle
        : 'Click to copy';
  const tooltipCopied = typeof tooltip === 'object' ? tooltip.copied : 'Copied';

  const ctx = useMemo(() => ({ copied }), [copied]);

  const slotted = <Slot onClick={handleClick}>{children}</Slot>;

  if (!tooltip) {
    return <CopyableProvider value={ctx}>{slotted}</CopyableProvider>;
  }

  return (
    <CopyableProvider value={ctx}>
      <Tooltip open={tooltipOpen} onOpenChange={handleTooltipOpenChange} closeOnPointerDown={false}>
        <TooltipTrigger asChild>{slotted}</TooltipTrigger>
        <TooltipContent>{copied ? tooltipCopied : tooltipIdle}</TooltipContent>
      </Tooltip>
    </CopyableProvider>
  );
};

Copyable.displayName = 'Copyable';
