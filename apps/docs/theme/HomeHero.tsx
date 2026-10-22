// @ts-expect-error CSS side-effect import has no type declarations (the original HomeHero CSS is
// otherwise tree-shaken once this component replaces it).
import '@rspress/core/dist/theme/components/HomeHero/index.css';
import { useFrontmatter } from '@rspress/core/runtime';
import { Button, renderHtmlOrText } from '@rspress/core/theme-original';
import { AnimatedBackground } from '@wallarm-org/design-system/AnimatedBackground';

interface HeroAction {
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
}

// Replaces the original HomeHero only to render the name as a plain-text <h1> (the built-in one is a div); the tagline and
// actions reuse its markup and classes.
// ponytail: no hero image/badge/text support (unused here); copy them from the original if needed.
export function HomeHero() {
  const { frontmatter } = useFrontmatter();
  const hero = (frontmatter?.hero ?? {}) as {
    name?: string;
    tagline?: string;
    actions?: HeroAction[];
  };
  return (
    <>
      {/* Like Rspress's own HomeBackground: absolute from the top of the home page, so it reaches
          behind the feature cards that follow the hero. Dimmed in dark mode and paused under
          reduced motion by global.css. */}
      <div
        data-slot='home-blur'
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1000px] overflow-hidden'
      >
        <AnimatedBackground variant='blur' className='size-full' />
      </div>
      <div className='rp-home-hero rp-home-hero--no-image'>
        <div className='rp-home-hero__container items-center text-center'>
          <div className='rp-home-hero__content'>
            <h1 className='rp-home-hero__title text-text-primary'>{hero.name}</h1>
          </div>
          <p className='rp-home-hero__tagline' {...renderHtmlOrText(hero.tagline)} />
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
