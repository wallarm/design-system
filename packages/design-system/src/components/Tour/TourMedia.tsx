import type { FC, ReactNode } from 'react';
import { useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

export interface TourMediaProps {
  children?: ReactNode;
  className?: string;
}

const VIDEO_RE = /\.(mp4|webm|ogg)$/i;

const mediaVariants = cva('w-full overflow-clip', {
  variants: {
    type: {
      dialog: 'shrink-0',
      tooltip: '',
    },
  },
});

export const TourMedia: FC<TourMediaProps> = ({ children, className }) => {
  const { step } = useTourContext();
  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';
  const src = step?.meta?.mediaSrc as string | undefined;
  const alt = (step?.meta?.mediaAlt as string) ?? '';

  if (!src && !children) return null;

  const isVideo = src && VIDEO_RE.test(src);

  return (
    <div className={cn(mediaVariants({ type }), className)}>
      {src ? (
        isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className='block w-full h-auto rounded-12'
          />
        ) : (
          <img src={src} alt={alt} className='block w-full h-auto' />
        )
      ) : (
        children
      )}
    </div>
  );
};

TourMedia.displayName = 'TourMedia';
