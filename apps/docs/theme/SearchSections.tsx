import { withBase } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import nav from '../docs/_nav.json';

interface SearchSectionsProps {
  onNavigate: () => void;
}

// Shown in the empty search dialog; hidden by CSS (global.css) as soon as the input has a value.
export function SearchSections({ onNavigate }: SearchSectionsProps) {
  return (
    <nav aria-label='Sections' data-slot='search-sections' className='mt-16'>
      <h2 className='mb-8 px-8 text-xs font-medium uppercase text-text-secondary'>Sections</h2>
      <ul className='m-0 flex list-none flex-col p-0'>
        {nav.map(({ text, link }) => {
          const external = /^https?:/.test(link);
          return (
            <li key={link}>
              <Link
                href={external ? link : withBase(link)}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={onNavigate}
                className='block rounded-8 px-8 py-8 text-sm text-text-primary hover:bg-bg-light-primary'
              >
                {text}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
