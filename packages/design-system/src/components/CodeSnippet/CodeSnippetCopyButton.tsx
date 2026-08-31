import type { FC, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import type { ButtonProps } from '../Button';
import { CopyButton } from '../CopyButton';
import { useCodeSnippet } from './hooks';

export type CodeSnippetCopyButtonProps = Omit<ButtonProps, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
};

export const CodeSnippetCopyButton: FC<CodeSnippetCopyButtonProps> = ({ ref, ...props }) => {
  const testId = useTestId('copy-button');
  const { code } = useCodeSnippet();

  return (
    <CopyButton
      ref={ref}
      text={code}
      size='small'
      aria-label='Copy code'
      data-testid={testId}
      {...props}
    />
  );
};

CodeSnippetCopyButton.displayName = 'CodeSnippetCopyButton';
