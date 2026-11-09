// @ts-expect-error CSS side-effect import has no type declarations (the original HomeHero CSS is
// otherwise tree-shaken once this component replaces it).
import '@rspress/core/dist/theme/components/HomeHero/index.css';
import { useFrontmatter, withBase } from '@rspress/core/runtime';
import { Button, Link, renderHtmlOrText } from '@rspress/core/theme-original';
import { AnimatedBackground } from '@wallarm-org/design-system/AnimatedBackground';
import { ArrowRight } from '@wallarm-org/design-system/icons/ArrowRight';

interface HeroAction {
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
}

// Replaces the original HomeHero to render the name as a plain-text <h1> (the built-in one is a div)
// with a brand accent, and a version badge linking to the changelog; the actions reuse its markup.
// ponytail: no hero image support (unused here); copy it from the original if needed.
export function HomeHero() {
  const { frontmatter } = useFrontmatter();
  const hero = (frontmatter?.hero ?? {}) as {
    name?: string;
    tagline?: string;
    actions?: HeroAction[];
  };
  // "Wallarm Design System": the words after the first carry the accent.
  const [lead, ...accent] = (hero.name ?? '').split(' ');
  return (
    <>
      {/* Like Rspress's own HomeBackground: absolute from the top of the home page, fading out
          below the hero. Dimmed in dark mode and paused under reduced motion by global.css. */}
      <div
        data-slot='home-blur'
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-svh overflow-hidden mask-b-from-50%'
      >
        <AnimatedBackground variant='blur' className='size-full' />
      </div>
      <div className='rp-home-hero rp-home-hero--no-image my-0! min-h-[calc(100svh-var(--rp-nav-height))] items-center!'>
        <div className='rp-home-hero__container items-center justify-center text-center'>
          <Link href={withBase('/get-started/changelog')} className='rp-home-hero__badge gap-6'>
            v{import.meta.env.DS_VERSION}
            <span className='text-text-secondary'>What&apos;s new</span>
            <ArrowRight size='sm' />
          </Link>
          <h1 className='m-0 font-sans-display text-5xl font-semibold tracking-tight text-balance text-text-primary sm:text-7xl'>
            {lead} {accent.length > 0 && <span data-slot='hero-accent'>{accent.join(' ')}</span>}
          </h1>
          <p
            className='m-0 max-w-[36rem] text-lg text-text-secondary sm:text-xl'
            {...renderHtmlOrText(hero.tagline)}
          />
          <div className='rp-home-hero__actions'>
            {hero.actions?.map(action => (
              <Button
                key={action.link}
                type='a'
                href={action.link}
                theme={action.theme}
                className='rp-home-hero__action'
                {...renderHtmlOrText(action.text)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
