import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from './Tag';
import { TagClose } from './TagClose';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the Tag root <div>', () => {
    render(
      <Tag data-testid='tag' data-analytics-id='TAG_HOST'>
        host.example.com
      </Tag>,
    );

    const tag = screen.getByTestId('tag');
    expect(tag.tagName).toBe('DIV');
    expect(tag).toHaveAttribute('data-analytics-id', 'TAG_HOST');
  });

  it('forwards data-analytics-id and verbatim payload to TagClose <button>', () => {
    const payload = JSON.stringify({ feature: 'filters', tag: 'host' });

    render(
      <Tag>
        host.example.com
        <TagClose
          data-testid='close'
          data-analytics-id='TAG_REMOVE'
          data-analytics-props={payload}
        />
      </Tag>,
    );

    const close = screen.getByTestId('close');
    expect(close.tagName).toBe('BUTTON');
    expect(close).toHaveAttribute('data-analytics-id', 'TAG_REMOVE');
    expect(close).toHaveAttribute('data-analytics-props', payload);
  });

  it('TagClose is a real <button> with default aria-label', () => {
    render(
      <Tag>
        host
        <TagClose data-testid='close' />
      </Tag>,
    );

    const close = screen.getByTestId('close');
    expect(close.tagName).toBe('BUTTON');
    expect(close).toHaveAttribute('type', 'button');
    expect(close).toHaveAttribute('aria-label', 'Remove tag');
  });
});

describe('Handler composition', () => {
  it('consumer onClick on TagClose fires on click', async () => {
    const onClick = vi.fn();

    render(
      <Tag>
        host
        <TagClose data-testid='close' onClick={onClick} />
      </Tag>,
    );

    await userEvent.click(screen.getByTestId('close'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('clicking TagClose does NOT fire Tag onClick (nested-interactive gating)', async () => {
    const tagOnClick = vi.fn();
    const closeOnClick = vi.fn();

    render(
      <Tag data-testid='tag' onClick={tagOnClick}>
        host
        <TagClose data-testid='close' onClick={closeOnClick} />
      </Tag>,
    );

    await userEvent.click(screen.getByTestId('close'));

    expect(closeOnClick).toHaveBeenCalledTimes(1);
    expect(tagOnClick).not.toHaveBeenCalled();
  });

  it('clicking the Tag body still fires Tag onClick', async () => {
    const tagOnClick = vi.fn();

    render(
      <Tag data-testid='tag' onClick={tagOnClick}>
        host
        <TagClose data-testid='close' />
      </Tag>,
    );

    await userEvent.click(screen.getByTestId('tag'));

    expect(tagOnClick).toHaveBeenCalledTimes(1);
  });

  it('clicks on TagClose bubble to document for SDK click capture', async () => {
    const documentClick = vi.fn();
    document.addEventListener('click', documentClick);

    render(
      <Tag>
        host
        <TagClose data-testid='close' data-analytics-id='TAG_REMOVE' />
      </Tag>,
    );

    await userEvent.click(screen.getByTestId('close'));

    expect(documentClick).toHaveBeenCalled();
    document.removeEventListener('click', documentClick);
  });
});
