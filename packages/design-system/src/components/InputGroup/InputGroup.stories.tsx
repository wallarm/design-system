import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { ArrowUp, Info, LayoutGrid, LayoutTemplate, Search, Settings2 } from '../../icons';
import { Button } from '../Button';
import { Input } from '../Input';
import { Kbd } from '../Kbd';
import { Loader } from '../Loader';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { HStack, VStack } from '../Stack';
import { Textarea } from '../Textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { InputGroup } from './InputGroup';
import { InputGroupAddon } from './InputGroupAddon';
import { InputGroupText } from './InputGroupText';

const meta = {
  title: 'Inputs/InputGroup',
  component: InputGroup,
  subcomponents: {
    InputGroupAddon,
    InputGroupText,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <VStack gap={12}>
    <InputGroup data-testid='input-group'>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input placeholder='Enter' />
      <InputGroupAddon align='inline-end'>
        <Info />
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon variant='outline'>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <Input placeholder='Enter' value='wallarm/user-settings' />
      <InputGroupAddon variant='outline' align='inline-end'>
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </VStack>
);

export const Disabled: StoryFn<typeof meta> = () => (
  <VStack gap={12}>
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input placeholder='Enter' disabled />
      <InputGroupAddon align='inline-end'>
        <Info />
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <Input placeholder='Enter' value='wallarm/user-settings' disabled />
      <InputGroupAddon align='inline-end'>
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </VStack>
);

export const WithError: StoryFn<typeof meta> = () => (
  <VStack gap={12}>
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <Input placeholder='Enter' error />
      <InputGroupAddon align='inline-end'>
        <Info />
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <Input placeholder='Enter' value='wallarm/user-settings' error />
      <InputGroupAddon align='inline-end'>
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </VStack>
);

export const WithLoader: StoryFn<typeof meta> = () => (
  <InputGroup>
    <Input placeholder='Searching...' disabled />
    <InputGroupAddon align='inline-end'>
      <Loader size='md' />
    </InputGroupAddon>
  </InputGroup>
);

export const WithKbd: StoryFn<typeof meta> = () => (
  <InputGroup>
    <InputGroupAddon>
      <Search />
    </InputGroupAddon>
    <Input placeholder='Search' />
    <InputGroupAddon align='inline-end'>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </InputGroupAddon>
  </InputGroup>
);

export const WithTooltip: StoryFn<typeof meta> = () => (
  <InputGroup>
    <InputGroupAddon>
      <Search />
    </InputGroupAddon>
    <Input placeholder='Enter' />
    <InputGroupAddon align='inline-end'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info />
        </TooltipTrigger>
        <TooltipContent>Get more info</TooltipContent>
      </Tooltip>
    </InputGroupAddon>
  </InputGroup>
);

export const WithTextarea: StoryFn<typeof meta> = () => (
  <div style={{ width: 480 }}>
    <VStack gap={12}>
      <InputGroup>
        <Textarea minRows={1} maxRows={5} placeholder='Type a message...' />
      </InputGroup>

      <InputGroup>
        <Textarea minRows={1} maxRows={5} placeholder='Type a message...' />
        <InputGroupAddon align='block-end'>
          <HStack fullWidth align='center' justify='end'>
            <Button variant='primary' color='brand' size='small'>
              <ArrowUp />
            </Button>
          </HStack>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <Textarea minRows={1} maxRows={5} placeholder='Type a message...' />
        <InputGroupAddon align='block-end'>
          <HStack fullWidth align='center' justify='between'>
            <Button variant='secondary' size='small' color='neutral'>
              <Settings2 />
            </Button>
            <Button variant='primary' color='brand' size='small'>
              <ArrowUp />
            </Button>
          </HStack>
        </InputGroupAddon>
      </InputGroup>
    </VStack>
  </div>
);

export const WithSelect: StoryFn<typeof meta> = () => {
  const collection = createListCollection({
    items: [
      {
        label: 'React',
        value: 'react',
        icon: LayoutGrid,
        category: 'Frontend',
      },
      {
        label: 'Vue',
        value: 'vue',
        icon: LayoutTemplate,
        category: 'Frontend',
      },
      {
        label: 'Angular',
        value: 'angular',
        icon: Search,
        category: 'Frontend',
      },
    ],
  });

  return (
    <VStack gap={12}>
      <InputGroup>
        <InputGroupAddon variant='outline'>
          <Select collection={collection}>
            <SelectButton />

            <SelectPositioner>
              <SelectContent>
                {collection.items.map(skill => (
                  <SelectOption key={skill.value} item={skill}>
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </InputGroupAddon>

        <Input placeholder='Enter' />
      </InputGroup>

      <InputGroup>
        <Input placeholder='Enter' />
        <InputGroupAddon align='inline-end' variant='outline'>
          <Select collection={collection}>
            <SelectButton />

            <SelectPositioner>
              <SelectContent>
                {collection.items.map(skill => (
                  <SelectOption key={skill.value} item={skill}>
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </InputGroupAddon>
      </InputGroup>

      <InputGroup>
        <InputGroupAddon>
          <Select collection={collection}>
            <SelectButton />

            <SelectPositioner>
              <SelectContent>
                {collection.items.map(skill => (
                  <SelectOption key={skill.value} item={skill}>
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </InputGroupAddon>

        <Input placeholder='Enter' />
      </InputGroup>

      <InputGroup>
        <Input placeholder='Enter' />
        <InputGroupAddon align='inline-end'>
          <Select collection={collection}>
            <SelectButton />

            <SelectPositioner>
              <SelectContent>
                {collection.items.map(skill => (
                  <SelectOption key={skill.value} item={skill}>
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </InputGroupAddon>
      </InputGroup>
    </VStack>
  );
};
