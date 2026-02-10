import type { CodeSnippetSize, LineColor, LineTextStyle } from '../CodeSnippetContext';

/**
 * Shared line color styles for CodeSnippet components.
 * Colors match Figma design with 6% opacity backgrounds.
 */
export const LINE_COLOR_STYLES: Record<LineColor, { border: string; bg: string; text: string }> = {
  danger: {
    border: 'border-syntax-highlight-error-indicator',
    bg: 'bg-syntax-highlight-error-highlight',
    text: 'text-syntax-highlight-error-code font-medium',
  },
  warning: {
    border: 'border-syntax-highlight-warning-indicator',
    bg: 'bg-syntax-highlight-warning-highlight',
    text: 'text-syntax-highlight-warning-code font-medium',
  },
  info: {
    border: 'border-syntax-highlight-info-indicator',
    bg: 'bg-syntax-highlight-info-highlight',
    text: 'text-syntax-highlight-info-code font-medium',
  },
  success: {
    border: 'border-syntax-highlight-success-indicator',
    bg: 'bg-syntax-highlight-success-highlight',
    text: 'text-syntax-highlight-success-code font-medium',
  },
  brand: {
    border: 'border-syntax-highlight-brand-indicator',
    bg: 'bg-syntax-highlight-brand-highlight',
    text: 'text-syntax-highlight-brand-code font-medium',
  },
  ai: {
    border: 'border-syntax-highlight-ai-indicator',
    bg: 'bg-syntax-highlight-ai-highlight',
    text: 'text-syntax-highlight-ai-code font-medium',
  },
  neutral: {
    border: 'border-syntax-highlight-neutral-indicator',
    bg: 'bg-syntax-highlight-neutral-highlight',
    text: 'text-syntax-highlight-neutral-code font-medium',
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
