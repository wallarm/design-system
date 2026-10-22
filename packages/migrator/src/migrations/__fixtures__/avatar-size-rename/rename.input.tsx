import { Avatar } from '@wallarm-org/design-system';

export const literals = (
  <>
    <Avatar size='xs' />
    <Avatar size='sm' />
    <Avatar size="sm" />
    <Avatar size={'xs'}>x</Avatar>
    <Avatar size={`sm`} />
    <Avatar {...p} size='xs' />
  </>
);

// One pass, not chained: sm -> lg, never xs -> md -> lg.
export const onePass = (
  <>
    <Avatar size='xs' />
    <Avatar size='sm' />
  </>
);

export const unchanged = (
  <>
    <Avatar size='md' />
    <Avatar size='lg' />
    <Avatar />
  </>
);
