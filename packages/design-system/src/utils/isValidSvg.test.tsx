import { describe, expect, it } from '@rstest/core';
import { AgentGlyph } from '../components/AgentGlyph';
import { Activity } from '../icons';
import { isSvgElement } from './isValidSvg';

describe('isSvgElement', () => {
  it('takes an svg, an *Icon component and an agent glyph as an icon', () => {
    expect(isSvgElement(<svg />)).toBe(true);
    expect(isSvgElement(<Activity />)).toBe(true);
    expect(isSvgElement(<AgentGlyph agent='wally' size={24} />)).toBe(true);
  });

  it('takes text and other elements as content', () => {
    expect(isSvgElement('Ask')).toBe(false);
    expect(isSvgElement(<span />)).toBe(false);
  });
});
