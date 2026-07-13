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

describe('Rendering', () => {
  it('renders data-slot="textarea" on the root element', () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector('[data-slot="textarea"]')).toBeInTheDocument();
  });

  it('renders a native <textarea> element', () => {
    render(<Textarea data-testid='textarea' />);
    expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA');
  });

  it('applies placeholder text', () => {
    render(<Textarea placeholder='Enter text...' />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });
});

describe('Disabled state', () => {
  it('sets disabled attribute on <textarea>', () => {
    render(<Textarea data-testid='textarea' disabled />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('sets aria-disabled when disabled', () => {
    render(<Textarea data-testid='textarea' disabled />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Error state', () => {
  it('sets aria-invalid when error is true', () => {
    render(<Textarea data-testid='textarea' error />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when error is false', () => {
    render(<Textarea data-testid='textarea' />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('Auto-resize mode', () => {
  it('sets resize-none class when maxRows is provided', () => {
    render(<Textarea data-testid='textarea' minRows={1} maxRows={5} />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea.className).toContain('resize-none');
  });

  it('sets rows attribute from minRows', () => {
    render(<Textarea data-testid='textarea' minRows={3} maxRows={5} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '3');
  });

  it('defaults minRows to 1 when only maxRows is set', () => {
    render(<Textarea data-testid='textarea' maxRows={5} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '1');
  });
});

describe('Rendering', () => {
  it('renders data-slot="textarea" on the root element', () => {
    const { container } = render(<Textarea />);
    expect(container.querySelector('[data-slot="textarea"]')).toBeInTheDocument();
  });

  it('renders a native <textarea> element', () => {
    render(<Textarea data-testid='textarea' />);
    expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA');
  });

  it('applies placeholder text', () => {
    render(<Textarea placeholder='Enter text...' />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('renders standalone without children prop', () => {
    const { container } = render(<Textarea />);

    expect(container.querySelector('[data-slot="textarea"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="textarea-footer"]')).not.toBeInTheDocument();
  });
});

describe('Disabled state', () => {
  it('sets disabled attribute on <textarea>', () => {
    render(<Textarea data-testid='textarea' disabled />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  it('sets aria-disabled when disabled', () => {
    render(<Textarea data-testid='textarea' disabled />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Error state', () => {
  it('sets aria-invalid when error is true', () => {
    render(<Textarea data-testid='textarea' error />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when error is false', () => {
    render(<Textarea data-testid='textarea' />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('Auto-resize mode', () => {
  it('sets resize-none class when maxRows is provided', () => {
    render(<Textarea data-testid='textarea' minRows={1} maxRows={5} />);
    const textarea = screen.getByTestId('textarea');
    expect(textarea.className).toContain('resize-none');
  });

  it('sets rows attribute from minRows', () => {
    render(<Textarea data-testid='textarea' minRows={3} maxRows={5} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '3');
  });

  it('defaults minRows to 1 when only maxRows is set', () => {
    render(<Textarea data-testid='textarea' maxRows={5} />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '1');
  });
});

describe('Size variants', () => {
  it('renders the small size at 64px min-height (matches Figma spec)', () => {
    render(<Textarea data-testid='textarea' size='small' />);
    expect(screen.getByTestId('textarea').className).toContain('min-h-[64px]');
  });

  it('renders the medium size at 72px min-height', () => {
    render(<Textarea data-testid='textarea' size='medium' />);
    expect(screen.getByTestId('textarea').className).toContain('min-h-[72px]');
  });

  it('renders the default size at 76px min-height with no size prop', () => {
    render(<Textarea data-testid='textarea' />);
    expect(screen.getByTestId('textarea').className).toContain('min-h-[76px]');
  });

  it('renders the inline-edit size at 4px padding, 64px min-height', () => {
    render(<Textarea data-testid='textarea' size='inline-edit' />);
    expect(screen.getByTestId('textarea').className).toContain('py-4');
    expect(screen.getByTestId('textarea').className).toContain('min-h-[64px]');
  });
});
