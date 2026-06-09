import figma from '@figma/code-connect';
import { Button } from '../Button';
import { Banner } from './Banner';
import { BannerClose } from './BannerClose';
import { BannerContent } from './BannerContent';
import { BannerControls } from './BannerControls';
import { BannerDescription } from './BannerDescription';
import { BannerIcon } from './BannerIcon';
import { BannerLink } from './BannerLink';
import { BannerTitle } from './BannerTitle';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=7688-3741';

const typeToVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
  Destructive: 'destructive',
  Info: 'info',
  Warning: 'warning',
} as const;

figma.connect(Banner, figmaNodeUrl, {
  props: {
    variant: figma.enum('Type', typeToVariant),
    leftIcon: figma.boolean('leftIcon'),
    description: figma.boolean('description'),
    inlineAction: figma.boolean('inlineAction'),
    rightActions: figma.boolean('rightActions'),
    closable: figma.boolean('closable'),
    title: figma.string('title'),
    text: figma.string('text'),
  },
  example: ({
    variant,
    leftIcon,
    description,
    inlineAction,
    rightActions,
    closable,
    title,
    text,
  }) => (
    <Banner variant={variant}>
      {leftIcon && <BannerIcon />}
      <BannerContent>
        <BannerTitle action={inlineAction && <BannerLink href='#'>Link</BannerLink>}>
          {title}
        </BannerTitle>
        {description && <BannerDescription>{text}</BannerDescription>}
      </BannerContent>
      {(rightActions || closable) && (
        <BannerControls>
          {rightActions && (
            <>
              <Button variant='secondary' color='neutral' size='small'>
                Button
              </Button>
              <Button variant='secondary' color='neutral' size='small'>
                Button
              </Button>
            </>
          )}
          {closable && <BannerClose />}
        </BannerControls>
      )}
    </Banner>
  ),
});
