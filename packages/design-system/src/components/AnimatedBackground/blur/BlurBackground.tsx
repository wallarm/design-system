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

export interface BlurBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

const BLUR = 90;
const SPEED = 2;

export const BlurBackground: FC<BlurBackgroundProps> = ({
  ref,
  className,
  style,
  children,
  ...rest
}) => {
  const meshContent = (
    <div className='lg-mesh' style={{ '--lg-blur': BLUR } as CSSProperties}>
      {BLOBS.map(b => (
        <div
          key={b.name}
          className='lg-blob'
          style={{
            ...b.style,
            background: b.background,
            animationName: b.anim,
            animationDuration: `${b.base / SPEED}s`,
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
      {...rest}
      ref={ref}
      className={cn('lg-frame relative', className)}
      style={style}
    >
      <div aria-hidden='true' className='absolute inset-0 pointer-events-none'>
        {meshContent}
      </div>

      <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center'>
        <div className='pointer-events-auto'>{children}</div>
      </div>
    </div>
  );
};

BlurBackground.displayName = 'BlurBackground';
