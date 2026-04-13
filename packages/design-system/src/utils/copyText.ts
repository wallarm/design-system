const isClipboardApiSupported =
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard !== 'undefined' &&
  typeof navigator.clipboard.writeText === 'function';

/** Fallback copy using a temporary textarea + execCommand('copy') */
function fallbackCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.setAttribute('aria-hidden', 'true');
  textarea.tabIndex = -1;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/** Copy text to clipboard using the Clipboard API with execCommand fallback. */
export async function copyText(text: string): Promise<void> {
  if (isClipboardApiSupported) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Clipboard API rejected (e.g. permissions) — fall through to fallback
    }
  }
  fallbackCopy(text);
}
