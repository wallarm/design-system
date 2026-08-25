import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { HStack, VStack } from '../components/Stack';
import { Text } from '../components/Text';

const DESCRIPTION = [
  'Geist Pixel is the decorative typeface. Use it for empty states, and for moments that want personality rather than information.',
  'There is no `Pixel` component. Pixel type is composed from the `font-pixel` utility plus the shared `text-*` size utilities, so the steps below are conventions rather than a component API. The only place it ships today is `EmptyStateTitle` at the `collection-empty` scale, at 16/24 — the compact `no-results` title is sans, not pixel.',
  'One cut only: Square at regular weight. There is no light or bold, so `font-bold` on pixel type renders as a browser-synthesized fake — emphasis has to come from size or colour, never from weight.',
  'Not for UI copy, labels, or anything read at length; that is the text ramp. Keep it to short strings, where the blocky letterforms stay legible.',
].join('\n\n');

const meta = {
  title: 'Typography/Pixel',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta;

export default meta;

type PixelStep = {
  /** Name of the matching text style in Figma. */
  token: string;
  /** Utilities that reproduce it — note lg is 16px, so it maps to text-base. */
  utilities: string;
  /** Size / leading in px. */
  metrics: string;
};

const STEPS: PixelStep[] = [
  { token: 'pixel-3xl', utilities: 'font-pixel text-3xl', metrics: '30 / 36' },
  { token: 'pixel-2xl', utilities: 'font-pixel text-2xl', metrics: '24 / 32' },
  { token: 'pixel-xl', utilities: 'font-pixel text-xl', metrics: '20 / 28' },
  { token: 'pixel-lg', utilities: 'font-pixel text-base', metrics: '16 / 24' },
];

/**
 * The four sanctioned steps, with the Figma token beside each. Only one ships today —
 * `EmptyStateTitle` at 16 on 24 — so treat the rest as available rather than established.
 */
export const Scale: StoryFn<typeof meta> = () => (
  <VStack gap={32} align='start'>
    {STEPS.map(({ token, utilities, metrics }) => (
      <VStack key={token} gap={8} align='start'>
        <HStack gap={12} align='baseline'>
          <Text size='sm' weight='medium'>
            {token}
          </Text>
          <Text size='xs' color='secondary'>
            {metrics} · {utilities}
          </Text>
        </HStack>
        <span className={`${utilities} text-text-primary`}>The quick brown fox</span>
      </VStack>
    ))}
  </VStack>
);

/**
 * One cut only, Square at regular weight. `font-bold` on pixel type renders as a
 * browser-synthesised fake, so emphasis has to come from size or colour and never from weight.
 */
export const Decorative: StoryFn<typeof meta> = () => (
  <VStack gap={40} align='start'>
    <VStack gap={12} align='start'>
      <Text size='xs' color='secondary'>
        What it is for — a short, decorative line carrying the personality
      </Text>
      <span className='font-pixel text-base text-text-primary'>No attacks detected</span>
    </VStack>

    <VStack gap={12} align='start'>
      <Text size='xs' color='secondary'>
        What it is not for — running copy belongs to the text ramp
      </Text>
      <Text size='sm' color='secondary' className='max-w-100'>
        Wallarm did not find any attacks in the selected period. Try widening the time range, or
        check that the filters above are not excluding traffic you expect to see.
      </Text>
    </VStack>
  </VStack>
);
