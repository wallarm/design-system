import { fireEvent, screen } from '@testing-library/react';

export const makeFile = (name = 'policy.wasm', size = 3, type = 'application/wasm') =>
  new File(['x'.repeat(size)], name, { type });

export const hiddenInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>(
    '[data-slot="file-upload-hidden-input"]',
  ) as HTMLInputElement;

// Ark listens to `input` (not `change`) on the hidden input — verified under jsdom.
export const pick = (container: HTMLElement, ...files: File[]) =>
  fireEvent.input(hiddenInput(container), { target: { files } });

export const byTestId = (id: string) => screen.getByTestId(id);
export const queryByTestId = (id: string) => screen.queryByTestId(id);
