import { Fragment, useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { LayoutGrid, LayoutTemplate, Pen, Search, SquareArrowOutUpRight } from '../../icons';
import { Button } from '../Button';
import { Field, FieldContent, FieldLabel, FieldSet } from '../Field';
import { HStack, VStack } from '../Stack';
import { Tag } from '../Tag';
import { Select } from './Select';
import { SelectButton } from './SelectButton';
import { SelectClearTrigger } from './SelectClearTrigger';
import { SelectContent } from './SelectContent';
import { SelectFooter } from './SelectFooter';
import { SelectGroup } from './SelectGroup';
import { SelectGroupLabel } from './SelectGroupLabel';
import { SelectHeader } from './SelectHeader';
import { SelectInput } from './SelectInput';
import { SelectOption } from './SelectOption';
import { SelectOptionDescription } from './SelectOptionDescription';
import { SelectOptionIndicator } from './SelectOptionIndicator';
import { SelectOptionText } from './SelectOptionText';
import { SelectPositioner } from './SelectPositioner';
import { SelectSearchInput } from './SelectSearchInput';
import { SelectSeparator } from './SelectSeparator';
import type { SelectDataItem } from './types';

const meta = {
  title: 'Inputs/Select',
  component: Select,
  subcomponents: {
    SelectButton,
    SelectClearTrigger,
    SelectContent,
    SelectFooter,
    SelectGroup,
    SelectGroupLabel,
    SelectHeader,
    SelectInput,
    SelectOption,
    SelectOptionDescription,
    SelectOptionIndicator,
    SelectOptionText,
    SelectPositioner,
    SelectSearchInput,
    SelectSeparator,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Select>;

export default meta;

const skills: SelectDataItem[] = [
  { label: 'React', value: 'react', icon: LayoutGrid, category: 'Frontend' },
  { label: 'Vue', value: 'vue', icon: LayoutTemplate, category: 'Frontend' },
  { label: 'Angular', value: 'angular', icon: Search, category: 'Frontend' },
  { label: 'Node.js', value: 'nodejs', icon: Pen, category: 'Backend' },
  { label: 'Python', value: 'python', icon: LayoutGrid, category: 'Backend' },
  { label: 'Java', value: 'java', icon: LayoutGrid, category: 'Backend' },
  {
    label: 'TypeScript',
    value: 'typescript',
    icon: LayoutGrid,
    category: 'Language',
    description: 'Language',
  },
  {
    label: 'JavaScript',
    value: 'javascript',
    icon: LayoutGrid,
    category: 'Language',
    description: 'Language',
  },
  { label: 'SQL', value: 'sql', icon: LayoutGrid, category: 'Database' },
  {
    label: 'MongoDB',
    value: 'mongodb',
    icon: LayoutGrid,
    category: 'Database',
  },
];

const skillsWithoutIcons: SelectDataItem[] = skills.map(({ icon, ...skill }) => skill);

export const Basic: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
    isItemDisabled: item => item.value === 'angular',
  });

  return (
    <div className='w-300'>
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
    </div>
  );
};

export const DifferentButtons: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
  });

  return (
    <div className='w-800'>
      <VStack gap={16}>
        <HStack gap={8}>
          <Select collection={collection}>
            <SelectButton placeholder='Default' />

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

          <Select collection={collection}>
            <SelectButton variant='ghost' placeholder='Ghost + Neutral' />

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

          <Select collection={collection}>
            <SelectButton variant='ghost' color='brand' placeholder='Ghost + Brand' />

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

          <Select collection={collection}>
            <SelectButton variant='secondary' placeholder='Secondary + Neutral' />

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

          <Select collection={collection}>
            <SelectButton variant='secondary' color='brand' placeholder='Ghost + Brand' />

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
        </HStack>

        <HStack gap={8}>
          <Select collection={collection} disabled>
            <SelectButton placeholder='Default' />

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

          <Select collection={collection} disabled>
            <SelectButton variant='ghost' placeholder='Ghost + Neutral' />

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

          <Select collection={collection} disabled>
            <SelectButton variant='ghost' color='brand' placeholder='Ghost + Brand' />

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

          <Select collection={collection} disabled>
            <SelectButton variant='secondary' placeholder='Secondary + Neutral' />

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

          <Select collection={collection} disabled>
            <SelectButton variant='secondary' color='brand' placeholder='Ghost + Brand' />

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
        </HStack>

        <HStack gap={8}>
          <Select collection={collection} loading>
            <SelectButton placeholder='Default' />

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

          <Select collection={collection} loading>
            <SelectButton variant='ghost' placeholder='Ghost + Neutral' />

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

          <Select collection={collection} loading>
            <SelectButton variant='ghost' color='brand' placeholder='Ghost + Brand' />

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

          <Select collection={collection} loading>
            <SelectButton variant='secondary' placeholder='Secondary + Neutral' />

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

          <Select collection={collection} loading>
            <SelectButton variant='secondary' color='brand' placeholder='Ghost + Brand' />

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
        </HStack>
      </VStack>
    </div>
  );
};

export const Multiple: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
  });

  return (
    <VStack>
      <div className='w-400'>
        <Select
          collection={collection}
          multiple
          defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
        >
          <SelectInput />

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
      </div>

      <div className='w-400'>
        <Select
          collection={collection}
          multiple
          invalid
          defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
        >
          <SelectInput />

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
      </div>

      <div className='w-400'>
        <Select
          collection={collection}
          multiple
          disabled
          defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
        >
          <SelectInput />

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
      </div>
    </VStack>
  );
};

export const MultipleWithIcons: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skills,
  });

  return (
    <VStack>
      <div className='w-400'>
        <Select
          collection={collection}
          multiple
          defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
        >
          <SelectInput />

          <SelectPositioner>
            <SelectContent>
              {collection.items.map(skill => {
                const { icon: Icon } = skill;

                return (
                  <SelectOption key={skill.value} item={skill}>
                    {Icon && <Icon />}
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                );
              })}
            </SelectContent>
          </SelectPositioner>
        </Select>
      </div>

      <div className='w-400'>
        <Select
          collection={collection}
          multiple
          invalid
          defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
        >
          <SelectInput />

          <SelectPositioner>
            <SelectContent>
              {collection.items.map(skill => {
                const { icon: Icon } = skill;

                return (
                  <SelectOption key={skill.value} item={skill}>
                    {Icon && <Icon />}
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                );
              })}
            </SelectContent>
          </SelectPositioner>
        </Select>
      </div>

      <div className='w-400'>
        <Select
          collection={collection}
          multiple
          disabled
          defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
        >
          <SelectInput />

          <SelectPositioner>
            <SelectContent>
              {collection.items.map(skill => {
                const { icon: Icon } = skill;

                return (
                  <SelectOption key={skill.value} item={skill}>
                    {Icon && <Icon />}
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    <SelectOptionIndicator />
                  </SelectOption>
                );
              })}
            </SelectContent>
          </SelectPositioner>
        </Select>
      </div>
    </VStack>
  );
};

export const Grouped: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
    groupBy: item => item.category ?? '',
  });

  return (
    <Select collection={collection}>
      <SelectButton />

      <SelectPositioner>
        <SelectContent>
          {collection.group().map(([category, group], index) => (
            <SelectGroup key={category}>
              <SelectGroupLabel>
                {category}
                {index === 0 && <SelectClearTrigger>Clear all</SelectClearTrigger>}
              </SelectGroupLabel>
              {group.map(skill => (
                <SelectOption key={skill.value} item={skill}>
                  <SelectOptionText>{skill.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </SelectPositioner>
    </Select>
  );
};

export const Disabled: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skills,
  });

  return (
    <Select collection={collection} disabled>
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
  );
};

export const Loading: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skills,
  });

  return (
    <Select collection={collection} loading>
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
  );
};

export const WithSelectInput: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skills,
  });

  return (
    <div className='w-300'>
      <VStack align='stretch'>
        <Select collection={collection}>
          <SelectInput />

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

        <Select collection={collection} invalid>
          <SelectInput />

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

        <Select collection={collection} disabled>
          <SelectInput />

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
      </VStack>
    </div>
  );
};

export const WithSeparator: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skills,
  });

  return (
    <div className='w-300'>
      <Select collection={collection}>
        <SelectButton />

        <SelectPositioner>
          <SelectContent>
            {collection.items.map((skill, index) => (
              <Fragment key={skill.value}>
                <SelectOption item={skill}>
                  <SelectOptionText>{skill.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>

                {index === 3 && <SelectSeparator />}
              </Fragment>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>
    </div>
  );
};

export const WithIcons: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skills,
  });

  return (
    <div className='w-300'>
      <Select collection={collection}>
        <SelectButton />

        <SelectPositioner>
          <SelectContent>
            {collection.items.map(({ icon: Icon, ...skill }) => (
              <SelectOption key={skill.value} item={skill}>
                {Icon && <Icon />}
                <SelectOptionText>{skill.label}</SelectOptionText>
                <SelectOptionIndicator />
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>
    </div>
  );
};

export const WithFooter: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
    groupBy: item => item.category ?? '',
  });

  return (
    <div className='w-300'>
      <Select collection={collection}>
        <SelectButton />

        <SelectPositioner>
          <SelectContent>
            {collection.group().map(([category, group], index) => (
              <SelectGroup key={category}>
                <SelectGroupLabel>
                  {category}
                  {index === 0 && <SelectClearTrigger>Clear all</SelectClearTrigger>}
                </SelectGroupLabel>
                {group.map(skill => (
                  <SelectOption key={skill.value} item={skill}>
                    <SelectOptionText>{skill.label}</SelectOptionText>
                    {skill.description && (
                      <SelectOptionDescription>{skill.description}</SelectOptionDescription>
                    )}
                    <SelectOptionIndicator />
                  </SelectOption>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>

          <SelectFooter>
            <HStack justify='between'>
              <Button variant='ghost' color='neutral' size='small'>
                <SquareArrowOutUpRight />
                See all
              </Button>

              <HStack justify='end'>
                <Button variant='ghost' color='neutral' size='small'>
                  Cancel
                </Button>

                <Button variant='primary' color='brand' size='small'>
                  Apply
                </Button>
              </HStack>
            </HStack>
          </SelectFooter>
        </SelectPositioner>
      </Select>
    </div>
  );
};

export const WithSearch: StoryFn<typeof Select> = () => {
  const [searchValue, setSearchValue] = useState<string>('');

  const collection = createListCollection({
    items: skillsWithoutIcons,
    groupBy: item => item.category ?? '',
    itemToString: item => item.label,
  });

  return (
    <div className='w-300'>
      <Select collection={collection}>
        <SelectButton />

        <SelectPositioner>
          <SelectHeader>
            <SelectSearchInput value={searchValue} onChange={setSearchValue} />
          </SelectHeader>

          <SelectContent>
            {collection
              .filter(skill => skill.toLowerCase().includes(searchValue.toLowerCase()))
              .group()
              .map(([category, group], index) => (
                <SelectGroup key={category}>
                  <SelectGroupLabel>
                    {category}
                    {index === 0 && <SelectClearTrigger>Clear all</SelectClearTrigger>}
                  </SelectGroupLabel>
                  {group.map(skill => (
                    <SelectOption key={skill.value} item={skill}>
                      <SelectOptionText>{skill.label}</SelectOptionText>
                      {skill.description && (
                        <SelectOptionDescription>{skill.description}</SelectOptionDescription>
                      )}
                      <SelectOptionIndicator />
                    </SelectOption>
                  ))}
                </SelectGroup>
              ))}
          </SelectContent>

          <SelectFooter>
            <HStack justify='between'>
              <Button variant='ghost' color='neutral' size='small'>
                <SquareArrowOutUpRight />
                See all
              </Button>

              <HStack justify='end'>
                <Button variant='ghost' color='neutral' size='small'>
                  Cancel
                </Button>

                <Button variant='primary' color='brand' size='small'>
                  Apply
                </Button>
              </HStack>
            </HStack>
          </SelectFooter>
        </SelectPositioner>
      </Select>
    </div>
  );
};

export const WithFormField: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
  });

  return (
    <div className='w-300'>
      <FieldSet>
        <Field>
          <FieldLabel>Single with SelectInput</FieldLabel>
          <FieldContent>
            <Select collection={collection}>
              <SelectInput />

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
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Single with SelectButton</FieldLabel>
          <FieldContent>
            <Select collection={collection} defaultValue={['react']}>
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
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Multiple with SelectInput</FieldLabel>
          <FieldContent>
            <Select collection={collection} multiple defaultValue={['react', 'vue']}>
              <SelectInput />

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
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Multiple with SelectButton</FieldLabel>
          <FieldContent>
            <Select collection={collection} multiple defaultValue={['react', 'vue', 'angular']}>
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
          </FieldContent>
        </Field>
      </FieldSet>
    </div>
  );
};

export const WithTags: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
  });

  return (
    <div className='w-300'>
      <Select
        collection={collection}
        multiple
        defaultValue={['react', 'vue', 'angular', 'nodejs', 'python', 'java', 'typescript']}
      >
        <SelectInput />

        <SelectPositioner>
          <SelectContent>
            {collection.items.map(skill => (
              <SelectOption key={skill.value} item={skill}>
                <Tag>{skill.label}</Tag>
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>
    </div>
  );
};
