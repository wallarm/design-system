import type { FC, ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import { TabsTrigger } from '../Tabs';

export type CodeSnippetTabProps = {
  value: string;
  disabled?: boolean;
  children: ReactNode;
};

export const CodeSnippetTab: FC<CodeSnippetTabProps> = ({ value, disabled, children }) => {
  const testId = useTestId('tab');

  return (
    <TabsTrigger value={value} disabled={disabled} data-testid={testId}>
      {children}
    </TabsTrigger>
  );
};

CodeSnippetTab.displayName = 'CodeSnippetTab';
