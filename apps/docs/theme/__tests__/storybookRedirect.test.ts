import { describe, expect, it } from '@rstest/core';
import { storybookRedirectTarget } from '../storybookRedirect';

const base = '/design-system/';
const t = (pathname: string, search = '', hash = '') =>
  storybookRedirectTarget({ pathname, search, hash }, base);

describe('storybookRedirectTarget', () => {
  it('redirects root ?path= links', () => {
    expect(t('/design-system/', '?path=/story/actions-button--basic')).toBe(
      '/design-system/storybook/?path=/story/actions-button--basic',
    );
  });
  it('redirects iframe.html links', () => {
    expect(t('/design-system/iframe.html', '?id=actions-button--basic&viewMode=story')).toBe(
      '/design-system/storybook/iframe.html?id=actions-button--basic&viewMode=story',
    );
  });
  it('keeps the hash', () => {
    expect(t('/design-system/iframe.html', '', '#a')).toBe(
      '/design-system/storybook/iframe.html#a',
    );
  });
  it('ignores regular docs pages', () => {
    expect(t('/design-system/components/button')).toBeNull();
  });
  it('ignores paths already under storybook', () => {
    expect(t('/design-system/storybook/', '?path=/x')).toBeNull();
  });
});
