import { NumericBadge } from '@wallarm-org/design-system';

export const rows = (
  <>
    <NumericBadge type='primary'>3</NumericBadge>
    <NumericBadge type='primary-alt'>3</NumericBadge>
    <NumericBadge type='brand'>3</NumericBadge>
    <NumericBadge type='destructive'>3</NumericBadge>
    <NumericBadge type='outline'>3</NumericBadge>
    <NumericBadge type='info'>3</NumericBadge>
  </>
);

// color goes right after type, with the same quote char.
export const quotes = <NumericBadge type="brand" size="small">3</NumericBadge>;

export const braced = (
  <>
    <NumericBadge type={'brand'} />
    <NumericBadge type='info' />
  </>
);

export const template = <NumericBadge type={`brand`} />;

export const spreadBefore = <NumericBadge {...p} type="primary" />;

export const noType = <NumericBadge>3</NumericBadge>;
