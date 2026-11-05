// Both sides through the same DOM serializer; ids by position; the bake's <image> attributes and the `ready` class
// (a cached bake lands synchronously on the page) are not markup and are dropped.
export const normalise = (svg: string) => {
  const host = document.createElement('div');
  host.innerHTML = svg.replace(/>\s+</g, '><');
  const root = host.querySelector('svg') as SVGSVGElement;
  for (const im of root.querySelectorAll('image'))
    for (const a of [...im.attributes])
      if (a.name !== 'class' && a.name !== 'preserveAspectRatio') im.removeAttribute(a.name);
  for (const g of root.querySelectorAll('.ly')) g.classList.remove('ready');
  const seen = new Map<string, string>();
  return root.innerHTML.replace(
    /(id="|url\(#)([a-z]+\d+)([a-z]*)/g,
    (_, pre: string, base: string, suf: string) => {
      if (!seen.has(base)) seen.set(base, `i${seen.size}`);
      return `${pre}${seen.get(base)}${suf}`;
    },
  );
};
