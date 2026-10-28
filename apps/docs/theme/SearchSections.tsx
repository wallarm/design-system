import { useEffect, useRef, useState } from 'react';

import { withBase } from '@rspress/core/runtime';
import { IconJump, IconTitle, Link, SvgWrapper } from '@rspress/core/theme-original';
import { createPortal } from 'react-dom';

import nav from '../docs/_nav.json';

interface SearchSectionsProps {
  onNavigate: () => void;
}

// Shown in the empty search dialog; hidden by CSS (global.css) as soon as the input has a value.
// Markup and classes mirror the stock result item (SuggestItem is not exported), so the stock
// styles apply: label as the statement line, path as the secondary line.
export function SearchSections({ onNavigate }: SearchSectionsProps) {
  const [current, setCurrent] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // The stock handler only knows its own results, so mirror its keys for ours while the input is empty.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const input = document.querySelector<HTMLInputElement>('.rp-search-panel__input');
      // A focused section link handles Enter natively; acting here too would navigate twice.
      if (!input || input.value || e.isComposing || listRef.current?.contains(e.target as Node))
        return;
      if (e.code === 'ArrowDown') setCurrent(i => (i + 1) % nav.length);
      else if (e.code === 'ArrowUp') setCurrent(i => (i - 1 + nav.length) % nav.length);
      else if (e.code === 'Enter') listRef.current?.querySelectorAll('a')[current]?.click();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [current]);

  return (
    <nav aria-label='Sections' data-slot='search-sections'>
      <h2 className='mt-16 mb-4 px-4 text-xs font-medium text-text-secondary uppercase'>
        Sections
      </h2>
      <ul ref={listRef} className='rp-search-panel__group m-0 p-0'>
        {nav.map(({ text, link }, index) => {
          const external = /^https?:/.test(link);
          return (
            <li
              key={link}
              className={`rp-suggest-item ${index === current ? 'rp-suggest-item--current' : ''}`}
            >
              <Link
                href={external ? link : withBase(link)}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={onNavigate}
                onMouseEnter={() => setCurrent(index)}
                onFocus={() => setCurrent(index)}
                className='rp-suggest-item__link'
              >
                <div className='rp-suggest-item__container'>
                  <div className='rp-suggest-item__icon'>
                    <SvgWrapper icon={IconTitle} />
                  </div>
                  <div className='rp-suggest-item__content'>
                    <span>
                      <div className='rp-suggest-item__statement'>{text}</div>
                      <p className='rp-suggest-item__title'>{link}</p>
                    </span>
                  </div>
                  <div className='rp-suggest-item__action-icon'>
                    <SvgWrapper icon={IconJump} />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const HOST_ATTR = 'data-search-sections-host';

// The stock panel exposes neither its input nor an empty-state slot, so follow its modal in the DOM
// and keep a host node right after the header (input), before the React-owned results container.
function syncHost(): HTMLElement | null {
  const modal = document.querySelector('.rp-search-panel__modal');
  const header = modal?.querySelector('.rp-search-panel__header');
  if (!modal || !header) return null;
  let host = modal.querySelector<HTMLElement>(`[${HOST_ATTR}]`);
  if (!host) {
    host = document.createElement('div');
    host.setAttribute(HOST_ATTR, '');
    header.after(host);
  }
  return host;
}

// Escape is the stock panel's own close path (it listens on document).
const closeSearch = () =>
  setTimeout(() =>
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })),
  );

export function SearchSectionsHost() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const sync = () => setHost(syncHost());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return host && createPortal(<SearchSections onNavigate={closeSearch} />, host);
}
