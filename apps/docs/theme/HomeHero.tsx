// @ts-expect-error CSS side-effect import has no type declarations (the original HomeHero CSS is
// otherwise tree-shaken once this component replaces it).
import '@rspress/core/dist/theme/components/HomeHero/index.css';
import { useFrontmatter } from '@rspress/core/runtime';
import { Button, renderHtmlOrText } from '@rspress/core/theme-original';
import { NavBrand } from './NavBrand';

interface HeroAction {
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
}

// Replaces the original HomeHero only to render the name as a branded <h1>; the tagline and
// actions reuse its markup and classes. Frontmatter hero.name stays the text fallback (SEO, llms).
// ponytail: no hero image/badge/text support (unused here); copy them from the original if needed.
export function HomeHero() {
  const { frontmatter } = useFrontmatter();
  const hero = (frontmatter?.hero ?? {}) as { tagline?: string; actions?: HeroAction[] };
  return (
    <div className='rp-home-hero rp-home-hero--no-image'>
      <div className='rp-home-hero__container items-center text-center'>
        <div className='rp-home-hero__content'>
          <NavBrand size='hero' />
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
  );
}
