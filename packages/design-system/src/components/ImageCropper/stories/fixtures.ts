const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

// Local deterministic illustrations keep the examples and export checks independent of network/CORS.
export const PORTRAIT = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"><rect width="200" height="300" fill="#c9d9ec"/><circle cx="100" cy="112" r="48" fill="#31344e"/><ellipse cx="100" cy="132" rx="35" ry="44" fill="#eec5a6"/><path d="M65 119q5-53 65-20l9 30q-31-4-44-30-9 18-30 20" fill="#31344e"/><path d="M30 300v-67q0-55 70-55t70 55v67" fill="#56749b"/><path d="m77 179 23 37 23-37" fill="#eec5a6"/></svg>',
);

export const LANDSCAPE = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><rect width="600" height="300" fill="#d5e6ef"/><circle cx="430" cy="77" r="34" fill="#f4bc68"/><path d="m0 260 170-200 155 200z" fill="#829ca1"/><path d="m90 300 260-248 250 248" fill="#577a87"/><path d="m297 103 53-51 62 62-39-13-23 11-20-17z" fill="#f5f1e7"/><path d="M0 248q170-50 300 5t300-13v60H0" fill="#335d68"/></svg>',
);

export const WIDE_BANDS = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><path fill="#ff0000" d="M0 0h100v200H0z"/><path fill="#00ff00" d="M100 0h100v200H100z"/><path fill="#0000ff" d="M200 0h100v200H200z"/><path fill="#ffff00" d="M300 0h100v200H300z"/></svg>',
);

export const TALL_BANDS = svgUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="400"><path fill="#ff0000" d="M0 0h200v100H0z"/><path fill="#00ff00" d="M0 100h200v100H0z"/><path fill="#0000ff" d="M0 200h200v100H0z"/><path fill="#ffff00" d="M0 300h200v100H0z"/></svg>',
);
