import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { ProviderIcon, type ProviderIconProps } from './ProviderIcon';
import type { ProviderIconName } from './types';

const ALL_NAMES: ProviderIconName[] = [
  'braze',
  'brevo',
  'discord',
  'infobip',
  'mailersend',
  'mailgun',
  'mailjet',
  'mailtrap',
  'mandrill',
  'maqsam',
  'mattermost',
  'netcore',
  'outlook365',
  'plunk',
  'postmark',
  'resend',
  'sendgrid',
  'ses',
  'slack',
  'smtp',
  'sparkpost',
  'teams',
  'telegram',
  'webhook',
  'whatsapp',
  'zulip',
];

const meta = {
  title: 'Brand/ProviderIcon',
  component: ProviderIcon,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    name: {
      control: 'select',
      options: ALL_NAMES,
      description: 'Which notification provider to render.',
    },
  },
} satisfies Meta<typeof ProviderIcon>;

export default meta;

export const Basic: StoryFn<ProviderIconProps> = args => <ProviderIcon {...args} />;

Basic.args = {
  name: 'slack',
  size: 'xl',
};

export const AllProviders: StoryFn = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 16 }}>
    {ALL_NAMES.map(name => (
      <VStack key={name} gap={4} align='center'>
        <ProviderIcon name={name} size='xl' />
        <Text size='xs' color='secondary'>
          {name}
        </Text>
      </VStack>
    ))}
  </div>
);
