import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from './Textarea';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the <textarea>', () => {
    render(<Textarea data-testid='textarea' data-analytics-id='COMMENT_FIELD' />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('data-analytics-id', 'COMMENT_FIELD');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'rule', field: 'description' });

    render(
      <Textarea
        data-testid='textarea'
        data-analytics-id='COMMENT_FIELD'
        data-analytics-props={payload}
      />,
    );

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('data-analytics-id', 'COMMENT_FIELD');
    expect(textarea).toHaveAttribute('data-analytics-props', payload);
  });

  it('consumer attrs land on <textarea>, not the wrapper <div>', () => {
    const { container } = render(
      <Textarea data-testid='textarea' data-analytics-id='COMMENT_FIELD' />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper).not.toHaveAttribute('data-analytics-id');

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('data-analytics-id', 'COMMENT_FIELD');
  });
});
