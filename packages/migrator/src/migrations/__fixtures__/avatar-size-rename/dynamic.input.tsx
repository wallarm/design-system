import { Avatar } from '@wallarm-org/design-system';

export const a = (
  <>
    <Avatar size={size} />
    <Avatar size={big ? 'sm' : 'xs'} />
    <Avatar {...props} />
  </>
);
