import type { FC, MouseEventHandler, Ref } from 'react';
import { Maximize } from '../../icons/Maximize';
import { Minimize } from '../../icons/Minimize';
import { Button, type ButtonProps } from '../Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useCodeSnippet } from './hooks';

export type CodeSnippetFullscreenButtonProps = Omit<ButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

export const CodeSnippetFullscreenButton: FC<CodeSnippetFullscreenButtonProps> = ({
  onClick,
  ref,
  ...props
}) => {
  const { isFullscreen, setIsFullscreen } = useCodeSnippet();

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    event.stopPropagation();
    setIsFullscreen(!isFullscreen);
    onClick?.(event);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          variant='ghost'
          color='neutral'
          size='small'
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          {...props}
          onClick={handleClick}
        >
          {isFullscreen ? <Minimize /> : <Maximize />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</TooltipContent>
    </Tooltip>
  );
};

CodeSnippetFullscreenButton.displayName = 'CodeSnippetFullscreenButton';
