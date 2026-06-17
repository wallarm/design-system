import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Link } from './Link';

describe('Attribute pass-through', () => {
  it('forwards arbitrary data-* to the <a>', () => {
    render(
      <Link href='/docs' data-analytics-id='NAV_DOCS'>
        Docs
      </Link>,
    );

    expect(screen.getByRole('link', { name: /docs/i })).toHaveAttribute(
      'data-analytics-id',
      'NAV_DOCS',
    );
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'nav', target: 'docs' });

    render(
      <Link href='/docs' data-analytics-id='NAV_DOCS' data-analytics-props={payload}>
        Docs
      </Link>,
    );

    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('data-analytics-id', 'NAV_DOCS');
    expect(a).toHaveAttribute('data-analytics-props', payload);
  });

  it('keeps href / disabled semantics alongside {...rest}', () => {
    render(
      <Link href='/docs' disabled data-analytics-id='X'>
        Docs
      </Link>,
    );

    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('href', '/docs');
    expect(a).toHaveAttribute('aria-disabled', 'true');
    expect(a).toHaveAttribute('data-analytics-id', 'X');
  });

  it('reaches the asChild target', () => {
    render(
      <Link asChild>
        <a href='/docs' data-analytics-id='CHILD_LINK'>
          Docs
        </a>
      </Link>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('data-analytics-id', 'CHILD_LINK');
  });
});
