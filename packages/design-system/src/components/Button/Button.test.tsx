import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Attribute pass-through', () => {
  it('forwards arbitrary data-* to the click target', () => {
    render(<Button data-analytics-id='TEST_ID'>Click</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('data-analytics-id', 'TEST_ID');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'host', mode: 'delete', count: 3 });

    render(
      <Button data-analytics-id='HOST_DELETE_SUBMIT' data-analytics-props={payload}>
        Delete
      </Button>,
    );

    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('data-analytics-id', 'HOST_DELETE_SUBMIT');
    expect(btn).toHaveAttribute('data-analytics-props', payload);
  });

  it('does not let {...rest} fight type/disabled defaults', () => {
    render(
      <Button disabled data-analytics-id='X'>
        Click
      </Button>,
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('data-analytics-id', 'X');
  });

  it('reaches the polymorphic target when as="a"', () => {
    render(
      <Button as='a' href='/docs' data-analytics-id='LINK_NAV'>
        Docs
      </Button>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('data-analytics-id', 'LINK_NAV');
  });

  it('reaches the asChild target', () => {
    render(
      <Button asChild>
        <a href='/docs' data-analytics-id='CHILD_NAV'>
          Docs
        </a>
      </Button>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('data-analytics-id', 'CHILD_NAV');
  });
});
