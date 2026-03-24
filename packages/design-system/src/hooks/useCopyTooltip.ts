import { useCallback, useEffect, useRef, useState } from 'react';

const isClipboardSupported =
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard !== 'undefined' &&
  typeof navigator.clipboard.writeText === 'function';

interface UseCopyTooltipOptions {
  text: string;
  enabled?: boolean;
}

interface UseCopyTooltipReturn {
  isSupported: boolean;
  copied: boolean;
  tooltipOpen: boolean;
  onTooltipOpenChange: (open: boolean) => void;
  handleCopy: (event: { stopPropagation: () => void }) => void;
}

export function useCopyTooltip({
  text,
  enabled = true,
}: UseCopyTooltipOptions): UseCopyTooltipReturn {
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const tooltipOpen = hovering || keepOpen;

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  const onTooltipOpenChange = useCallback(
    (open: boolean) => {
      setHovering(open);
      if (open && copied) {
        setCopied(false);
      }
    },
    [copied],
  );

  const handleCopy = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      if (!enabled || !isClipboardSupported) return;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setKeepOpen(true);
      clearTimer();
      timerRef.current = setTimeout(() => setKeepOpen(false), 2000);
    },
    [enabled, text, clearTimer],
  );

  // Dismiss "Copied" tooltip on click outside.
  // Registered on next frame so the triggering pointerdown doesn't fire it.
  useEffect(() => {
    if (!keepOpen) return;
    let listenerAdded = false;
    const dismiss = () => {
      setKeepOpen(false);
      clearTimer();
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
  }, [keepOpen, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    isSupported: isClipboardSupported,
    copied,
    tooltipOpen,
    onTooltipOpenChange,
    handleCopy,
  };
}
