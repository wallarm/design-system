import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SCENARIOS } from '../fixtures';
import { GenUiPlayground } from '../playground';

describe('GenUiPlayground', () => {
  it('lists every prompt, plays the first, and switches on a click', async () => {
    render(<GenUiPlayground scenarios={SCENARIOS} />);
    const prompts = screen.getByRole('group', { name: 'Prompts' });
    const buttons = [...prompts.querySelectorAll('button')];
    expect(buttons.map(b => b.textContent)).toEqual(SCENARIOS.map(s => s.prompt));
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('true');

    const second = buttons[1];
    if (!second) throw new Error('expected two prompts');
    await userEvent.click(second);
    expect(second.getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false');
  });

  it('hides and shows the stream panel', async () => {
    render(<GenUiPlayground scenarios={SCENARIOS} />);
    expect(screen.getByRole('complementary', { name: 'Stream' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Stream' }));
    expect(screen.queryByRole('complementary', { name: 'Stream' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Stream' }));
    expect(screen.getByRole('complementary', { name: 'Stream' })).toBeTruthy();
  });
});
