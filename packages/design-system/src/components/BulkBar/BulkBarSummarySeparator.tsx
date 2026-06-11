import type { FC } from 'react';
import { Text } from '../Text';

/**
 * Decorative middot between summary actions. No interactive role and no
 * accessible content — screen readers should skip it. Place it inside an
 * `<HStack gap={6}>` together with the surrounding action links to keep
 * "Select all · Clear" reading as a single grouped phrase.
 */
export const BulkBarSummarySeparator: FC = () => (
  <Text
    size='sm'
    color='tertiary-alt'
    weight='medium'
    aria-hidden='true'
    data-slot='bulk-bar-summary-separator'
  >
    ·
  </Text>
);

BulkBarSummarySeparator.displayName = 'BulkBarSummarySeparator';
