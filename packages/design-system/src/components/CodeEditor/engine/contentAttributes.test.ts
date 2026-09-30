import { afterEach, describe, expect, it, vi } from 'vitest';
import { RESERVED_CONTENT_ATTRIBUTES, sanitizeContentAttributes } from './contentAttributes';

describe('sanitizeContentAttributes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists every attribute CodeMirror owns on .cm-content', () => {
    expect(RESERVED_CONTENT_ATTRIBUTES).toEqual([
      'role',
      'contenteditable',
      'aria-multiline',
      'aria-readonly',
      'spellcheck',
      'autocorrect',
      'autocapitalize',
      'translate',
    ]);
  });

  it('keeps consumer attributes verbatim, including data-analytics-props and class', () => {
    const attrs = {
      'aria-label': 'Request',
      'data-analytics-id': 'request-editor',
      'data-analytics-props': '{"section":"body", "raw": true}',
      id: 'request',
      class: 'consumer-class',
    };

    expect(sanitizeContentAttributes(attrs)).toEqual(attrs);
  });

  it('drops reserved keys (any casing) with a development warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = sanitizeContentAttributes({
      role: 'presentation',
      ContentEditable: 'false',
      'aria-label': 'Body',
    });

    expect(result).toEqual({ 'aria-label': 'Body' });
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain('"role"');
    expect(warn.mock.calls[1]?.[0]).toContain('"ContentEditable"');
  });

  it('does not mutate the input', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const attrs = { role: 'presentation', title: 'Body' };

    sanitizeContentAttributes(attrs);

    expect(attrs).toEqual({ role: 'presentation', title: 'Body' });
  });
});
