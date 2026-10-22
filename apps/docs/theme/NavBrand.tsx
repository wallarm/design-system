import { withBase } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import { Logo } from '@wallarm-org/design-system/Logo';

interface NavBrandProps {
  size?: 'nav' | 'hero';
}

// The Logo takes its colors from DS tokens, so it follows data-theme without a dark variant.
export function NavBrand({ size = 'nav' }: NavBrandProps) {
  const hero = size === 'hero';
  const content = (
    <>
      <Logo type='icon' size={hero ? '2xl' : 'xl'} aria-hidden='true' />
      <span
        className={
          hero
            ? 'text-4xl font-semibold text-text-primary'
            : 'text-base font-semibold text-text-primary'
        }
      >
        Design System
      </span>
    </>
  );
  const row = hero ? 'flex items-center justify-center gap-16' : 'flex items-center gap-8';
  return hero ? (
    <h1 className={row}>{content}</h1>
  ) : (
    <div className='rp-nav__title'>
      <Link href={withBase('/')} className={`rp-nav__title__link ${row}`}>
        {content}
      </Link>
    </div>
  );
}
