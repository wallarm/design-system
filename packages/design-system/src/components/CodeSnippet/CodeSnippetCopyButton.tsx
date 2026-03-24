import type { FC, MouseEventHandler, Ref } from 'react';
import { useCopyTooltip } from '../../hooks';
import { Check, Copy } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useCodeSnippet } from './hooks';

export type CodeSnippetCopyButtonProps = Omit<ButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

export const CodeSnippetCopyButton: FC<CodeSnippetCopyButtonProps> = ({
  onClick,
  ref,
  ...props
}) => {
  const testId = useTestId('copy-button');
  const { code } = useCodeSnippet();
  const { isSupported, copied, tooltipOpen, onTooltipOpenChange, handleCopy } = useCopyTooltip({
    text: code,
  });

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    handleCopy(event);
    onClick?.(event);
  };

  if (!isSupported) return null;

  return (
    <Tooltip open={tooltipOpen} onOpenChange={onTooltipOpenChange} closeOnPointerDown={false}>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Copy code'
          data-testid={testId}
          {...props}
          onClick={handleClick}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : 'Click to copy'}</TooltipContent>
    </Tooltip>
  );
};

CodeSnippetCopyButton.displayName = 'CodeSnippetCopyButton';
