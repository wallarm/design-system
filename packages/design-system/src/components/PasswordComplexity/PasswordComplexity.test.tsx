import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PasswordComplexity, type PasswordComplexityItem } from './PasswordComplexity';
import { passwordValidators } from './validators';

const items: PasswordComplexityItem[] = [
  { id: 'length', label: 'At least 8 characters', met: false },
  { id: 'uppercase', label: 'Contains uppercase', met: true },
];

describe('PasswordComplexity data-testid cascade', () => {
  it('derives sub-component testids from the root', () => {
    render(<PasswordComplexity data-testid='pwd' items={items} />);

    expect(screen.getByTestId('pwd')).toBeInTheDocument();
    expect(screen.getAllByTestId('pwd--item')).toHaveLength(2);
    expect(screen.getAllByTestId('pwd--item--icon')).toHaveLength(2);
  });

  it('renders no data-testid attributes when the root has none', () => {
    render(<PasswordComplexity items={items} />);

    expect(document.querySelector('[data-testid]')).toBeNull();
  });
});

describe('PasswordComplexity visual states', () => {
  it('renders Check icon for met items', () => {
    render(
      <PasswordComplexity data-testid='pwd' items={[{ id: 'length', label: 'Done', met: true }]} />,
    );

    const icon = screen.getByTestId('pwd--item--icon');
    expect(icon.querySelector('svg')).toBeInTheDocument();
    expect(icon.className).toContain('text-text-success');
  });

  it('renders Dot icon for unmet items', () => {
    render(
      <PasswordComplexity
        data-testid='pwd'
        items={[{ id: 'symbol', label: 'Pending', met: false }]}
      />,
    );

    const icon = screen.getByTestId('pwd--item--icon');
    expect(icon.querySelector('svg')).toBeInTheDocument();
    expect(icon.className).toContain('text-text-tertiary');
  });

  it('applies line-through to met item labels', () => {
    render(
      <PasswordComplexity data-testid='pwd' items={[{ id: 'length', label: 'Done', met: true }]} />,
    );

    const item = screen.getByTestId('pwd--item');
    const labels = item.querySelectorAll('span');
    // First span is ListIcon, second span is the label
    const label = labels[labels.length - 1];
    expect(label.className).toContain('line-through');
    expect(label.className).toContain('text-text-secondary');
  });

  it('does not apply line-through to unmet item labels', () => {
    render(
      <PasswordComplexity
        data-testid='pwd'
        items={[{ id: 'symbol', label: 'Pending', met: false }]}
      />,
    );

    const item = screen.getByTestId('pwd--item');
    const labels = item.querySelectorAll('span');
    const label = labels[labels.length - 1];
    expect(label.className).not.toContain('line-through');
    expect(label.className).toContain('text-text-primary');
  });
});

describe('PasswordComplexity semantics', () => {
  it('renders as a list with listitems', () => {
    render(<PasswordComplexity data-testid='pwd' items={items} />);

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('passwordValidators', () => {
  it('minLength returns a function that checks string length', () => {
    const check = passwordValidators.minLength(8);
    expect(check('short')).toBe(false);
    expect(check('longenough')).toBe(true);
    expect(check('exactly8')).toBe(true);
  });

  it('hasUppercase detects uppercase letters', () => {
    expect(passwordValidators.hasUppercase('abc')).toBe(false);
    expect(passwordValidators.hasUppercase('Abc')).toBe(true);
  });

  it('hasLowercase detects lowercase letters', () => {
    expect(passwordValidators.hasLowercase('ABC')).toBe(false);
    expect(passwordValidators.hasLowercase('ABc')).toBe(true);
  });

  it('hasNumber detects digits', () => {
    expect(passwordValidators.hasNumber('abc')).toBe(false);
    expect(passwordValidators.hasNumber('abc1')).toBe(true);
  });

  it('hasSymbol detects non-alphanumeric characters', () => {
    expect(passwordValidators.hasSymbol('abc123')).toBe(false);
    expect(passwordValidators.hasSymbol('abc!')).toBe(true);
  });

  it('passwordsMatch requires non-empty matching strings', () => {
    expect(passwordValidators.passwordsMatch('', '')).toBe(false);
    expect(passwordValidators.passwordsMatch('abc', 'def')).toBe(false);
    expect(passwordValidators.passwordsMatch('abc', 'abc')).toBe(true);
  });
});
