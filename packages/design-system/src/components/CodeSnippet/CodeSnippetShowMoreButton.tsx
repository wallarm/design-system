import type { FC, MouseEventHandler, Ref } from 'react';
import { ChevronDown } from '../../icons/ChevronDown';
import { ChevronUp } from '../../icons/ChevronUp';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { MIN_HIDDEN_LINES_THRESHOLD } from './CodeSnippetContext';
import { useCodeSnippetChrome } from './hooks';

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
  const testId = useTestId('show-more-button');
  const { maxLines, isExpanded, setIsExpanded, hiddenLineCount } = useCodeSnippetChrome();

  if (maxLines <= 0 || hiddenLineCount < MIN_HIDDEN_LINES_THRESHOLD) return null;

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
        data-testid={testId}
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
            Show more ({hiddenLineCount} lines)
            <ChevronDown />
          </>
        )}
      </Button>
    </div>
  );
};

CodeSnippetShowMoreButton.displayName = 'CodeSnippetShowMoreButton';
