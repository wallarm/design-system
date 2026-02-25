import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info, LayoutGrid, LayoutTemplate, Search } from '../../icons';
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
import { VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { InputGroup } from './InputGroup';
import { InputGroupAddon } from './InputGroupAddon';
import { InputGroupInput } from './InputGroupInput';
import { InputGroupText } from './InputGroupText';

const meta = {
  title: 'Inputs/InputGroup',
  component: InputGroup,
  subcomponents: {
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputGroup>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <VStack gap={12}>
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder='Enter' />
      <InputGroupAddon align='inline-end'>
        <Info />
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon variant='outline'>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder='Enter' value='wallarm/user-settings' />
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
      <InputGroupInput placeholder='Enter' disabled />
      <InputGroupAddon align='inline-end'>
        <Info />
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder='Enter' value='wallarm/user-settings' disabled />
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
      <InputGroupInput placeholder='Enter' error />
      <InputGroupAddon align='inline-end'>
        <Info />
      </InputGroupAddon>
    </InputGroup>

    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder='Enter' value='wallarm/user-settings' error />
      <InputGroupAddon align='inline-end'>
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  </VStack>
);

export const WithLoader: StoryFn<typeof meta> = () => (
  <InputGroup>
    <InputGroupInput placeholder='Searching...' disabled />
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
    <InputGroupInput placeholder='Search' />
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
    <InputGroupInput placeholder='Enter' />
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

        <InputGroupInput placeholder='Enter' />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder='Enter' />
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

        <InputGroupInput placeholder='Enter' />
      </InputGroup>

      <InputGroup>
        <InputGroupInput placeholder='Enter' />
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
