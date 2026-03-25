import type { FC, ReactNode } from 'react';
import { useTestId } from '../../utils/testId';
import { Tabs, TabsList } from '../Tabs';

export type CodeSnippetTabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
};

export const CodeSnippetTabs: FC<CodeSnippetTabsProps> = ({
  value,
  defaultValue,
  onValueChange,
  children,
}) => {
  const testId = useTestId('tabs');

  return (
    <Tabs
      size='small'
      variant='grayscale'
      value={value}
      defaultValue={defaultValue}
      onChange={onValueChange}
      lazyMount={false}
      unmountOnExit={false}
      data-testid={testId}
    >
      <TabsList className='pl-8 pr-0 border-b-0 [&_[data-part=indicator]]:bottom-0'>
        {children}
      </TabsList>
    </Tabs>
  );
};

CodeSnippetTabs.displayName = 'CodeSnippetTabs';
