import { describe, expect, it } from '@rstest/core';

import { svgToIconBody } from '../svg.js';

const svg = (body: string, viewBox = '0 0 24 24') =>
  `<svg width="24" height="24" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>\n`;

describe('svgToIconBody', () => {
  it('maps Figma ink to currentColor and camelCases attributes', () => {
    const { jsx, viewBox } = svgToIconBody(
      svg('<path fill-rule="evenodd" clip-rule="evenodd" d="M1 1H2" fill="#0F172B"/>'),
      'mono',
      'x',
    );
    expect(viewBox).toBe('0 0 24 24');
    expect(jsx).toBe(
      `<path fillRule='evenodd' clipRule='evenodd' d='M1 1H2' fill='currentColor' />`,
    );
  });

  it('keeps a non-24 viewBox so SvgIcon scales it', () => {
    expect(
      svgToIconBody(svg('<path d="M1 1" fill="#0F172B"/>', '0 0 12 12'), 'mono', 'x').viewBox,
    ).toBe('0 0 12 12');
  });

  it('maps off-palette mono ink to currentColor with a warning', () => {
    const { jsx, warnings } = svgToIconBody(svg('<path d="M1 1" fill="#62748E"/>'), 'mono', 'x');
    expect(jsx).toContain(`fill='currentColor'`);
    expect(warnings[0]).toContain('#62748E');
  });

  it('pins fill="none" on shapes that relied on the root <svg fill="none">', () => {
    const { jsx } = svgToIconBody(svg('<path d="M1 1" stroke="#0F172B"/>'), 'mono', 'x');
    expect(jsx).toBe(`<path d='M1 1' stroke='currentColor' fill='none' />`);
  });

  it('unwraps the full-frame clipPath Figma adds to clipped frames', () => {
    const { jsx } = svgToIconBody(
      svg(`<g clip-path="url(#clip0_1_2)">
<path d="M1 1" fill="#1877F2"/>
</g>
<defs>
<clipPath id="clip0_1_2">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`),
      'original',
      'x',
    );
    expect(jsx).toBe(`<path d='M1 1' fill='#1877F2' />`);
  });

  it('prefixes ids and their references so icons on one page do not collide', () => {
    const { jsx } = svgToIconBody(
      svg(`<path d="M1 1" fill="url(#paint0_linear_1_2)"/>
<defs>
<linearGradient id="paint0_linear_1_2"><stop stop-color="#FF433A"/></linearGradient>
</defs>`),
      'original',
      'sound-cloud',
    );
    expect(jsx).toContain(`fill='url(#sound-cloud-paint0_linear_1_2)'`);
    expect(jsx).toContain(`id='sound-cloud-paint0_linear_1_2'`);
    expect(jsx).toContain(`stopColor='#FF433A'`);
  });

  it('neutral: drops gradients and turns white ink into a cut-out mask', () => {
    const { jsx } = svgToIconBody(
      svg(`<path d="M0 0H24V24H0Z" fill="url(#g)"/>
<path d="M8 8H16" fill="white"/>
<defs><linearGradient id="g"><stop stop-color="red"/></linearGradient></defs>`),
      'neutral',
      'brand-neutral',
    );
    expect(jsx).not.toContain('linearGradient');
    expect(jsx).toContain(`<mask id='brand-neutral-cutout'`);
    expect(jsx).toContain(`<path d='M8 8H16' fill='black' />`);
    expect(jsx).toContain(
      `<g mask='url(#brand-neutral-cutout)'><path d='M0 0H24V24H0Z' fill='currentColor' />`,
    );
  });

  it('neutral: leaves mask geometry alone (a dark luminance mask would hide the glyph)', () => {
    const { jsx } = svgToIconBody(
      svg(`<mask id="m" style="mask-type:luminance"><path d="M0 0" fill="white"/></mask>
<g mask="url(#m)"><path d="M1 1" fill="#F15C22"/></g>`),
      'neutral',
      'p',
    );
    expect(jsx).toContain(
      `<mask id='p-m' style={{ maskType: 'luminance' }}><path d='M0 0' fill='white' /></mask>`,
    );
    expect(jsx).toContain(`<path d='M1 1' fill='currentColor' />`);
  });
});
