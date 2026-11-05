import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CAST } from '../../lib/agent-characters/data.gen';
import { defaultLook } from '../../lib/agent-characters/look';
import { PLACES } from '../../lib/agent-characters/places';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { AgentAvatar, type AgentAvatarProps, type AgentAvatarState } from './AgentAvatar';

const DESCRIPTION = [
  'The character of an AI agent from 40 px up: a soft felt body baked in the browser from its silhouette, a glass visor and two light eyes that carry its state, and the prop that tells its job. Below 40 px use `AgentGlyph`.',
  'The body is baked once per outline, colour and size, off the main thread, and cached; until a layer is ready its flat fill shows. This page shows the static frame of each state.',
  'Size, liveness and the contact shadow are set by the place the character sits in (Overview rows 40 px, headers and toasts 48, beside people 56, the team card and the drawer 72, the empty chat 120); only the drawer header, the empty chat and 96 px and up get the shadow. Next to the agent’s visible name the character is decorative; give it a `label` only when it stands alone.',
].join(' ');

const STATES: AgentAvatarState[] = [
  'idle',
  'working',
  'needs',
  'failed',
  'off',
  'box',
  'invite',
  'hello',
  'done',
];
const STATE_LABELS: Record<AgentAvatarState, string> = {
  idle: 'On duty',
  working: 'Working',
  needs: 'Needs you',
  failed: 'Failed',
  off: 'Deactivated',
  box: 'Not set up',
  invite: 'Inviting',
  hello: 'Hello',
  done: 'Done',
};

const meta = {
  title: 'AI/AgentAvatar',
  component: AgentAvatar,
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
      options: [40, 48, 56, 72, 120],
      description: 'Set by the place the character sits in.',
    },
    state: { control: 'select', options: STATES, description: 'State frame.' },
    shadow: {
      control: 'boolean',
      description: 'Contact shadow: drawer header, empty chat, 96 px and up.',
    },
    hasApplications: { control: 'boolean', description: 'The agent’s template has applications.' },
    coverage: {
      control: 'inline-radio',
      options: ['full', 'partial'],
      description: '`partial` keeps the top of the head in grey felt.',
    },
    label: {
      control: 'text',
      description: 'Set only when the character stands alone without its name.',
    },
    seed: { control: 'text', description: 'The agent’s uid.' },
  },
} satisfies Meta<typeof AgentAvatar>;

export default meta;

/** Radar on duty in the agent drawer header: 72 px with the contact shadow. */
export const Basic: StoryFn<AgentAvatarProps> = args => (
  <AgentAvatar data-testid='agent-avatar' {...args} />
);

Basic.args = { agent: 'radar', seed: 'radar', size: 72, state: 'idle', shadow: true };

/** The six agents on duty at the team-card size. Each is told apart by its shape, colour and prop. */
export const Cast: StoryFn = () => (
  <HStack gap={24} align='end'>
    {CAST.map(p => (
      <VStack key={p.id} gap={8} align='center'>
        <AgentAvatar data-testid={`agent-avatar-${p.id}`} agent={p.id} seed={p.id} size={72} />
        <Text size='sm'>{p.name}</Text>
      </VStack>
    ))}
  </HStack>
);

/** Every state frame of one agent. The eyes and a few body cues carry the state; red and crosses never appear. */
export const States: StoryFn = () => (
  <HStack gap={24} align='end' wrap='wrap'>
    {STATES.map(state => (
      <VStack key={state} gap={8} align='center'>
        <AgentAvatar
          data-testid={`agent-avatar-${state}`}
          agent='sift'
          seed='sift'
          size={72}
          state={state}
        />
        <Text size='sm'>{STATE_LABELS[state]}</Text>
      </VStack>
    ))}
  </HStack>
);

/** Each place in the product with its size and shadow. */
export const Places: StoryFn = () => (
  <HStack gap={32} align='end'>
    {Object.entries(PLACES)
      .filter(([, p]) => p.renderer === '3d')
      .map(([name, p]) => (
        <VStack key={name} gap={8} align='center'>
          <AgentAvatar
            data-testid={`agent-avatar-place-${name}`}
            agent='trim'
            seed='trim'
            size={p.size as AgentAvatarProps['size']}
            shadow={p.shadow}
          />
          <span className='sb-annotation'>{name}</span>
        </VStack>
      ))}
  </HStack>
);

/** Partial coverage: the agent covers only some of its applications, so the top of its head stays in grey felt. */
export const PartialCoverage: StoryFn = () => (
  <HStack gap={24}>
    {CAST.filter(p => p.id === 'radar' || p.id === 'sift' || p.id === 'mend').map(p => (
      <AgentAvatar
        key={p.id}
        data-testid={`agent-avatar-partial-${p.id}`}
        agent={p.id}
        seed={p.id}
        size={72}
        hasApplications
        coverage='partial'
      />
    ))}
  </HStack>
);

const CUSTOM_AGENTS = [
  '3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c',
  '8c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f',
  'b7e6d5c4-b3a2-4918-8776-655443322110',
];

/** Agents without a preset get a deterministic look from their uid, the same one their glyph shows. */
export const CustomAgent: StoryFn = () => (
  <HStack gap={24}>
    {CUSTOM_AGENTS.map(uid => (
      <AgentAvatar
        key={uid}
        data-testid={`agent-avatar-custom-${uid.slice(0, 8)}`}
        look={defaultLook(uid)}
        seed={uid}
        size={72}
      />
    ))}
  </HStack>
);

// The six presets plus ten custom agents, as stored looks.
const TEAM = [
  ...CAST.map(p => ({
    id: p.id,
    look: { v: 1 as const, shape: p.shape, color: p.color, eyes: p.eyes, prop: p.prop },
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `custom-${i}`,
    look: defaultLook(`team-agent-${i}`),
  })),
];

/** A full Agent team page: 16 cards opened with cold caches, the case the first-draw budget is set for. */
export const Team: StoryFn = () => (
  <div className='grid grid-cols-4 gap-24'>
    {TEAM.map(m => (
      <AgentAvatar
        key={m.id}
        data-testid={`agent-avatar-team-${m.id}`}
        look={m.look}
        seed={m.id}
        size={72}
      />
    ))}
  </div>
);
