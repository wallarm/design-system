import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { TabsTrigger, type TabsTriggerProps } from '../Tabs/TabsTrigger';

export type CodeSnippetTabProps = TabsTriggerProps;

export const CodeSnippetTab: FC<CodeSnippetTabProps> = ({ 'data-testid': testIdProp, ...rest }) => {
  const testId = useTestId('tab', testIdProp);

  return <TabsTrigger {...rest} data-testid={testId} />;
};

CodeSnippetTab.displayName = 'CodeSnippetTab';
