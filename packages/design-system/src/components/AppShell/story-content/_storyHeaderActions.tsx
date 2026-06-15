import { Bell, ChevronUpDown } from '../../../icons';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { Text } from '../../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { TopHeaderSeparator } from '../../TopHeader';
import { QuickHelpDropdown } from './_storyQuickHelpDropdown';
import { SearchModal } from './_storySearchModal';

export const HeaderActions = () => (
  <>
    <SearchModal />

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
