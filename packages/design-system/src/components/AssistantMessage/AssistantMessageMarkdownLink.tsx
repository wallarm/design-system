import type { FC } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Link, type LinkProps } from '../Link';
import type { AssistantMessageMarkdownVariant } from './AssistantMessageMarkdown';
import { assistantMessageMarkdownLinkVariants } from './classes';

export interface AssistantMessageMarkdownLinkProps extends Omit<
  LinkProps,
  'href' | 'size' | 'asChild'
> {
  /** Already allow-listed by the renderer: http(s), mailto or relative. */
  href: string;
  /** 'chain-of-thought' → 12px, otherwise 14px. Default 'answer'. */
  variant?: AssistantMessageMarkdownVariant;
}

/**
 * Markdown link: the DS `Link`, inline so it wraps. Absolute URLs open in a new tab without opener or referrer.
 * For in-app paths override `a` with your router's link: a plain href reloads the page.
 */
export const AssistantMessageMarkdownLink: FC<AssistantMessageMarkdownLinkProps> = ({
  href,
  variant = 'answer',
  className,
  'data-testid': testIdProp,
  ...props
}) => {
  const external = /^(?:https?:)?\/\//i.test(href);
  return (
    <Link
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...props}
      href={href}
      size={variant === 'chain-of-thought' ? 'sm' : 'md'}
      data-slot='assistant-message-markdown-link'
      data-testid={useTestId('link', testIdProp)}
      className={cn(assistantMessageMarkdownLinkVariants(), className)}
    />
  );
};

AssistantMessageMarkdownLink.displayName = 'AssistantMessageMarkdownLink';
