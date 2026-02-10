import type { FC, MouseEvent, Ref } from 'react';
import { WrapText } from '../../icons/WrapText';
import { ToggleButton, type ToggleButtonProps } from '../ToggleButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { useCodeSnippet } from './hooks';

export type CodeSnippetWrapButtonProps = Omit<ToggleButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

export const CodeSnippetWrapButton: FC<CodeSnippetWrapButtonProps> = ({
  onToggle,
  ref,
  ...props
}) => {
  const { wrapLines, setWrapLines } = useCodeSnippet();

  const handleToggle = (active: boolean, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setWrapLines(active);
    onToggle?.(active, event);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ToggleButton
          ref={ref}
          variant='ghost'
          color='neutral'
          size='small'
          active={wrapLines}
          aria-label='Toggle line wrapping'
          {...props}
          onToggle={handleToggle}
        >
          <WrapText />
        </ToggleButton>
      </TooltipTrigger>
      <TooltipContent>{wrapLines ? 'Unwrap lines' : 'Wrap lines'}</TooltipContent>
    </Tooltip>
  );
};

CodeSnippetWrapButton.displayName = 'CodeSnippetWrapButton';
