import userEvent from '@testing-library/user-event';

/**
 * Types into a number input one key per animation frame. Ark's number input writes its value and
 * caret back on the next frame, so a key typed before that frame lands is overwritten or moved:
 * a person never types that fast, a loaded CI runner does.
 */
export const typeNumber = async (input: HTMLElement, text: string) => {
  await userEvent.click(input);
  for (const key of text) {
    await userEvent.keyboard(key);
    await new Promise(requestAnimationFrame);
  }
};
