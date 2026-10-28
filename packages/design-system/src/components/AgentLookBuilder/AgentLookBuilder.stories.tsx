import { useState } from 'react';

import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { AgentAvatar } from '../AgentAvatar';
import { AgentGlyph } from '../AgentGlyph';
import { Button } from '../Button';
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
import { Text } from '../Text';
import {
  AGENT_COLORS,
  AGENT_EYES,
  AGENT_PROPS,
  AGENT_SHAPES,
  type AgentLook,
  defaultLook,
  enableAgentLookLibrary,
  type LookIssueCode,
  lookIssues,
} from './index';

const DESCRIPTION = [
  'The builder entry: everything a product needs to let admins pick an agent’s look. It holds the kit with display names (`AGENT_SHAPES`, `AGENT_COLORS`, `AGENT_EYES`, `AGENT_PROPS`), `lookIssues` for the combinations to avoid and `defaultLook` for a first look.',
  '`enableAgentLookLibrary()` loads the full prop library. Any app that renders stored custom looks calls it once at start-up — the cards, rows and tables that show them, not only the picker. Without it `AgentAvatar` and `AgentGlyph` draw only the presets’ props, and any other prop is left out with a warning in development. Mounted glyphs pick it up on their next render; a mounted 3D character keeps what it drew until its look changes or it remounts, so call it before the first render.',
  'It ships no picker UI; the stories build one from DS `Select`s. `lookIssues` only warns, never blocks; coral is Wally’s and is not offered.',
].join(' ');

const ISSUE_TEXT: Record<LookIssueCode, string> = {
  'coral-not-wally': 'Coral belongs to Wally.',
  'dots-look-alike': 'Looks like a character from OpenAI Dots.',
  'reads-as-wally': 'A dome with antennae reads as a second Wally.',
  'glyph-twin':
    'Another agent has the same shape and colour: as glyphs they are hard to tell apart.',
  'sky-teal-same-shape': 'Sky and teal on the same shape are hard to tell apart.',
};

const shapes = createListCollection({
  items: AGENT_SHAPES.map(s => ({ value: s.id, label: s.name })),
});
// Coral is Wally's (D22): the picker never offers it.
const colors = createListCollection({
  items: AGENT_COLORS.filter(c => !c.brand).map(c => ({ value: c.id, label: c.name })),
});
const eyes = createListCollection({
  items: AGENT_EYES.map(e => ({ value: e.id, label: e.name })),
});
const props = createListCollection({
  items: AGENT_PROPS.map(p => ({ value: p.id, label: p.glyph ? p.name : `${p.name} (3D only)` })),
});
const PROP_POOL = AGENT_PROPS.filter(p => p.id !== 'none').map(p => p.id);
const FIRST_LOOK: AgentLook = {
  v: 1,
  shape: 'mochi',
  color: 'lavender',
  eyes: 'oval',
  prop: 'sprout',
};

const meta = {
  title: 'AI/AgentLookBuilder',
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta;

export default meta;

/**
 * Any look from the kit, as the 72 px live character of the team card and the 24 and 20 px glyphs, with the
 * `lookIssues` warnings. Random draws a look with no issue from the whole prop library.
 */
export const AnyLook: StoryFn = () => {
  // In an app: once at start-up, before any stored custom look renders (here, before this story's first render).
  enableAgentLookLibrary();
  const [look, setLook] = useState<AgentLook>(FIRST_LOOK);
  const [draws, setDraws] = useState(0);
  const issues = lookIssues(look, { isWally: false, others: [] });

  const handleShape = ({ value }: { value: string[] }) =>
    setLook({ ...look, shape: value[0] as AgentLook['shape'] });
  const handleColor = ({ value }: { value: string[] }) =>
    setLook({ ...look, color: value[0] as AgentLook['color'] });
  const handleEyes = ({ value }: { value: string[] }) =>
    setLook({ ...look, eyes: value[0] as AgentLook['eyes'] });
  const handleProp = ({ value }: { value: string[] }) =>
    setLook({ ...look, prop: value[0] as AgentLook['prop'] });
  const handleRandom = () => {
    setLook(defaultLook(`random-${draws}`, [], PROP_POOL));
    setDraws(draws + 1);
  };

  return (
    <VStack gap={24} align='start' data-testid='any-look'>
      <HStack gap={24} align='end'>
        <AgentAvatar look={look} size={72} seed='builder' live data-testid='any-look--avatar' />
        <AgentGlyph look={look} size={24} data-testid='any-look--glyph-24' />
        <AgentGlyph look={look} size={20} data-testid='any-look--glyph-20' />
      </HStack>
      <HStack gap={12} align='start'>
        <Select
          collection={shapes}
          value={[look.shape]}
          onValueChange={handleShape}
          data-testid='any-look--shape'
        >
          <SelectButton aria-label='Shape' />
          <SelectPositioner>
            <SelectContent>
              {shapes.items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
        <Select
          collection={colors}
          value={[look.color]}
          onValueChange={handleColor}
          data-testid='any-look--color'
        >
          <SelectButton aria-label='Colour' />
          <SelectPositioner>
            <SelectContent>
              {colors.items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
        <Select
          collection={eyes}
          value={[look.eyes]}
          onValueChange={handleEyes}
          data-testid='any-look--eyes'
        >
          <SelectButton aria-label='Eyes' />
          <SelectPositioner>
            <SelectContent>
              {eyes.items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
        <Select
          collection={props}
          value={[look.prop]}
          onValueChange={handleProp}
          data-testid='any-look--prop'
        >
          <SelectButton aria-label='Prop' />
          <SelectPositioner>
            <SelectContent>
              {props.items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
        <Button
          variant='outline'
          color='neutral'
          onClick={handleRandom}
          data-testid='any-look--random'
        >
          Random
        </Button>
      </HStack>
      <VStack gap={4} align='start' data-testid='any-look--issues'>
        {issues.map(issue => (
          <Text key={issue.code} size='sm' color='danger'>
            {ISSUE_TEXT[issue.code]}
          </Text>
        ))}
      </VStack>
    </VStack>
  );
};

/**
 * Every shape in the first colour of each palette group (coral, Wally's, aside), static, with no prop; the last
 * column wears the magnifier, a library prop that shows only on the 3D character.
 */
export const Library: StoryFn = () => {
  // In an app: once at start-up, before any stored custom look renders.
  enableAgentLookLibrary();
  const groups = [...new Set(AGENT_COLORS.filter(c => !c.brand).map(c => c.group))];
  const firstColors = groups.map(g => AGENT_COLORS.find(c => c.group === g)?.id ?? 'cobalt');

  return (
    <VStack gap={12} align='start' data-testid='library'>
      {AGENT_SHAPES.map(s => (
        <HStack key={s.id} gap={12} align='center'>
          <div className='w-80'>
            <Text size='sm'>{s.name}</Text>
          </div>
          {firstColors.map(color => (
            <AgentAvatar
              key={color}
              look={{ v: 1, shape: s.id, color, eyes: 'oval', prop: 'none' }}
              size={48}
              seed={`${s.id}-${color}`}
              data-testid={`library--${s.id}-${color}`}
            />
          ))}
          <AgentAvatar
            look={{ v: 1, shape: s.id, color: 'sky', eyes: 'oval', prop: 'magnifier' }}
            size={48}
            seed={`${s.id}-magnifier`}
            data-testid={`library--${s.id}-magnifier`}
          />
        </HStack>
      ))}
    </VStack>
  );
};
