import { describe, expect, it } from '@rstest/core';
import {
  ownsArrowKeys,
  parsePreviewParams,
  storybookStoryUrl,
  storyLabel,
  withPreviewParams,
} from '../templatePreview';

describe('storyLabel', () => {
  it('splits PascalCase into a sentence-case label', () => {
    expect(storyLabel('Default')).toBe('Default');
    expect(storyLabel('NoData')).toBe('No data');
    expect(storyLabel('PartialFailure')).toBe('Partial failure');
  });

  it('keeps acronyms', () => {
    expect(storyLabel('APIKeys')).toBe('API keys');
  });
});

describe('storybookStoryUrl', () => {
  it('builds the id from the section, the guideline title and the export name', () => {
    expect(storybookStoryUrl('templates/security-dashboard', 'Security dashboard', 'NoData')).toBe(
      'https://wallarm.github.io/design-system/storybook/?path=/story/templates-security-dashboard--no-data',
    );
  });

  it('uses the title, not the page name', () => {
    expect(storybookStoryUrl('patterns/app-layout', 'Application layout', 'Default')).toBe(
      'https://wallarm.github.io/design-system/storybook/?path=/story/patterns-application-layout--default',
    );
  });
});

describe('preview params', () => {
  it('reads preview and state', () => {
    expect(parsePreviewParams('?preview=page-states&state=LoadError')).toEqual({
      preview: 'page-states',
      state: 'LoadError',
    });
    expect(parsePreviewParams('?preview=')).toEqual({ preview: null, state: null });
  });

  it('sets them and keeps other params', () => {
    expect(withPreviewParams('?x=1', { preview: 'rule-editor', state: null })).toBe(
      '?x=1&preview=rule-editor',
    );
    expect(withPreviewParams('?preview=a&state=Loading', { preview: 'b', state: 'Empty' })).toBe(
      '?preview=b&state=Empty',
    );
  });

  it('removes them on close, and never writes a state without a preview', () => {
    expect(withPreviewParams('?preview=a&state=Loading', { preview: null, state: null })).toBe('');
    expect(withPreviewParams('', { preview: null, state: 'Loading' })).toBe('');
  });
});

describe('ownsArrowKeys', () => {
  it('leaves arrows to inputs, arrow-key widgets and the story frame', () => {
    document.body.innerHTML = `
      <input id="input" />
      <div contenteditable="true"><span id="editable"></span></div>
      <div role="radiogroup"><button id="radio"></button></div>
      <div data-preview-frame><button id="story"></button></div>
      <button id="plain"></button>`;
    const el = (id: string) => document.getElementById(id);
    expect(ownsArrowKeys(el('input'))).toBe(true);
    expect(ownsArrowKeys(el('editable'))).toBe(true);
    expect(ownsArrowKeys(el('radio'))).toBe(true);
    expect(ownsArrowKeys(el('story'))).toBe(true);
    expect(ownsArrowKeys(el('plain'))).toBe(false);
    expect(ownsArrowKeys(null)).toBe(false);
  });
});
