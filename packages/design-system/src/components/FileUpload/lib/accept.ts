/** `'.so, .dylib'` / `['.lua', 'image/png,image/jpeg']` → `['.so', '.dylib']` / `['.lua', 'image/png', 'image/jpeg']`. */
export const toAcceptList = (accept?: string | string[]): string[] => {
  if (accept === undefined) return [];
  const parts = Array.isArray(accept) ? accept : [accept];
  return parts
    .flatMap(part => part.split(','))
    .map(part => part.trim())
    .filter(Boolean);
};

/** The native / Ark `accept` string, or `undefined` when nothing is restricted. */
export const toAcceptString = (accept?: string | string[]): string | undefined => {
  const list = toAcceptList(accept);
  return list.length ? list.join(',') : undefined;
};
