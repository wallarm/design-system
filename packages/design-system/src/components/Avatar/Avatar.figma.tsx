import figma from '@figma/code-connect';
import { Avatar, AvatarFallback, AvatarImage } from '.';

// WADS Components → App shell → user-avatar. Figma has only `Photo`; size is not a Figma prop.
const AVATAR_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12336-5504';

figma.connect(Avatar, AVATAR_URL, {
  variant: { Photo: 'On' },
  example: () => (
    <Avatar>
      <AvatarImage src='/me.png' />
      <AvatarFallback name='Ada Lovelace' />
    </Avatar>
  ),
});

figma.connect(Avatar, AVATAR_URL, {
  variant: { Photo: 'Off' },
  example: () => (
    <Avatar>
      <AvatarFallback />
    </Avatar>
  ),
});
