import type { FC, MouseEventHandler, Ref } from 'react';
import { useEffect } from 'react';
import { useCopyToClipboard } from '../../hooks';
import { Copy } from '../../icons/Copy';
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
  const { code } = useCodeSnippet();
  const { copied, copy, reset, isSupported } = useCopyToClipboard();

  useEffect(() => {
    if (!copied || typeof document === 'undefined') return;

    const handleClickOutside = () => reset();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [copied, reset]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    event.stopPropagation();
    copy(code);
    onClick?.(event);
  };

  if (!isSupported) return null;

  return (
    <Tooltip open={copied || undefined}>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          variant='ghost'
          color='neutral'
          size='small'
          aria-label='Copy code'
          {...props}
          onClick={handleClick}
        >
          <Copy />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied' : 'Click to copy'}</TooltipContent>
    </Tooltip>
  );
};

CodeSnippetCopyButton.displayName = 'CodeSnippetCopyButton';
