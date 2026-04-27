export const SEGMENT_VARIANT = {
  attribute: 'attribute',
  operator: 'operator',
  value: 'value',
} as const;

export type SegmentVariant = (typeof SEGMENT_VARIANT)[keyof typeof SEGMENT_VARIANT];
