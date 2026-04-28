import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useAttributeEmpty } from './AttributeEmptyContext';
import { AttributeLabelDescription } from './AttributeLabelDescription';

export interface AttributeEmptyDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
}

/**
 * Description shown next to the label only while the surrounding `Attribute`
 * is in the `isEmpty` state. Renders nothing otherwise. Internally a thin
 * conditional wrapper around `AttributeLabelDescription` — same layout, same
 * styling, just gated by `isEmpty`.
 *
 * Place it inside `AttributeLabel`:
 *
 * ```tsx
 * <Attribute isEmpty>
 *   <AttributeLabel>
 *     Owner
 *     <AttributeEmptyDescription>Not yet assigned</AttributeEmptyDescription>
 *   </AttributeLabel>
 *   <AttributeValue />
 * </Attribute>
 * ```
 */
export const AttributeEmptyDescription: FC<AttributeEmptyDescriptionProps> = ({
  ref,
  children,
  ...props
}) => {
  const isEmpty = useAttributeEmpty();
  if (!isEmpty) return null;
  return (
    <AttributeLabelDescription {...props} ref={ref}>
      {children}
    </AttributeLabelDescription>
  );
};

AttributeEmptyDescription.displayName = 'AttributeEmptyDescription';
