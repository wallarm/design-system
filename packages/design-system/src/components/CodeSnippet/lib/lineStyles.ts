import type { CodeSnippetSize, LineColor, LineTextStyle } from '../CodeSnippetContext';

/**
 * Shared line color styles for CodeSnippet components.
 * Colors match Figma design with 6% opacity backgrounds.
 */
export const LINE_COLOR_STYLES: Record<LineColor, { border: string; bg: string; text: string }> = {
  danger: {
    border: 'border-border-danger',
    bg: 'bg-bg-danger',
    text: 'text-text-danger font-medium',
  },
  warning: {
    border: 'border-border-warning',
    bg: 'bg-bg-warning',
    text: 'text-text-warning font-medium',
  },
  info: {
    border: 'border-border-info',
    bg: 'bg-bg-info',
    text: 'text-text-info font-medium',
  },
  success: {
    border: 'border-border-success',
    bg: 'bg-bg-success',
    text: 'text-text-success font-medium',
  },
  brand: {
    border: 'border-border-brand',
    bg: 'bg-bg-brand',
    text: 'text-text-brand font-medium',
  },
  ai: {
    border: 'border-border-ai',
    bg: 'bg-bg-ai',
    text: 'text-text-ai font-medium',
  },
  neutral: {
    border: 'border-border-primary',
    bg: 'bg-states-primary-hover',
    text: 'text-text-secondary font-medium',
  },
};

/**
 * Text style classes for line content.
 */
export const LINE_TEXT_STYLE_CLASSES: Record<LineTextStyle, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  italic: 'italic',
};

/**
 * Line height classes per size variant.
 * Matches Figma design typography specifications.
 */
export const SIZE_LINE_HEIGHT_CLASSES: Record<CodeSnippetSize, string> = {
  sm: 'leading-sm min-h-lh', // 20px for 12px font
  md: 'leading-sm min-h-lh', // 20px for 14px font
  lg: 'leading-sm min-h-lh', // 20px for 16px font
};
