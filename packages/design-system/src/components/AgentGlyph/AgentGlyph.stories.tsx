import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CAST } from '../../lib/agent-characters/data.gen';
import { defaultLook } from '../../lib/agent-characters/look';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { AgentGlyph, type AgentGlyphProps, type AgentGlyphState } from './AgentGlyph';

const DESCRIPTION = [
  'The character of an AI agent as a flat 16–32 px glyph: the same silhouette, colour, visor and eyes as the 3D `AgentAvatar`, drawn flat so it stays sharp and cheap in text, chips and table rows. It is static and loads no canvas, bake or animation code.',
  'A glyph is always decorative: put it next to the agent’s visible name, which is what screen readers announce. Use 20 px beside `text-sm` or larger and in table rows, 16 px beside `text-xs`; from 40 px up use `AgentAvatar`.',
  'With `align="optical"` (the default) the glyph lifts its body onto the text line, so every shape reads as centred next to the name without moving the layout; use `align="box"` in ladders and stacks. Only the top-of-head props are drawn at this size.',
].join(' ');

const STATES: AgentGlyphState[] = [
  'idle',
  'hello',
  'working',
  'needs',
  'done',
  'failed',
  'off',
  'box',
  'invite',
];
const STATE_LABELS: Record<AgentGlyphState, string> = {
  idle: 'On duty',
  hello: 'Hello',
  working: 'Working',
  needs: 'Needs you',
  done: 'Done',
  failed: 'Failed',
  off: 'Deactivated',
  box: 'Not set up',
  invite: 'Inviting',
};

const meta = {
  title: 'AI/AgentGlyph',
  component: AgentGlyph,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    agent: {
      control: 'select',
      options: CAST.map(p => p.id),
      description: 'Preset character of a Wallarm agent.',
    },
    size: {
      control: 'select',
      options: [16, 20, 24, 32],
      description: '16 beside text-xs, 20 beside text-sm or larger and in table rows.',
    },
    state: {
      control: 'select',
      options: STATES,
      description: 'State frame. Hello and Done show their arcs; a glyph never animates.',
    },
    align: {
      control: 'inline-radio',
      options: ['optical', 'box'],
      description: '`optical` lifts the body onto the text line; `box` keeps the box.',
    },
    hasApplications: { control: 'boolean', description: 'The agent’s template has applications.' },
    coverage: {
      control: 'inline-radio',
      options: ['full', 'partial'],
      description: '`partial` draws the grey crown of Partial coverage, on duty only.',
    },
  },
} satisfies Meta<typeof AgentGlyph>;

export default meta;

/** Radar on duty at 20 px, the size beside body text. */
export const Basic: StoryFn<AgentGlyphProps> = args => (
  <AgentGlyph data-testid='agent-glyph' {...args} />
);

Basic.args = { agent: 'radar', size: 20, state: 'idle' };

/** The cast in every state frame, at 20 px. Colour and eyes carry the state; red and crosses never appear. */
export const Cast: StoryFn = () => (
  <VStack gap={12}>
    <HStack gap={16}>
      <span className='sb-annotation w-120'>state</span>
      {CAST.map(p => (
        <span key={p.id} className='sb-annotation w-64'>
          {p.name.toLowerCase()}
        </span>
      ))}
    </HStack>
    {STATES.map(state => (
      <HStack key={state} gap={16} align='center'>
        <span className='w-120'>
          <Text size='sm'>{STATE_LABELS[state]}</Text>
        </span>
        {CAST.map(p => (
          <span key={p.id} className='w-64'>
            <AgentGlyph
              data-testid={`agent-glyph-${p.id}-${state}`}
              agent={p.id}
              size={20}
              state={state}
              align='box'
            />
          </span>
        ))}
      </HStack>
    ))}
  </VStack>
);

/** The four glyph sizes for the cast. 16 px is the floor; above 32 px the 3D AgentAvatar takes over. */
export const Sizes: StoryFn = () => (
  <HStack gap={24} align='end'>
    {([16, 20, 24, 32] as const).map(size => (
      <VStack key={size} gap={8} align='center'>
        <span className='sb-annotation'>{size}</span>
        {CAST.map(p => (
          <AgentGlyph
            key={p.id}
            data-testid={`agent-glyph-${size}-${p.id}`}
            agent={p.id}
            size={size}
            align='box'
          />
        ))}
      </VStack>
    ))}
  </HStack>
);

/** Beside a name: 20 px with text-sm, 16 px with text-xs. `optical` sits every shape on the text line; `box` centres the box, so short shapes look low. */
export const InlineWithText: StoryFn = () => (
  <HStack gap={48} align='start'>
    {(['optical', 'box'] as const).map(align => (
      <VStack key={align} gap={8}>
        <span className='sb-annotation'>{align}</span>
        {CAST.map(p => (
          <HStack key={p.id} gap={8} align='center'>
            <AgentGlyph
              data-testid={`agent-glyph-inline-${align}-${p.id}`}
              agent={p.id}
              size={20}
              align={align}
            />
            <Text size='sm'>{p.name}</Text>
            <AgentGlyph
              data-testid={`agent-glyph-inline-xs-${align}-${p.id}`}
              agent={p.id}
              size={16}
              align={align}
            />
            <Text size='xs' color='secondary'>
              {p.role}
            </Text>
          </HStack>
        ))}
      </VStack>
    ))}
  </HStack>
);

/** Partial coverage: an agent whose template has applications, covering only some of them, shows a grey crown while on duty. */
export const PartialCoverage: StoryFn = () => (
  <HStack gap={24} wrap='wrap'>
    {CAST.map(p => (
      <VStack key={p.id} gap={8} align='center'>
        <AgentGlyph
          data-testid={`agent-glyph-partial-${p.id}`}
          agent={p.id}
          size={32}
          hasApplications
          coverage='partial'
          align='box'
        />
        <Text size='sm'>{p.name}</Text>
      </VStack>
    ))}
  </HStack>
);

const CUSTOM_AGENTS = [
  '3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c',
  '8c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
  'b7e6d5c4-b3a2-4918-8776-655443322110',
];

/** Agents without a preset get a deterministic look from their uid: never coral, never a look-alike of another agent. */
export const CustomAgent: StoryFn = () => (
  <HStack gap={24}>
    {CUSTOM_AGENTS.map(uid => (
      <VStack key={uid} gap={8} align='center'>
        <AgentGlyph
          data-testid={`agent-glyph-custom-${uid.slice(0, 8)}`}
          look={defaultLook(uid)}
          size={32}
          align='box'
        />
        <Text size='xs' color='secondary'>
          {uid.slice(0, 8)}
        </Text>
      </VStack>
    ))}
  </HStack>
);
