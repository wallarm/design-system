import { type RefObject, useLayoutEffect, useState } from 'react';

export const useContainerWidth = (ref: RefObject<HTMLElement | null>) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.clientWidth);

    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
};
