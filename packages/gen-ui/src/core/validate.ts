import * as z from 'zod';

/** The fields' `validate` messages, and the text constraints Input and Textarea take. */

export const REQUIRED = 'Required';

/** `pattern` must match the whole value, as in HTML's `pattern` attribute. */
const fullMatch = (pattern: string) => new RegExp(`^(?:${pattern})$`, 'u');

const isRegex = (pattern: string) => {
  try {
    fullMatch(pattern);
    return true;
  } catch {
    return false;
  }
};

export const textRules = {
  minLength: z.number().int().min(1).optional(),
  maxLength: z.number().int().min(1).optional(),
  pattern: z
    .string()
    .refine(isRegex, 'not a valid regular expression')
    .optional()
    .describe('A regular expression the whole value must match, e.g. "[a-z0-9-]+"'),
  patternMessage: z.string().optional().describe('The error shown when pattern fails'),
};

interface TextProps {
  value?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

/** An empty value fails only `required`; the other constraints check what was typed. */
export const textError = (p: TextProps) => {
  if (!p.value?.trim()) return p.required ? REQUIRED : undefined;
  if (p.minLength !== undefined && p.value.length < p.minLength)
    return `At least ${p.minLength} characters`;
  if (p.maxLength !== undefined && p.value.length > p.maxLength)
    return `At most ${p.maxLength} characters`;
  if (p.pattern !== undefined && !fullMatch(p.pattern).test(p.value))
    return p.patternMessage ?? "Doesn't match the expected format";
  return undefined;
};

/**
 * A missing value fails only `required`; then the bounds. Works for numbers and for ISO dates and
 * "HH:MM" times, which compare in order as strings.
 */
export const rangeError = <T extends number | string>(
  p: { value?: T; required?: boolean; min?: T; max?: T },
  [below, above] = ['At least', 'At most'],
) => {
  if (p.value === undefined || p.value === '') return p.required ? REQUIRED : undefined;
  if (p.min !== undefined && p.value < p.min) return `${below} ${p.min}`;
  if (p.max !== undefined && p.value > p.max) return `${above} ${p.max}`;
  return undefined;
};

/** For dates and times: "Not before 2026-11-01". */
export const NOT_BEFORE_AFTER: [string, string] = ['Not before', 'Not after'];
