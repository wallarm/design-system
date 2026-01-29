import { useMemo } from 'react';

import { type ToastCreateOptions, toaster } from './Toaster';

export type CreateToastOptions = ToastCreateOptions;

export type UpdateToastOptions = { id: string } & Partial<ToastCreateOptions>;

export interface DismissToastOptions {
  id?: string;
}

export interface UseToastReturn {
  create: (options: CreateToastOptions) => string;
  update: (options: UpdateToastOptions) => string;
  dismiss: (options?: DismissToastOptions) => void;
}

export const useToast = (): UseToastReturn => {
  return useMemo(
    () => ({
      create: (options: CreateToastOptions) => toaster.create(options),
      update: ({ id, ...options }: UpdateToastOptions) =>
        toaster.update(
          id,
          options as unknown as Parameters<typeof toaster.update>[1],
        ),
      dismiss: (options: DismissToastOptions = {}) =>
        toaster.dismiss(options.id),
    }),
    [],
  );
};

useToast.displayName = 'useToast';
