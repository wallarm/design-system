import { cloneElement, isValidElement, type ReactNode } from 'react';

/**
 * With `asChild`, Ark merges the child's props over the trigger's, so a child `disabled={false}`
 * (e.g. `<Button disabled={isSaving}>`) would re-enable Next on the last step or Prev on the first.
 * This takes the child's `disabled` out, for the trigger to fold into its own, so the trigger's
 * computed value always wins.
 */
export const takeAsChildDisabled = (
  asChild: boolean | undefined,
  children: ReactNode,
): { children: ReactNode; childDisabled?: boolean } => {
  if (!asChild || !isValidElement<{ disabled?: boolean }>(children)) return { children };
  const { disabled } = children.props;
  if (disabled === undefined) return { children };
  return { children: cloneElement(children, { disabled: undefined }), childDisabled: disabled };
};
