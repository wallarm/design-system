import type { CSSProperties, FC, HTMLAttributes, ReactNode, Ref } from 'react';

import { cn } from '../../../utils/cn';

interface BlobSpec {
  name: string;
  style: CSSProperties;
  background: string;
  anim: string;
  base: number;
}

const BLOBS: BlobSpec[] = [
  {
    name: 'b1-lavender-top',
    style: { width: '66%', height: '52%', left: '-8%', top: '-12%' },
    background: 'radial-gradient(circle at 50% 50%, #cdccda 0%, rgba(205,204,218,0) 68%)',
    anim: 'lg-f1',
    base: 37,
  },
  {
    name: 'b2-cream-right',
    style: { width: '56%', height: '78%', right: '-13%', top: '6%' },
    background: 'radial-gradient(circle at 50% 50%, #f6dba6 0%, rgba(246,219,166,0) 66%)',
    anim: 'lg-f2',
    base: 29,
  },
  {
    name: 'b3-peach-halo',
    style: { width: '78%', height: '64%', left: '10%', bottom: '-20%' },
    background: 'radial-gradient(circle at 50% 50%, #ffab70 0%, rgba(255,171,112,0) 68%)',
    anim: 'lg-f4',
    base: 31,
  },
  {
    name: 'b4-orange-core',
    style: { width: '60%', height: '48%', left: '22%', bottom: '-10%' },
    background:
      'radial-gradient(circle at 50% 50%, #ffb07e 0%, #ffc8a2 33%, rgba(255,200,162,0) 70%)',
    anim: 'lg-f3',
    base: 23,
  },
  {
    name: 'b5-cream-lower',
    style: { width: '60%', height: '56%', right: '-11%', bottom: '0%' },
    background: 'radial-gradient(circle at 50% 50%, #f9e2b4 0%, rgba(249,226,180,0) 66%)',
    anim: 'lg-f5',
    base: 41,
  },
  {
    name: 'b6-offwhite-center',
    style: { width: '76%', height: '62%', left: '13%', top: '24%' },
    background: 'radial-gradient(circle at 50% 50%, #f3eae0 0%, rgba(243,234,224,0) 70%)',
    anim: 'lg-f6',
    base: 43,
  },
];

// Figma chat-bg 67:1254 (Wally — AI Assistant): solid ellipses under a 70px blur on a 480×853
// panel, positions converted to percentages of that panel.
const CHAT_BLOBS: BlobSpec[] = [
  {
    name: 'b1-lavender-top',
    style: { width: '70%', height: '45%', left: '15%', top: '-15%' },
    background: '#d4d2dc',
    anim: 'lg-f1',
    base: 37,
  },
  {
    name: 'b2-cream-right',
    style: { width: '55%', height: '65%', left: '55%', top: '25%' },
    background: '#f5d8a0',
    anim: 'lg-f2',
    base: 29,
  },
  {
    name: 'b3-peach-mid',
    style: { width: '75%', height: '40%', left: '-5%', top: '35%' },
    background: '#f0cdb8',
    anim: 'lg-f6',
    base: 43,
  },
  {
    name: 'b4-orange-outer',
    style: { width: '55%', height: '40%', left: '15%', top: '55%' },
    background: '#ff8a3a',
    anim: 'lg-f4',
    base: 31,
  },
  {
    name: 'b6-cream-br',
    style: { width: '50%', height: '35%', left: '55%', top: '65%' },
    background: '#f8e0b0',
    anim: 'lg-f5',
    base: 41,
  },
  {
    name: 'b5-orange-core',
    style: { width: '35%', height: '22%', left: '28%', top: '73%' },
    background: '#ff5a08',
    anim: 'lg-f3',
    base: 23,
  },
];

export type BlurBackgroundPalette = 'default' | 'chat';

export interface BlurBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  /**
   * Blob colours and layout. `'chat'` is the Wally chat panel mesh (Figma chat-bg 67:1254),
   * tuned for a ~480px-wide panel and meant to be dimmed by the host (5–12% opacity).
   */
  palette?: BlurBackgroundPalette;
}

const BLUR = 90;
const SPEED = 2;
// The chat panel is small and dimmed, so the default pace reads as static there. The slowest blob
// (base 43) cycles in 2s, the rest a little faster (~1.1–2s), so they never move in lockstep.
const CHAT_SPEED = 21.5;

export const BlurBackground: FC<BlurBackgroundProps> = ({
  ref,
  className,
  style,
  children,
  palette = 'default',
  ...rest
}) => {
  const blobs = palette === 'chat' ? CHAT_BLOBS : BLOBS;
  const speed = palette === 'chat' ? CHAT_SPEED : SPEED;
  // Only set for non-default palettes so the default DOM stays byte-identical.
  const paletteAttr = palette === 'default' ? undefined : palette;
  const meshContent = (
    <div className='lg-mesh' style={{ '--lg-blur': BLUR } as CSSProperties}>
      {blobs.map(b => (
        <div
          key={b.name}
          className='lg-blob'
          style={{
            ...b.style,
            background: b.background,
            animationName: b.anim,
            animationDuration: `${b.base / speed}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );

  if (children == null) {
    return (
      <div
        data-slot='blur-background'
        data-palette={paletteAttr}
        {...rest}
        ref={ref}
        className={cn('lg-frame', className)}
        style={style}
        aria-hidden='true'
      >
        {meshContent}
      </div>
    );
  }

  return (
    <div
      data-slot='blur-background'
      data-palette={paletteAttr}
      {...rest}
      ref={ref}
      className={cn('lg-frame relative', className)}
      style={style}
    >
      <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
        {meshContent}
      </div>

      <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
        <div className='pointer-events-auto'>{children}</div>
      </div>
    </div>
  );
};

BlurBackground.displayName = 'BlurBackground';
