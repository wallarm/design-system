import type { FC } from 'react';
import { SvgIcon, type SvgIconProps } from '../SvgIcon';
import { socialIconPaths } from './paths';
import type { SocialIconName, SocialIconTone } from './types';

export interface SocialIconProps extends Omit<SvgIconProps, 'children'> {
  name: SocialIconName;
  tone?: SocialIconTone;
}

export const SocialIcon: FC<SocialIconProps> = ({ name, tone = 'original', ...props }) => {
  const variants = socialIconPaths[name];
  // A few brands only have artwork for one tone (e.g. 'aws'/'onlyfans' have no
  // neutral art; 'instagram' has no vector original in Figma, only neutral) —
  // fall back to whichever tone actually exists.
  const content = variants[tone] ?? variants.original ?? variants.neutral;

  return (
    <SvgIcon {...props} viewBox='0 0 24 24' data-slot='social-icon'>
      {content}
    </SvgIcon>
  );
};

SocialIcon.displayName = 'SocialIcon';
