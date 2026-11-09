import { Fragment } from 'react';
import type { FrontMatterMeta, SidebarData } from '@rspress/core';
import {
  isEqualPath,
  routePathToMdPath,
  usePage,
  usePages,
  useSidebar,
  withBase,
  withSiteOrigin,
} from '@rspress/core/runtime';
import { Link } from '@rspress/core/theme-original';
import { Badge } from '@wallarm-org/design-system/Badge';
import { Card } from '@wallarm-org/design-system/Card';
import { cn } from '@wallarm-org/design-system/utils/cn';
import { CARD, STRETCHED } from './TemplateGallery';

export interface OverviewCard {
  title: string;
  link: string;
  description: string;
  tag?: string;
}

/** Cards under an optional heading: a linkless sidebar group (a component category) has one. */
export interface OverviewGroup {
  title?: string;
  cards: OverviewCard[];
}

type SidebarEntry = SidebarData[number];
type Page = { routePath: string; frontmatter: FrontMatterMeta };

/**
 * The section's sidebar as card groups, in sidebar order, without the overview page itself. A group
 * with a page of its own (Migration guides) is one card; a linkless one becomes a heading.
 */
export function overviewGroups(
  sidebar: SidebarData,
  pages: Page[],
  routePath: string,
): OverviewGroup[] {
  const card = (text: string, link: string, tag?: string): OverviewCard => ({
    title: text,
    link,
    description: pages.find(p => isEqualPath(p.routePath, link))?.frontmatter.description ?? '',
    tag,
  });
  // Dividers and section headers carry no `text`.
  const cards = (items: SidebarEntry[]): OverviewCard[] =>
    items.flatMap(item => {
      if (!('text' in item)) return [];
      if (item.link)
        return isEqualPath(item.link, routePath) ? [] : [card(item.text, item.link, item.tag)];
      return 'items' in item ? cards(item.items) : [];
    });

  const groups: OverviewGroup[] = [];
  for (const item of sidebar) {
    if ('items' in item && !item.link) {
      groups.push({ title: item.text, cards: cards(item.items) });
      continue;
    }
    const loose = cards([item]);
    const last = groups.at(-1);
    if (last && !last.title) last.cards.push(...loose);
    else if (loose.length) groups.push({ cards: loose });
  }
  return groups.filter(g => g.cards.length);
}

const GRID = 'm-0 grid grid-cols-1 gap-16 p-0 sm:grid-cols-2 xl:grid-cols-3';

// Descriptions are frontmatter text; a card shows their `code` spans as plain words.
const plain = (text: string): string => text.replace(/`([^`]+)`/g, '$1');

/** `heading` is the card title's level: h3 under a group heading, h2 when the group has none. */
function SectionCard({ card, heading: H }: { card: OverviewCard; heading: 'h2' | 'h3' }) {
  return (
    <li className='list-none'>
      <Card className={cn(CARD, 'gap-6 p-16')}>
        <div className='flex items-center justify-between gap-8'>
          <H className='m-0 text-base font-medium text-text-primary'>
            <Link href={withBase(card.link)} data-card-link className={STRETCHED}>
              {card.title}
            </Link>
          </H>
          {card.tag && (
            // Green like the sidebar's own `new` tag (Rspress tip badge).
            <Badge type='secondary' color='green' size='small'>
              {card.tag}
            </Badge>
          )}
        </div>
        {card.description && (
          <p className='m-0 line-clamp-3 text-sm text-text-secondary'>{plain(card.description)}</p>
        )}
      </Card>
    </li>
  );
}

/**
 * A section's landing page: a card per page of the section's sidebar, with its frontmatter
 * description. Reads both from the Rspress runtime, so a page added to a section's `_meta.json`
 * shows up here too.
 */
export function SectionOverview() {
  const { routePath } = usePage().page;
  const groups = overviewGroups(useSidebar(), usePages().pages, routePath);

  // Truthy check: a boolean define in builds, a string env var under Rstest.
  if (import.meta.env.SSG_MD) {
    return (
      <>
        {groups.map(g => (
          <Fragment key={g.title ?? g.cards[0]?.link}>
            {g.title && <h2>{g.title}</h2>}
            <ul>
              {g.cards.map(c => (
                <li key={c.link}>
                  <a href={withSiteOrigin(routePathToMdPath(c.link))}>{c.title}</a>
                  {c.description && `: ${c.description}`}
                </li>
              ))}
            </ul>
          </Fragment>
        ))}
      </>
    );
  }
  return (
    <div className='rp-not-doc my-24 flex flex-col gap-32'>
      {groups.map(g => (
        <section key={g.title ?? g.cards[0]?.link} className='flex flex-col gap-12'>
          {g.title && (
            <h2 className='m-0 font-sans-display text-lg font-semibold text-text-primary'>
              {g.title}
            </h2>
          )}
          <ul className={GRID}>
            {g.cards.map(c => (
              <SectionCard key={c.link} card={c} heading={g.title ? 'h3' : 'h2'} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// Rspress injects markdown.globalComponents as default imports.
export default SectionOverview;
