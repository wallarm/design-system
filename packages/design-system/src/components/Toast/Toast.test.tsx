import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from '@rstest/core';
import { act, render, screen } from '@testing-library/react';
import { Activity } from '../../icons';
import { AgentAvatar } from '../AgentAvatar';
import { AgentGlyph } from '../AgentGlyph';
import { Toaster, toaster } from './Toaster';

const show = (icon: ReactNode) => {
  render(<Toaster />);
  act(() => {
    toaster.create({ title: 'Done', type: 'info', icon, duration: Number.MAX_SAFE_INTEGER });
  });
};

describe('Toast icon', () => {
  it('injects the type colour and lg size into a plain icon', async () => {
    show(<Activity data-testid='icon' />);
    const icon = await screen.findByTestId('icon');
    expect(icon.getAttribute('class')).toContain('text-component-toast-ic-info');
    expect(icon.getAttribute('class')).toContain('icon-lg');
  });

  it.each<[string, string, ReactElement]>([
    [
      'AgentAvatar',
      'avatar',
      <AgentAvatar key='a' agent='radar' seed='radar' size={48} data-testid='avatar' />,
    ],
    ['AgentGlyph', 'glyph', <AgentGlyph key='g' agent='radar' size={20} data-testid='glyph' />],
  ])('keeps the size of an %s', async (_, testId, icon) => {
    const { unmount } = render(icon);
    const width = screen.getByTestId(testId).getAttribute('width');
    unmount();

    show(icon);
    expect((await screen.findByTestId(testId)).getAttribute('width')).toBe(width);
  });
});
