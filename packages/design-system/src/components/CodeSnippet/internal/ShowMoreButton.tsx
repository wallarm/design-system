import type { FC } from 'react';
import { ChevronDown } from '../../../icons/ChevronDown';
import { ChevronUp } from '../../../icons/ChevronUp';
import { Button } from '../../Button';
import { useCodeSnippet } from '../hooks';

export const ShowMoreButton: FC = () => {
  const { code, tokens, maxLines, isExpanded, setIsExpanded } = useCodeSnippet();

  const totalLines = tokens?.length ?? code.split('\n').length;
  const hiddenLines = totalLines - maxLines;

  if (maxLines <= 0 || hiddenLines <= 0) return null;

  return (
    <div data-slot='code-snippet-show-more' className='flex h-36 items-center justify-center'>
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
