import type { FC, HTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

type KbdGroupProps = HTMLAttributes<HTMLDivElement>;

export const KbdGroup: FC<KbdGroupProps> = (props) => (
  <kbd
    {...props}
    data-slot="kbd-group"
    className={cn('inline-flex items-center gap-1')}
  />
);

KbdGroup.displayName = 'KbdGroup';
