import { Bell, ChevronUpDown } from '../../../icons';
import { Button } from '../../Button';
import { Code } from '../../Code';
import { Kbd } from '../../Kbd';
import { Text } from '../../Text';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { TopHeaderSeparator } from '../../TopHeader';
import { QuickHelpDropdown } from './_storyQuickHelpDropdown';

export const HeaderActions = () => (
  <>
    <Button variant='ghost' size='small' color='neutral' className='p-4 gap-6 rounded-6'>
      <Code size='s' color='secondary'>
        Search Wallarm
      </Code>
      <Kbd size='xsmall'>⌘ K</Kbd>
    </Button>

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
