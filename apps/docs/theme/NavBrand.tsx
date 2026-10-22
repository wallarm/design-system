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
      <Logo type='icon' size={hero ? '2xl' : 'xl'} aria-label='Wallarm' />
      <span
        className={
          hero
            ? 'text-[2.5rem] leading-[1.1] font-semibold text-text-primary'
            : 'text-base font-semibold text-text-primary'
        }
      >
        Design System
      </span>
    </>
  );
  const row = hero ? 'flex items-center gap-[16px]' : 'flex items-center gap-[8px]';
  return hero ? (
    <div className='mx-auto max-w-[72rem] px-10 pt-[5rem] -mb-[5.5rem] max-[1000px]:pt-[2rem] max-[1000px]:-mb-[1rem]'>
      <div className={row}>{content}</div>
    </div>
  ) : (
    <div className='rp-nav__title'>
      <Link href={withBase('/')} className={`rp-nav__title__link ${row}`}>
        {content}
      </Link>
    </div>
  );
}
