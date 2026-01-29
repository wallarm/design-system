import { BadgeColorEnum } from './constants';
import type { BadgeColor, BadgeType } from './types';

interface ColorVariant {
  type: BadgeType;
  color: BadgeColor;
  muted?: boolean;
  className: string;
}

interface ColorClassesMap {
  solid: string;
  solidMuted?: string;
  secondary: string;
  secondaryMuted?: string;
  outline: string;
  outlineMuted?: string;
  text: string;
  textMuted?: string;
  textColor: string;
  textColorMuted?: string;
}

export const badgeColorsMuted: BadgeColor[] = [
  BadgeColorEnum.Slate,
  BadgeColorEnum.Gray,
  BadgeColorEnum.Zinc,
  BadgeColorEnum.Neutral,
  BadgeColorEnum.Stone,
];

/**
 * Generates all compound variants for badge colors and types
 * Uses a static class map to ensure Tailwind can detect all classes
 */
export const generateBadgeVariants = (): ColorVariant[] => {
  // Static class map for each color - this ensures Tailwind can detect all classes
  const colorClassMap: Record<BadgeColor, ColorClassesMap> = {
    // Colors with muted support
    slate: {
      solid: 'bg-badge-slate-strong text-badge-on-solid',
      solidMuted: 'bg-badge-slate-dark-alt text-badge-on-solid',
      secondary: 'bg-badge-slate-light text-badge-slate-dark',
      secondaryMuted: 'bg-badge-slate-light text-badge-slate-muted',
      outline: 'border-badge-slate-dark text-badge-slate-dark',
      outlineMuted: 'border-badge-slate-muted text-badge-slate-muted',
      text: 'text-badge-label-primary [&_svg]:text-badge-slate-strong before:bg-badge-slate-strong',
      textMuted:
        'text-badge-label-primary [&_svg]:text-badge-slate-muted before:bg-badge-slate-muted',
      textColor: 'text-badge-slate-strong',
      textColorMuted: 'text-badge-slate-muted',
    },
    gray: {
      solid: 'bg-badge-gray-strong text-badge-on-solid',
      solidMuted: 'bg-badge-gray-dark-alt text-badge-on-solid',
      secondary: 'bg-badge-gray-light text-badge-gray-dark',
      secondaryMuted: 'bg-badge-gray-light text-badge-gray-muted',
      outline: 'border-badge-gray-dark text-badge-gray-dark',
      outlineMuted: 'border-badge-gray-muted text-badge-gray-muted',
      text: 'text-badge-label-primary [&_svg]:text-badge-gray-strong before:bg-badge-gray-strong',
      textMuted:
        'text-badge-label-primary [&_svg]:text-badge-gray-muted before:bg-badge-gray-muted',
      textColor: 'text-badge-gray-strong',
      textColorMuted: 'text-badge-gray-muted',
    },
    zinc: {
      solid: 'bg-badge-zinc-strong text-badge-on-solid',
      solidMuted: 'bg-badge-zinc-dark-alt text-badge-on-solid',
      secondary: 'bg-badge-zinc-light text-badge-zinc-dark',
      secondaryMuted: 'bg-badge-zinc-light text-badge-zinc-muted',
      outline: 'border-badge-zinc-dark text-badge-zinc-dark',
      outlineMuted: 'border-badge-zinc-muted text-badge-zinc-muted',
      text: 'text-badge-label-primary [&_svg]:text-badge-zinc-strong before:bg-badge-zinc-strong',
      textMuted:
        'text-badge-label-primary [&_svg]:text-badge-zinc-muted before:bg-badge-zinc-muted',
      textColor: 'text-badge-zinc-strong',
      textColorMuted: 'text-badge-zinc-muted',
    },
    neutral: {
      solid: 'bg-badge-neutral-strong text-badge-on-solid',
      solidMuted: 'bg-badge-neutral-dark-alt text-badge-on-solid',
      secondary: 'bg-badge-neutral-light text-badge-neutral-dark',
      secondaryMuted: 'bg-badge-neutral-light text-badge-neutral-muted',
      outline: 'border-badge-neutral-dark text-badge-neutral-dark',
      outlineMuted: 'border-badge-neutral-muted text-badge-neutral-muted',
      text: 'text-badge-label-primary [&_svg]:text-badge-neutral-strong before:bg-badge-neutral-strong',
      textMuted:
        'text-badge-label-primary [&_svg]:text-badge-neutral-muted before:bg-badge-neutral-muted',
      textColor: 'text-badge-neutral-strong',
      textColorMuted: 'text-badge-neutral-muted',
    },
    stone: {
      solid: 'bg-badge-stone-strong text-badge-on-solid',
      solidMuted: 'bg-badge-stone-dark-alt text-badge-on-solid',
      secondary: 'bg-badge-stone-light text-badge-stone-dark',
      secondaryMuted: 'bg-badge-stone-light text-badge-stone-muted',
      outline: 'border-badge-stone-dark text-badge-stone-dark',
      outlineMuted: 'border-badge-stone-muted text-badge-stone-muted',
      text: 'text-badge-label-primary [&_svg]:text-badge-stone-strong before:bg-badge-stone-strong',
      textMuted:
        'text-badge-label-primary [&_svg]:text-badge-stone-muted before:bg-badge-stone-muted',
      textColor: 'text-badge-stone-strong',
      textColorMuted: 'text-badge-stone-muted',
    },
    // Colors without muted support
    red: {
      solid: 'bg-badge-red-strong text-badge-on-solid',
      secondary: 'bg-badge-red-light text-badge-red-dark',
      outline: 'border-badge-red-dark text-badge-red-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-red-strong before:bg-badge-red-strong',
      textColor: 'text-badge-red-strong',
    },
    'w-orange': {
      solid: 'bg-badge-w-orange-strong text-badge-on-solid',
      secondary: 'bg-badge-w-orange-light text-badge-w-orange-dark',
      outline: 'border-badge-w-orange-dark text-badge-w-orange-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-w-orange-strong before:bg-badge-w-orange-strong',
      textColor: 'text-badge-w-orange-strong',
    },
    amber: {
      solid: 'bg-badge-amber-strong text-badge-on-solid',
      secondary: 'bg-badge-amber-light text-badge-amber-dark',
      outline: 'border-badge-amber-dark text-badge-amber-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-amber-strong before:bg-badge-amber-strong',
      textColor: 'text-badge-amber-strong',
    },
    yellow: {
      solid: 'bg-badge-yellow-strong text-badge-on-solid',
      secondary: 'bg-badge-yellow-light text-badge-yellow-dark',
      outline: 'border-badge-yellow-dark text-badge-yellow-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-yellow-strong before:bg-badge-yellow-strong',
      textColor: 'text-badge-yellow-strong',
    },
    lime: {
      solid: 'bg-badge-lime-strong text-badge-on-solid',
      secondary: 'bg-badge-lime-light text-badge-lime-dark',
      outline: 'border-badge-lime-dark text-badge-lime-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-lime-strong before:bg-badge-lime-strong',
      textColor: 'text-badge-lime-strong',
    },
    green: {
      solid: 'bg-badge-green-strong text-badge-on-solid',
      secondary: 'bg-badge-green-light text-badge-green-dark',
      outline: 'border-badge-green-dark text-badge-green-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-green-strong before:bg-badge-green-strong',
      textColor: 'text-badge-green-strong',
    },
    emerald: {
      solid: 'bg-badge-emerald-strong text-badge-on-solid',
      secondary: 'bg-badge-emerald-light text-badge-emerald-dark',
      outline: 'border-badge-emerald-dark text-badge-emerald-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-emerald-strong before:bg-badge-emerald-strong',
      textColor: 'text-badge-emerald-strong',
    },
    teal: {
      solid: 'bg-badge-teal-strong text-badge-on-solid',
      secondary: 'bg-badge-teal-light text-badge-teal-dark',
      outline: 'border-badge-teal-dark text-badge-teal-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-teal-strong before:bg-badge-teal-strong',
      textColor: 'text-badge-teal-strong',
    },
    cyan: {
      solid: 'bg-badge-cyan-strong text-badge-on-solid',
      secondary: 'bg-badge-cyan-light text-badge-cyan-dark',
      outline: 'border-badge-cyan-dark text-badge-cyan-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-cyan-strong before:bg-badge-cyan-strong',
      textColor: 'text-badge-cyan-strong',
    },
    sky: {
      solid: 'bg-badge-sky-strong text-badge-on-solid',
      secondary: 'bg-badge-sky-light text-badge-sky-dark',
      outline: 'border-badge-sky-dark text-badge-sky-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-sky-strong before:bg-badge-sky-strong',
      textColor: 'text-badge-sky-strong',
    },
    blue: {
      solid: 'bg-badge-blue-strong text-badge-on-solid',
      secondary: 'bg-badge-blue-light text-badge-blue-dark',
      outline: 'border-badge-blue-dark text-badge-blue-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-blue-strong before:bg-badge-blue-strong',
      textColor: 'text-badge-blue-strong',
    },
    indigo: {
      solid: 'bg-badge-indigo-strong text-badge-on-solid',
      secondary: 'bg-badge-indigo-light text-badge-indigo-dark',
      outline: 'border-badge-indigo-dark text-badge-indigo-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-indigo-strong before:bg-badge-indigo-strong',
      textColor: 'text-badge-indigo-strong',
    },
    violet: {
      solid: 'bg-badge-violet-strong text-badge-on-solid',
      secondary: 'bg-badge-violet-light text-badge-violet-dark',
      outline: 'border-badge-violet-dark text-badge-violet-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-violet-strong before:bg-badge-violet-strong',
      textColor: 'text-badge-violet-strong',
    },
    fuchsia: {
      solid: 'bg-badge-fuchsia-strong text-badge-on-solid',
      secondary: 'bg-badge-fuchsia-light text-badge-fuchsia-dark',
      outline: 'border-badge-fuchsia-dark text-badge-fuchsia-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-fuchsia-strong before:bg-badge-fuchsia-strong',
      textColor: 'text-badge-fuchsia-strong',
    },
    pink: {
      solid: 'bg-badge-pink-strong text-badge-on-solid',
      secondary: 'bg-badge-pink-light text-badge-pink-dark',
      outline: 'border-badge-pink-dark text-badge-pink-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-pink-strong before:bg-badge-pink-strong',
      textColor: 'text-badge-pink-strong',
    },
    rose: {
      solid: 'bg-badge-rose-strong text-badge-on-solid',
      secondary: 'bg-badge-rose-light text-badge-rose-dark',
      outline: 'border-badge-rose-dark text-badge-rose-dark',
      text: 'text-badge-label-primary [&_svg]:text-badge-rose-strong before:bg-badge-rose-strong',
      textColor: 'text-badge-rose-strong',
    },
  } as const;

  const variants: ColorVariant[] = [];

  // Helper function to create a variant
  const createVariant = (
    type: BadgeType,
    color: BadgeColor,
    className: string,
    muted: boolean = false,
  ): ColorVariant => ({
    type,
    color,
    muted,
    className,
  });

  // Process colors with muted support
  badgeColorsMuted.forEach((color) => {
    const classes = colorClassMap[color];

    // Solid variants
    variants.push(createVariant('solid', color, classes.solid, false));
    variants.push(
      createVariant('solid', color, classes.solidMuted ?? '', true),
    );

    // Secondary variants
    variants.push(createVariant('secondary', color, classes.secondary, false));
    variants.push(
      createVariant('secondary', color, classes.secondaryMuted ?? '', true),
    );

    // Outline variants
    variants.push(createVariant('outline', color, classes.outline, false));
    variants.push(
      createVariant('outline', color, classes.outlineMuted ?? '', true),
    );

    // Text variants
    variants.push(createVariant('text', color, classes.text, false));
    variants.push(createVariant('text', color, classes.textMuted ?? '', true));

    // Text-color variants
    variants.push(createVariant('text-color', color, classes.textColor, false));
    variants.push(
      createVariant('text-color', color, classes.textColorMuted ?? '', true),
    );
  });

  // Process colors without muted support
  const colorsWithoutMuted: BadgeColor[] = [
    BadgeColorEnum.Red,
    BadgeColorEnum.WOrange,
    BadgeColorEnum.Amber,
    BadgeColorEnum.Yellow,
    BadgeColorEnum.Lime,
    BadgeColorEnum.Green,
    BadgeColorEnum.Emerald,
    BadgeColorEnum.Teal,
    BadgeColorEnum.Cyan,
    BadgeColorEnum.Sky,
    BadgeColorEnum.Blue,
    BadgeColorEnum.Indigo,
    BadgeColorEnum.Violet,
    BadgeColorEnum.Fuchsia,
    BadgeColorEnum.Pink,
    BadgeColorEnum.Rose,
  ];

  colorsWithoutMuted.forEach((color) => {
    const classes = colorClassMap[color];

    variants.push(createVariant('solid', color, classes.solid));
    variants.push(createVariant('secondary', color, classes.secondary));
    variants.push(createVariant('outline', color, classes.outline));
    variants.push(createVariant('text', color, classes.text));
    variants.push(createVariant('text-color', color, classes.textColor));
  });

  return variants;
};
