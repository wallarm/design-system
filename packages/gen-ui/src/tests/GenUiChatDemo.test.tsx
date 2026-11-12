import { afterEach, beforeEach, describe, expect, it, rstest } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GenUiChatDemo } from '../playground/GenUiChatDemo';
import { GEN_UI_FORMATS } from '../playground/useEmulatedAgent';

const LABELS: Record<string, string> = {
  a2ui: 'A2UI',
  express: 'Express',
  'json-render': 'json-render',
  openui: 'OpenUI',
};

describe('the chat demo answers in every format', () => {
  beforeEach(() => {
    rstest.useFakeTimers();
  });
  afterEach(() => {
    rstest.useRealTimers();
  });

  for (const format of GEN_UI_FORMATS) {
    it(`streams the answer as ${format} and asks before Block`, async () => {
      const error = rstest.spyOn(console, 'error');
      const view = render(<GenUiChatDemo />);
      fireEvent.click(screen.getByText(LABELS[format] ?? format));
      fireEvent.click(screen.getByText('Show attacks for the last 24 hours'));
      await act(() => rstest.advanceTimersByTimeAsync(30_000));

      expect(screen.getByText('Attacks in the last 24 hours')).toBeTruthy();
      expect(screen.getByText('/api/v1/auth/login')).toBeTruthy();
      expect(view.container.querySelector('[data-gen-ui-placeholder]')).toBeNull();

      fireEvent.click(screen.getByText('Block 3 source IPs'));
      await act(() => rstest.advanceTimersByTimeAsync(100));
      // The agent's action reached the app, which asks for approval before it acts.
      expect(view.container.textContent).toContain('Block 3 source IPs on all applications?');
      expect(error).not.toHaveBeenCalled();
      error.mockRestore();
    });
  }
});
