/** Agent output is untrusted: narrow before reading a field. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * An href an agent may hand to a link: an absolute `https://` URL or an app path starting with a
 * single `/`. Anything else (`javascript:`, `data:`, `http:`, `//host`, `/\host`, whitespace or
 * control characters, a mixed-case scheme, `user@host` userinfo) is rejected rather than cleaned up.
 */
export const isSafeHref = (href: string): boolean => {
  if (/[\s\\]/.test(href) || [...href].some(c => c < ' ' || c === '\u007f')) return false;
  if (href.startsWith('/')) return !href.startsWith('//');
  if (!href.startsWith('https://')) return false;
  try {
    // `https://trusted.com@evil.com` reads as trusted but goes to evil.com: no userinfo.
    const url = new URL(href);
    return url.hostname !== '' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
};
