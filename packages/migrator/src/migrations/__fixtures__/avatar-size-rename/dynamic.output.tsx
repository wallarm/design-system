import { Avatar } from '@wallarm-org/design-system';

export const a = (
  <>
    <Avatar /* @wds-migration(avatar-size-rename): Avatar size was renamed (xs -> md, sm -> lg; new sm is 20px): non-static value, review manually */ size={size} />
    <Avatar /* @wds-migration(avatar-size-rename): Avatar size was renamed (xs -> md, sm -> lg; new sm is 20px): non-static value, review manually */ size={big ? 'sm' : 'xs'} />
    <Avatar /* @wds-migration(avatar-size-rename): Avatar size was renamed (xs -> md, sm -> lg; new sm is 20px): size may come from spread props, review manually */ {...props} />
  </>
);
