interface Loc {
  pathname: string;
  search: string;
  hash: string;
}

/** Maps a legacy Storybook URL (served from the site root) to its new `storybook/` home. */
export function storybookRedirectTarget(
  { pathname, search, hash }: Loc,
  base: string,
): string | null {
  if (!pathname.startsWith(base) || pathname.startsWith(`${base}storybook/`)) return null;
  const params = new URLSearchParams(search);
  if (!params.has('path') && !params.has('id') && !pathname.endsWith('iframe.html')) return null;
  return `${base}storybook/${pathname.slice(base.length)}${search}${hash}`;
}
