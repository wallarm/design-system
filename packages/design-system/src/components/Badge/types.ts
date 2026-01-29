import type { BadgeColorEnum, BadgeTypeEnum } from './constants';

export type BadgeType = (typeof BadgeTypeEnum)[keyof typeof BadgeTypeEnum];

export type BadgeColor = (typeof BadgeColorEnum)[keyof typeof BadgeColorEnum];
