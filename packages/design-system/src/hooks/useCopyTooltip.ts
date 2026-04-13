import { useCallback, useEffect, useRef, useState } from 'react';
import { copyText } from '../utils/copyText';

interface UseCopyTooltipOptions {
  text: string;
  enabled?: boolean;
}

interface UseCopyTooltipReturn {
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
      if (!enabled) return;
      copyText(text);
      setCopied(true);
      setKeepOpen(true);
      clearTimer();
      timerRef.current = setTimeout(() => {
        setKeepOpen(false);
        setCopied(false);
      }, 2000);
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
      setCopied(false);
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
    copied,
    tooltipOpen,
    onTooltipOpenChange,
    handleCopy,
  };
}
