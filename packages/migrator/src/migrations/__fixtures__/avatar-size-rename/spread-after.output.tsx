import { Avatar } from '@wallarm-org/design-system';

export const a = <Avatar /* @wds-migration(avatar-size-rename): Avatar size was renamed (xs -> md, sm -> lg; new sm is 20px): spread props after size may override it with an old value, review manually */ size='md' {...p} />;
