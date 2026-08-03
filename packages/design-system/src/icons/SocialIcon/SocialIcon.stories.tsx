import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../../components/Stack';
import { Text } from '../../components/Text';
import { SocialIcon, type SocialIconProps } from './SocialIcon';
import type { SocialIconName } from './types';

const ALL_NAMES: SocialIconName[] = [
  'android',
  'apple',
  'apple-music',
  'apple-podcasts',
  'artstation',
  'aws',
  'baidu',
  'behance',
  'boosty',
  'devianart',
  'discord',
  'dprofile',
  'dribbble',
  'dzen',
  'facebook',
  'figma',
  'github',
  'gmail',
  'google',
  'google-meet',
  'google-play',
  'google-podcast',
  'imo',
  'instagram',
  'kickstarter',
  'line',
  'linkedin',
  'medium',
  'messenger',
  'microsoft-teams',
  'notion',
  'ok',
  'ok-only-sign',
  'onlyfans',
  'patreon',
  'paypal',
  'pinterest',
  'product-hunt',
  'quora',
  'reddit',
  'signal',
  'sina-weibo',
  'skype',
  'slack',
  'snapchat',
  'soundcloud',
  'spotify',
  'stack-overflow',
  'telegram',
  'telegram-only-sign',
  'threads',
  'tiktok',
  'tinder',
  'tumblr',
  'twitch',
  'viber',
  'vimeo',
  'vk',
  'vk-music',
  'vk-only-sign',
  'wechat',
  'whatsapp',
  'x-ex-twitter',
  'xing',
  'yandex-music',
  'yelp',
  'youtube',
  'youtube-music',
  'youtube-shorts',
  'zoom',
];

const meta = {
  title: 'Brand/SocialIcon',
  component: SocialIcon,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    name: {
      control: 'select',
      options: ALL_NAMES,
      description: 'Which brand to render.',
    },
    tone: {
      control: 'select',
      options: ['original', 'neutral'],
      description: 'Color treatment. Falls back to whichever tone actually has artwork.',
    },
  },
} satisfies Meta<typeof SocialIcon>;

export default meta;

export const Basic: StoryFn<SocialIconProps> = args => <SocialIcon {...args} />;

Basic.args = {
  name: 'slack',
  tone: 'original',
  size: 'xl',
};

export const AllBrands: StoryFn = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 16 }}>
    {ALL_NAMES.map(name => (
      <VStack key={name} gap={4} align='center'>
        <SocialIcon name={name} size='xl' />
        <Text size='xs' color='secondary'>
          {name}
        </Text>
      </VStack>
    ))}
  </div>
);

export const NeutralTone: StoryFn = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 16 }}>
    {ALL_NAMES.map(name => (
      <VStack key={name} gap={4} align='center'>
        <SocialIcon name={name} tone='neutral' size='xl' />
        <Text size='xs' color='secondary'>
          {name}
        </Text>
      </VStack>
    ))}
  </div>
);
