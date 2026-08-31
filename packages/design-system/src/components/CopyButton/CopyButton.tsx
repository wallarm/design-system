import {
  type FC,
  type MouseEventHandler,
  type Ref,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useCopyTooltip } from '../../hooks';
import { Check, Copy } from '../../icons';
import { mergeRefs } from '../../utils/mergeRefs';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

export interface CopyButtonProps extends Omit<ButtonProps, 'children'> {
  /** Text to copy to clipboard */
  text: string;
  /** Label shown next to the icon (omit for icon-only) */
  label?: string;
  /** Label shown in the copied state (defaults to "Copied") */
  copiedLabel?: string;
  /** Tooltip text in idle state (defaults to "Click to copy") */
  tooltipText?: string;
  /** Tooltip text after copy (defaults to "Copied") */
  copiedTooltipText?: string;
  ref?: Ref<HTMLButtonElement>;
}

export const CopyButton: FC<CopyButtonProps> = ({
  text,
  label,
  copiedLabel = 'Copied',
  tooltipText = 'Click to copy',
  copiedTooltipText = 'Copied',
  onClick,
  variant = 'ghost',
  color = 'neutral',
  size,
  style,
  ref,
  ...props
}) => {
  const { copied, tooltipOpen, onTooltipOpenChange, handleCopy } = useCopyTooltip({ text });

  const innerRef = useRef<HTMLButtonElement>(null);
  const [minWidth, setMinWidth] = useState<number | undefined>(undefined);

  // Capture idle width so switching to the copied label doesn't cause layout shift
  useLayoutEffect(() => {
    if (label && !copied && innerRef.current) {
      setMinWidth(innerRef.current.offsetWidth);
    }
  }, [label, copied]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    handleCopy();
    onClick?.(event);
  };

  const resolvedSize = size ?? (label ? 'medium' : 'small');
  const icon = copied ? <Check /> : <Copy />;

  return (
    <Tooltip open={tooltipOpen} onOpenChange={onTooltipOpenChange} closeOnPointerDown={false}>
      <TooltipTrigger asChild>
        <Button
          ref={mergeRefs(innerRef, ref)}
          variant={variant}
          color={color}
          size={resolvedSize}
          aria-label={label ?? 'Copy'}
          data-slot='copy-button'
          {...props}
          onClick={handleClick}
          style={label && minWidth ? { minWidth, ...style } : style}
        >
          {icon}
          {label && <span>{copied ? copiedLabel : label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? copiedTooltipText : tooltipText}</TooltipContent>
    </Tooltip>
  );
};

CopyButton.displayName = 'CopyButton';
