import type { FC } from 'react';
import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronUp } from '../../../icons/ChevronUp';
import { Button } from '../../Button';
import { MIN_HIDDEN_LINES_THRESHOLD } from '../CodeSnippetContext';
import { useCodeSnippet } from '../hooks';

export const ShowMoreButton: FC = () => {
  const { displayItems, maxLines, isExpanded, setIsExpanded } = useCodeSnippet();

  const hiddenLines = displayItems.length - maxLines;

  if (maxLines <= 0 || hiddenLines < MIN_HIDDEN_LINES_THRESHOLD) return null;

  return (
    <div data-slot='code-snippet-show-more' className='flex h-36 items-center justify-center px-6'>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        fullWidth
        onClick={() => setIsExpanded(!isExpanded)}
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

ShowMoreButton.displayName = 'ShowMoreButton';
