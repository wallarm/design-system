import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ChevronDown, CircleDashed } from '../../icons';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { NumericBadge } from '../NumericBadge';
import { HStack, VStack } from '../Stack';
import { SplitButton } from './SplitButton';

const DESCRIPTION = [
  'Pairs one action with a menu of related ones, for when a second action matters enough that burying it in a `DropdownMenu` would hide it.',
  'Both halves are ordinary `Button`s, so they must share a variant, colour and size — the group only joins their facing corners.',
].join(' ');

const meta = {
  title: 'Actions/SplitButton',
  component: SplitButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof SplitButton>;

export default meta;

/**
 * The two halves are plain `Button` children. `SplitButton` strips their facing corners and
 * gives the pair a `role='group'` so it reads as one control.
 */
export const Default: StoryFn<typeof meta> = () => (
  <SplitButton data-testid='split-button'>
    <Button variant='primary' color='brand'>
      Button
    </Button>
    <Button variant='primary' color='brand'>
      <ChevronDown />
    </Button>
  </SplitButton>
);

/**
 * Every sanctioned pairing, and the reason the pair must match: outline buttons drop the
 * gap and overlap their borders into a single hairline, which only looks right when both halves
 * carry the same variant.
 */
export const Variants: StoryFn<typeof meta> = () => (
  <VStack>
    <span className='sb-annotation'>Primary / Brand</span>
    <HStack>
      <SplitButton>
        <Button variant='primary' color='brand'>
          Button
        </Button>
        <Button variant='primary' color='brand'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Outline / Neutral</span>
    <HStack>
      <SplitButton>
        <Button variant='outline' color='neutral'>
          Button
        </Button>
        <Button variant='outline' color='neutral'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Secondary / Neutral</span>
    <HStack>
      <SplitButton>
        <Button variant='secondary' color='neutral'>
          Button
        </Button>
        <Button variant='secondary' color='neutral'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Ghost / Neutral</span>
    <HStack>
      <SplitButton>
        <Button variant='ghost' color='neutral'>
          Button
        </Button>
        <Button variant='ghost' color='neutral'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Secondary / Brand</span>
    <HStack>
      <SplitButton>
        <Button variant='secondary' color='brand'>
          Button
        </Button>
        <Button variant='secondary' color='brand'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Ghost / Brand</span>
    <HStack>
      <SplitButton>
        <Button variant='ghost' color='brand'>
          Button
        </Button>
        <Button variant='ghost' color='brand'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation sb-annotation-alt'>Ghost / Neutral Alt</span>
    <div className='flex flex-col gap-16 rounded-lg bg-component-tooltip-bg p-8'>
      <HStack>
        <SplitButton>
          <Button variant='ghost' color='neutral-alt'>
            Button
          </Button>
          <Button variant='ghost' color='neutral-alt'>
            <ChevronDown />
          </Button>
        </SplitButton>
      </HStack>
    </div>

    <span className='sb-annotation sb-annotation-alt'>Secondary / Neutral Alt</span>
    <div className='flex flex-col gap-16 rounded-lg bg-component-tooltip-bg p-8'>
      <HStack>
        <SplitButton>
          <Button variant='secondary' color='neutral-alt'>
            Button
          </Button>
          <Button variant='secondary' color='neutral-alt'>
            <ChevronDown />
          </Button>
        </SplitButton>
      </HStack>
    </div>
  </VStack>
);

/**
 * Both halves take the same `size`, since the group aligns them rather than sizing them.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <HStack align='end' justify='center'>
    <SplitButton>
      <Button variant='primary' color='brand' size='small'>
        Small
      </Button>
      <Button variant='primary' color='brand' size='small'>
        <ChevronDown />
      </Button>
    </SplitButton>
    <SplitButton>
      <Button variant='primary' color='brand' size='medium'>
        Medium
      </Button>
      <Button variant='primary' color='brand' size='medium'>
        <ChevronDown />
      </Button>
    </SplitButton>
    <SplitButton>
      <Button variant='primary' color='brand' size='large'>
        Large
      </Button>
      <Button variant='primary' color='brand' size='large'>
        <ChevronDown />
      </Button>
    </SplitButton>
  </HStack>
);

/**
 * Text, icon-and-text, and icon-only leading halves. The trailing half stays a bare
 * chevron — giving it a label doubles the width and makes the menu look like a second action.
 */
export const Content: StoryFn<typeof meta> = () => (
  <VStack>
    <span className='sb-annotation'>Text only</span>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          Large
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          Large
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          Large
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Icon + Text</span>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
          Large
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
          Large
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          <CircleDashed />
          Large
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Icon + Text + Badge</span>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
          Large
          <NumericBadge type='outline'>1</NumericBadge>
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
          Large
          <NumericBadge type='outline'>1</NumericBadge>
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          <CircleDashed />
          Large
          <NumericBadge type='outline'>1</NumericBadge>
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>

    <span className='sb-annotation'>Icon only</span>
    <HStack align='end'>
      <SplitButton>
        <Button variant='primary' color='brand' size='large'>
          <CircleDashed />
        </Button>
        <Button variant='primary' color='brand' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='outline' color='neutral' size='large'>
          <CircleDashed />
        </Button>
        <Button variant='outline' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
      <SplitButton>
        <Button variant='secondary' color='neutral' size='large'>
          <CircleDashed />
        </Button>
        <Button variant='secondary' color='neutral' size='large'>
          <ChevronDown />
        </Button>
      </SplitButton>
    </HStack>
  </VStack>
);

/**
 * The real shape: the leading half performs the default action, and only the chevron opens
 * the menu. Repeat the default inside the menu only if its wording differs there.
 */
export const WithDropdownMenu: StoryFn<typeof meta> = () => (
  <DropdownMenu>
    <SplitButton data-testid='split-button-dropdown'>
      <Button variant='primary' color='brand'>
        Save
      </Button>
      <DropdownMenuTrigger asChild>
        <Button variant='primary' color='brand'>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
    </SplitButton>
    <DropdownMenuContent>
      <DropdownMenuItem value='draft'>Save as draft</DropdownMenuItem>
      <DropdownMenuItem value='publish'>Save and publish</DropdownMenuItem>
      <DropdownMenuItem value='template'>Save as template</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
