import { Avatar } from '@wallarm-org/design-system';

export const literals = (
  <>
    <Avatar size='md' />
    <Avatar size='lg' />
    <Avatar size="lg" />
    <Avatar size={'md'}>x</Avatar>
    <Avatar size={`lg`} />
    <Avatar {...p} size='md' />
  </>
);

// One pass, not chained: sm -> lg, never xs -> md -> lg.
export const onePass = (
  <>
    <Avatar size='md' />
    <Avatar size='lg' />
  </>
);

export const unchanged = (
  <>
    <Avatar size='md' />
    <Avatar size='lg' />
    <Avatar />
  </>
);
