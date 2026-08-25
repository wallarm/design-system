const MAX_ALIGN_ATTEMPTS = 12;
const ALIGN_INTERVAL_MS = 50;

/**
 * Stories render lazily, so the page keeps growing after a jump starts and the heading drifts out
 * from under the viewport. Re-align until the document stops changing height.
 */
const alignUntilSettled = (heading: HTMLElement) => {
  let attempts = 0;
  let lastHeight = -1;

  const align = () => {
    heading.scrollIntoView({ block: 'start' });

    const height = document.documentElement.scrollHeight;
    attempts += 1;

    if (height !== lastHeight && attempts < MAX_ALIGN_ATTEMPTS) {
      lastHeight = height;
      setTimeout(align, ALIGN_INTERVAL_MS);
    }
  };

  align();
};

/**
 * Storybook's own table-of-contents click handler cancels the link and asks the manager to navigate,
 * which never scrolls the docs page — so every entry highlights but nothing moves. Scrolling the
 * heading into view here restores the jump for the sections and the examples alike.
 */
const onClick = (event: MouseEvent) => {
  event.preventDefault();

  const link = event.currentTarget;
  if (!(link instanceof HTMLAnchorElement)) {
    return;
  }

  const [, headingId] = link.href.split('#');
  const heading = headingId ? document.getElementById(headingId) : null;

  if (heading) {
    alignUntilSettled(heading);
  }
};

export const TOC_OPTIONS = {
  headingSelector: 'h2, h3',
  unsafeTocbotOptions: { onClick },
};
