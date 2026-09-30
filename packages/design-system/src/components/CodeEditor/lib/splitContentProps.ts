export interface SplitContentProps<TWrapper> {
  /** Attributes for the typing surface (`.cm-content`), as DOM attribute strings */
  contentAttributes: Record<string, string>;
  /** Everything else: className, style, event handlers, other wrapper attributes */
  wrapperProps: TWrapper;
}

const isContentAttribute = (key: string): boolean =>
  key.startsWith('data-') || key.startsWith('aria-') || key === 'id' || key === 'title';

const toAttributeValue = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
};

/**
 * Attribute routing for `CodeEditorContent` (spec D10): `data-*`, `aria-*`,
 * `id`, `title` and `tabIndex` go to the editor's typing surface; the rest stays
 * on the wrapper div. `undefined` / `null` values are dropped, as React would.
 */
export const splitContentProps = <TProps extends object>(
  props: TProps,
): SplitContentProps<TProps> => {
  const contentAttributes: Record<string, string> = {};
  const wrapperProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (key === 'tabIndex') {
      const attribute = toAttributeValue(value);
      if (attribute !== null) contentAttributes.tabindex = attribute;
      continue;
    }
    if (isContentAttribute(key)) {
      const attribute = toAttributeValue(value);
      if (attribute !== null) contentAttributes[key] = attribute;
      continue;
    }
    wrapperProps[key] = value;
  }

  return { contentAttributes, wrapperProps: wrapperProps as TProps };
};
