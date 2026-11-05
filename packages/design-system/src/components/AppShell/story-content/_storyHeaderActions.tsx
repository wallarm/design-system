import type { ReactNode } from 'react';
import { ChevronUpDown } from '../../../icons';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { Text } from '../../Text';
import { TopHeaderSeparator } from '../../TopHeader';
import { NotificationsInbox } from './_storyNotificationsInbox';
import { QuickHelpDropdown } from './_storyQuickHelpDropdown';
import { StorySearchModal } from './_storySearchModal';

interface HeaderActionsProps {
  /** Rendered before the notifications bell — where the host puts its AI Assistant toggle. */
  assistantToggle?: ReactNode;
}

export const HeaderActions = ({ assistantToggle }: HeaderActionsProps) => (
  <>
    <StorySearchModal />

    <TopHeaderSeparator />

    <Button variant='ghost' size='small' color='neutral' className='py-4 rounded-6'>
      <Text size='xs' weight='medium'>
        Tenant Name
      </Text>
      <span className='text-text-tertiary mx-[-2px]'>•</span>
      <Code size='s' color='secondary'>
        12345
      </Code>
      <ChevronUpDown className='!icon-sm' />
    </Button>

    {assistantToggle}

    <NotificationsInbox />

    <QuickHelpDropdown />
  </>
);
