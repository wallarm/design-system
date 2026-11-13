import * as z from 'zod';
import { Link, type LinkProps } from '@wallarm-org/design-system/Link';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, subsetOf, type Values } from '../core/define';
import { isSafeHref } from '../core/guards';

export const LinkComponent = defineComponent({
  name: 'Link',
  description:
    'A link to a reference: a CVE, a documentation page, an app page. For doing something use Button.',
  props: z.object({
    label: z.string().min(1),
    href: z
      .string()
      .refine(isSafeHref, 'only https:// URLs and app paths starting with /')
      .describe('https:// URL or an app path starting with /'),
    tone: z.enum(subsetOf<Values<LinkProps['type']>>()(['default', 'muted'])).optional(),
  }),
  Skeleton: () => <Skeleton width='96px' height='16px' transparent={false} />,
  View: ({ props }) => {
    // The schema already let only https:// and /paths through; external ones leave in a new tab.
    const external = props.href.startsWith('https://');
    return (
      <Link
        href={props.href}
        type={props.tone ?? 'default'}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer nofollow' : undefined}
      >
        {props.label}
      </Link>
    );
  },
});
