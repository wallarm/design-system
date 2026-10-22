import { NumericBadge } from '@wallarm-org/design-system';

export const a = (
  <>
    <NumericBadge /* @wds-migration(numeric-badge-type-color): NumericBadge type was split into type + color: non-static type, review manually */ type={t} />
    <NumericBadge /* @wds-migration(numeric-badge-type-color): NumericBadge type was split into type + color: already has color, review manually */ type='brand' color='red' />
    <NumericBadge /* @wds-migration(numeric-badge-type-color): NumericBadge type was split into type + color: type may come from spread props, review manually */ {...p} />
    <NumericBadge /* @wds-migration(numeric-badge-type-color): NumericBadge type was split into type + color: spread props after type may override it with an old value, review manually */ type="secondary" color="neutral" {...p} />
  </>
);
