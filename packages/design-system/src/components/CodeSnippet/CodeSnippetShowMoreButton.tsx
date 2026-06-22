import type { FC, MouseEventHandler, Ref } from 'react';
import { ChevronDown } from '../../icons/ChevronDown';
import { ChevronUp } from '../../icons/ChevronUp';
import { Button, type ButtonProps } from '../Button';
import { MIN_HIDDEN_LINES_THRESHOLD } from './CodeSnippetContext';
import { useCodeSnippet } from './hooks';

export type CodeSnippetShowMoreButtonProps = Omit<ButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

/**
 * Optional explicit show-more control for snippets with `maxLines`.
 * Do not render this for ordinary collapsed snippets; `CodeSnippetRoot`
 * auto-renders the default control. Render it as a direct child only when
 * consumer props must reach the real button.
 */
export const CodeSnippetShowMoreButton: FC<CodeSnippetShowMoreButtonProps> = ({
  onClick,
  ref,
  ...props
}) => {
  const { displayItems, maxLines, isExpanded, setIsExpanded } = useCodeSnippet();

  const hiddenLines = displayItems.length - maxLines;

  if (maxLines <= 0 || hiddenLines < MIN_HIDDEN_LINES_THRESHOLD) return null;

  const handleClick: MouseEventHandler<HTMLButtonElement> = event => {
    setIsExpanded(!isExpanded);
    onClick?.(event);
  };

  return (
    <div data-slot='code-snippet-show-more' className='flex h-36 items-center justify-center px-6'>
      <Button
        ref={ref}
        variant='ghost'
        color='neutral'
        size='small'
        fullWidth
        {...props}
        onClick={handleClick}
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp />
          </>
        ) : (
          <>
            Show more ({hiddenLines} lines)
            <ChevronDown />
          </>
        )}
      </Button>
    </div>
  );
};

CodeSnippetShowMoreButton.displayName = 'CodeSnippetShowMoreButton';
