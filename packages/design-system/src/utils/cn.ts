import { type ClassArray, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassArray): string => {
  return twMerge(clsx(inputs));
};
