// Must stay self-contained: its source is inlined into THEME_SCRIPT via toString().
export function resolveTheme(stored: string | null, prefersDark: boolean): 'light' | 'dark' {
  if (stored === 'dark' || stored === 'light') return stored;
  return prefersDark ? 'dark' : 'light';
}

// Runs in <head> before paint so DS tokens ([data-theme]) match the Rspress appearance
// (same localStorage key Rspress' own dark-mode script reads).
export const THEME_SCRIPT = `(function(){var resolveTheme=${resolveTheme.toString()};var stored=null;try{stored=localStorage.getItem('rspress-theme-appearance')}catch(e){}document.documentElement.dataset.theme=resolveTheme(stored,matchMedia('(prefers-color-scheme: dark)').matches)})()`;
