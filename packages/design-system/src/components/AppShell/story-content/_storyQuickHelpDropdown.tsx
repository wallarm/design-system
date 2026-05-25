import {
  Activity,
  Book,
  CircleHelp,
  LifeBuoy,
  NotebookText,
  SquareArrowOutUpRight,
} from '../../../icons';
import { Button } from '../../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../DropdownMenu';
import { Text } from '../../Text';

export const QuickHelpDropdown = () => (
  <DropdownMenu positioning={{ placement: 'bottom-end', gutter: 4 }}>
    <DropdownMenuTrigger asChild>
      <Button variant='ghost' size='small' color='neutral' aria-label='Quick Help'>
        <CircleHelp />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent className='w-320'>
      <DropdownMenuItem onSelect={() => window.open('https://docs.wallarm.com/', '_blank')}>
        <DropdownMenuItemIcon>
          <Book />
        </DropdownMenuItemIcon>

        <DropdownMenuItemContent>
          <DropdownMenuItemText>Documentation</DropdownMenuItemText>
          <Text size='xs' color='secondary'>
            Setup, deployment, and how-tos
          </Text>
        </DropdownMenuItemContent>
      </DropdownMenuItem>

      <DropdownMenuItem onSelect={() => window.open('https://status.wallarm.com/', '_blank')}>
        <DropdownMenuItemIcon>
          <Activity />
        </DropdownMenuItemIcon>

        <DropdownMenuItemContent>
          <DropdownMenuItemText>Service status</DropdownMenuItemText>
          <Text size='xs' color='secondary'>
            Live uptime and alerts
          </Text>
        </DropdownMenuItemContent>
      </DropdownMenuItem>

      <DropdownMenuItem onSelect={() => window.open('mailto:support@wallarm.com')}>
        <DropdownMenuItemIcon>
          <LifeBuoy />
        </DropdownMenuItemIcon>

        <DropdownMenuItemContent>
          <DropdownMenuItemText>Support</DropdownMenuItemText>
          <Text size='xs' color='secondary'>
            Talk to our team
          </Text>
        </DropdownMenuItemContent>
      </DropdownMenuItem>

      <DropdownMenuItem onSelect={() => window.open('https://lab.wallarm.com', '_blank')}>
        <DropdownMenuItemIcon>
          <NotebookText />
        </DropdownMenuItemIcon>

        <DropdownMenuItemContent>
          <DropdownMenuItemText>Blog</DropdownMenuItemText>
          <Text size='xs' color='secondary'>
            Security news and updates
          </Text>
        </DropdownMenuItemContent>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onSelect={() => window.open('https://playground.wallarm.com', '_blank')}>
        <DropdownMenuItemIcon>
          <SquareArrowOutUpRight />
        </DropdownMenuItemIcon>

        <DropdownMenuItemContent>
          <DropdownMenuItemText>Wallarm Playground</DropdownMenuItemText>
          <Text size='xs' color='secondary'>
            Try the platform without any setup
          </Text>
        </DropdownMenuItemContent>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
