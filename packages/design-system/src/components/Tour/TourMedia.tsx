import type { FC, ReactNode } from 'react';
import { useTourContext } from '@ark-ui/react';
import { cn } from '../../utils/cn';

export interface TourMediaProps {
  children?: ReactNode;
  className?: string;
}

const VIDEO_RE = /\.(mp4|webm|ogg)$/i;

export const TourMedia: FC<TourMediaProps> = ({ children, className }) => {
  const { step } = useTourContext();
  const isDialog = step?.type === 'dialog';
  const src = step?.meta?.mediaSrc as string | undefined;
  const alt = (step?.meta?.mediaAlt as string) ?? '';

  if (!src && !children) return null;

  const isVideo = src && VIDEO_RE.test(src);

  return (
    <div className={cn('w-full overflow-clip', isDialog && 'shrink-0', className)}>
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
