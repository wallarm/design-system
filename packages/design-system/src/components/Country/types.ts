import type { VariantProps } from 'class-variance-authority';
import type { countryVariants } from './Country';

export type Size = NonNullable<VariantProps<typeof countryVariants>['size']>;
