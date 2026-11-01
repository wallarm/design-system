import { withBase } from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import { Logo } from '@wallarm-org/design-system/Logo';

// The Logo takes its colors from DS tokens, so it follows data-theme without a dark variant.
export function NavBrand() {
  return (
    <div className='rp-nav__title'>
      <Link href={withBase('/')} className='rp-nav__title__link flex items-center gap-8'>
        <Logo type='icon' size='xl' aria-hidden='true' />
        <span className='text-base font-semibold text-text-primary'>Design System</span>
      </Link>
    </div>
  );
}
