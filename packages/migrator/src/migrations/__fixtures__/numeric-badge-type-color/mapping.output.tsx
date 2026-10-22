import { NumericBadge } from '@wallarm-org/design-system';

export const rows = (
  <>
    <NumericBadge type='secondary' color='neutral'>3</NumericBadge>
    <NumericBadge type='secondary' color='neutral-alt'>3</NumericBadge>
    <NumericBadge type='solid' color='brand'>3</NumericBadge>
    <NumericBadge type='solid' color='danger'>3</NumericBadge>
    <NumericBadge type='outline' color='neutral'>3</NumericBadge>
    <NumericBadge type='secondary' color='info'>3</NumericBadge>
  </>
);

// color goes right after type, with the same quote char.
export const quotes = <NumericBadge type="solid" color="brand" size="small">3</NumericBadge>;

export const braced = (
  <>
    <NumericBadge type={'solid'} color='brand' />
    <NumericBadge type='secondary' color='info' />
  </>
);

export const template = <NumericBadge type={`solid`} color='brand' />;

export const spreadBefore = <NumericBadge {...p} type="secondary" color="neutral" />;

export const noType = <NumericBadge>3</NumericBadge>;
