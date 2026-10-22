import type { Migration } from '../lib/types';
import { migration as avatarSizeRename } from './avatar-size-rename';
import { migration as numericBadgeTypeColor } from './numeric-badge-type-color';

/** Ordered by the major version that introduced each migration (ascending). */
export const migrations: Migration[] = [numericBadgeTypeColor, avatarSizeRename];
