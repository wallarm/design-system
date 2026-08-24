import { Fragment } from 'react';
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
import { SelectEmptyState } from './SelectEmptyState';
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
import { useSelectSearch } from './useSelectSearch';

const DESCRIPTION = [
  'Holds one answer, or several, chosen from a list — below about six options expose them instead with `Radio` or `SegmentedControl`, and reach for `DropdownMenu` when the items run commands rather than set a value.',
  'The trigger is composed rather than configured: `SelectButton` for a button-shaped trigger, `SelectInput` for one that looks like a field.',
].join(' ');

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
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
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

/**
 * The minimum composition: a trigger, a `SelectPositioner`, and `SelectContent` holding the
 * options. Every part is explicit, which is what lets the trigger change without the menu changing.
 */
export const Basic: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
    isItemDisabled: item => item.value === 'angular',
  });

  return (
    <div className='w-300'>
      <Select collection={collection} data-testid='select'>
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

/**
 * The same height scale as the other fields, so a select sits in a row of inputs without
 * breaking the line.
 */
export const Sizes: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
  });

  return (
    <VStack gap={16} align='stretch'>
      <HStack gap={16} align='start'>
        <Select collection={collection}>
          <SelectButton size='default' />
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
          <SelectButton size='medium' />
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
          <SelectButton size='small' />
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

      <HStack gap={16} align='start'>
        <Select collection={collection}>
          <SelectInput size='default' />
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
          <SelectInput size='medium' />
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
          <SelectInput size='small' />
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
  );
};

/**
 * The trigger is yours to shape — labelled, icon-led, or value-only. Whatever it looks like,
 * it must still read as something that opens.
 */
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

/**
 * `multiple` collects several answers, and the trigger summarises them. Once past a couple of
 * selections a summary beats a list, which is what `WithTags` is for.
 */
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

/**
 * Icons carry the option's identity into the closed trigger, which matters more in a
 * multi-select where the text is compressed into a summary.
 */
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

/**
 * `SelectGroup` with `SelectGroupLabel` splits a long list into named sections. Group when
 * the reader would otherwise scan, not merely because the options have categories.
 */
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

/**
 * The whole control is out, trigger included. Disabling individual options instead keeps the
 * list honest about what exists.
 */
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

/**
 * `loading` on the root, for a list still being fetched. It holds the trigger's shape so the
 * layout doesn't jump when the options land.
 */
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

/**
 * `SelectInput` makes the trigger look like a text field, which suits a select sitting in a
 * form beside real inputs rather than in a toolbar.
 */
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

/**
 * `SelectSeparator` divides kinds of option — a destructive or clear-all entry from the real
 * choices — where a group label would be overkill.
 */
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

/**
 * `SelectValueIcon` in the option and the trigger, so the chosen option keeps its icon once
 * the menu closes.
 */
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

/**
 * `SelectFooter` pins content below the scrolling list, for a persistent escape like managing
 * the options themselves.
 */
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

/**
 * `SelectSearchInput` with the `useSelectSearch` hook, plus `SelectEmptyState` for when
 * nothing matches. Add search once the list outgrows a glance — roughly ten options.
 */
export const WithSearch: StoryFn<typeof Select> = () => {
  const collection = createListCollection({
    items: skillsWithoutIcons,
    groupBy: item => item.category ?? '',
    itemToString: item => item.label,
  });

  const { searchValue, onSearchChange, filteredCollection } = useSelectSearch(collection);

  return (
    <div className='w-300'>
      <Select collection={collection}>
        <SelectButton />

        <SelectPositioner>
          <SelectHeader>
            <SelectSearchInput value={searchValue} onChange={onSearchChange} />
          </SelectHeader>

          <SelectContent>
            {filteredCollection.size === 0 ? (
              <SelectEmptyState description={`No results for "${searchValue}"`} />
            ) : (
              filteredCollection.group().map(([category, group], index) => (
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
              ))
            )}
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

/**
 * Inside `Field`, so the label and description come from `FieldLabel` and `FieldDescription`
 * rather than from the select.
 */
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

/**
 * Selections render as removable tags inside the field, which is the honest shape for
 * multi-select when the reader needs to see and undo each choice individually.
 */
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
