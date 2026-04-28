import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useAttributeEmpty } from './AttributeEmptyContext';
import { AttributeLabelDescription } from './AttributeLabelDescription';

export interface AttributeEmptyDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
  children?: ReactNode;
}

/**
 * Description shown only while the surrounding `Attribute` is in the
 * `isEmpty` state. Renders `null` otherwise. Internally a thin conditional
 * wrapper around `AttributeLabelDescription` — same layout, same styling,
 * just gated by `isEmpty`.
 *
 * Typically placed inside `<AttributeLabel>`; works anywhere inside an
 * `<Attribute>` since the visibility comes from context.
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
