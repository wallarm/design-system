import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('renders as password type by default', () => {
    render(<PasswordInput data-testid='pw' />);

    const group = screen.getByTestId('pw');
    const inputEl = group.querySelector('input') as HTMLInputElement;
    expect(inputEl.type).toBe('password');
  });

  it('toggles to text on eye click', async () => {
    const user = userEvent.setup();
    render(<PasswordInput data-testid='pw' />);

    const group = screen.getByTestId('pw');
    const inputEl = group.querySelector('input') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show password' });

    await user.click(toggle);
    expect(inputEl.type).toBe('text');
  });

  it('toggles back to password on second click', async () => {
    const user = userEvent.setup();
    render(<PasswordInput data-testid='pw' />);

    const group = screen.getByTestId('pw');
    const inputEl = group.querySelector('input') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show password' });

    await user.click(toggle);
    expect(inputEl.type).toBe('text');

    const toggleHide = screen.getByRole('button', { name: 'Hide password' });
    await user.click(toggleHide);
    expect(inputEl.type).toBe('password');
  });

  it('forwards error prop', () => {
    render(<PasswordInput data-testid='pw' error />);

    const group = screen.getByTestId('pw');
    const inputEl = group.querySelector('input') as HTMLInputElement;
    expect(inputEl).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards disabled prop', () => {
    render(<PasswordInput data-testid='pw' disabled />);

    const group = screen.getByTestId('pw');
    const inputEl = group.querySelector('input') as HTMLInputElement;
    expect(inputEl).toBeDisabled();

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toBeDisabled();
  });

  it('forwards placeholder', () => {
    render(<PasswordInput data-testid='pw' placeholder='Enter password' />);

    const group = screen.getByTestId('pw');
    const inputEl = group.querySelector('input') as HTMLInputElement;
    expect(inputEl).toHaveAttribute('placeholder', 'Enter password');
  });

  it('forwards data-testid to root element', () => {
    render(<PasswordInput data-testid='my-password' />);
    expect(screen.getByTestId('my-password')).toBeInTheDocument();
  });
});
