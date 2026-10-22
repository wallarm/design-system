import { NumericBadge } from '@wallarm-org/design-system';

export const a = (
  <>
    <NumericBadge type={t} />
    <NumericBadge type='brand' color='red' />
    <NumericBadge {...p} />
    <NumericBadge type="primary" {...p} />
  </>
);
