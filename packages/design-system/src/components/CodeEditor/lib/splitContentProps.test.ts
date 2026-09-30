import { describe, expect, it, vi } from 'vitest';
import { splitContentProps } from './splitContentProps';

describe('splitContentProps', () => {
  it('routes data-*, aria-*, id, title and tabIndex to the typing surface', () => {
    const onKeyDown = vi.fn();
    const style = { color: 'red' };
    const { contentAttributes, wrapperProps } = splitContentProps({
      'data-analytics-id': 'editor',
      'data-analytics-props': '{"a":1}',
      'aria-label': 'Request',
      'aria-invalid': true,
      id: 'req',
      title: 'Request body',
      tabIndex: 0,
      style,
      onKeyDown,
      lang: 'en',
    });

    expect(contentAttributes).toEqual({
      'data-analytics-id': 'editor',
      'data-analytics-props': '{"a":1}',
      'aria-label': 'Request',
      'aria-invalid': 'true',
      id: 'req',
      title: 'Request body',
      tabindex: '0',
    });
    expect(wrapperProps).toEqual({ style, onKeyDown, lang: 'en' });
  });

  it('drops undefined and null attribute values', () => {
    const { contentAttributes } = splitContentProps({
      'aria-label': undefined,
      'data-x': null,
      id: undefined,
    });
    expect(contentAttributes).toEqual({});
  });
});
