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
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setKeepOpen(false), 2000);
    },
    [enabled, text],
  );

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return {
    isSupported: isClipboardSupported,
    copied,
    tooltipOpen,
    onTooltipOpenChange,
    handleCopy,
  };
}
