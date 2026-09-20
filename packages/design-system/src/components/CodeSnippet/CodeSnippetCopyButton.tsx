import type { FC, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { Copyable, CopyableIcon } from '../Copyable';
import { useCodeSnippet } from './hooks';

export type CodeSnippetCopyButtonProps = Omit<ButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

export const CodeSnippetCopyButton: FC<CodeSnippetCopyButtonProps> = ({ ref, ...props }) => {
  const testId = useTestId('copy-button');
  const { code } = useCodeSnippet();

  return (
    <Copyable text={code} tooltip>
      <Button
        ref={ref}
        variant='ghost'
        color='neutral'
        size='small'
        aria-label='Copy code'
        data-testid={testId}
        {...props}
      >
        <CopyableIcon />
      </Button>
    </Copyable>
  );
};

CodeSnippetCopyButton.displayName = 'CodeSnippetCopyButton';
