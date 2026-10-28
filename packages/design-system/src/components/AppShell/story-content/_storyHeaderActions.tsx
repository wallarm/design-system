import type { ReactNode } from 'react';

import { Bell, ChevronUpDown } from '../../../icons';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { Text } from '../../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { TopHeaderSeparator } from '../../TopHeader';
import { QuickHelpDropdown } from './_storyQuickHelpDropdown';
import { StorySearchModal } from './_storySearchModal';

interface HeaderActionsProps {
  /** Rendered before the updates bell — where the host puts its AI Assistant toggle. */
  assistantToggle?: ReactNode;
}

export const HeaderActions = ({ assistantToggle }: HeaderActionsProps) => (
  <>
    <StorySearchModal />

    <TopHeaderSeparator />

    <Button variant='ghost' size='small' color='neutral' className='rounded-6 py-4'>
      <Text size='xs' weight='medium'>
        Tenant Name
      </Text>
      <span className='mx-[-2px] text-text-tertiary'>•</span>
      <Code size='s' color='secondary'>
        12345
      </Code>
      <ChevronUpDown className='!icon-sm' />
    </Button>

    {assistantToggle}

    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant='ghost' size='small' color='neutral' aria-label='Wallarm Updates'>
          <Bell />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Wallarm updates</TooltipContent>
    </Tooltip>

    <QuickHelpDropdown />
  </>
);
