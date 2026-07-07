import { Children, type FC, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useAttributeEmpty } from './AttributeEmptyContext';
import { useAttributeOrientation } from './AttributeOrientationContext';

export interface AttributeValueProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

const isEmptyChildren = (children: ReactNode): boolean =>
  children === undefined ||
  children === null ||
  children === false ||
  Children.count(children) === 0;

export const AttributeValue: FC<AttributeValueProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('value');
  const orientation = useAttributeOrientation();
  const isEmptyAttribute = useAttributeEmpty();
  const isHorizontal = orientation === 'horizontal';
  const hasEmptyChildren = isEmptyChildren(children);
  const showPlaceholder = isEmptyAttribute || hasEmptyChildren;

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-value'
      className={cn(
        'flex items-center',
        // InlineEdit hosting seam, keyed on the guest's data-slot contract
        // (see components/InlineEdit). The preview's own px-6/py-4 hover box
        // is neutral; the host cancels its row padding so the box fills the
        // row without changing row height. If the preview's padding changes,
        // this constant must follow. Consumer overrides of the margin must
        // target AttributeValue (or use `!` importance on the preview) —
        // this rule is parent-scoped and outweighs plain utilities.
        '[&_[data-slot=inline-edit-preview]]:-my-4',
        // Un-clip non-portaled editor dropdowns (horizontal `truncate` sets
        // overflow-hidden). :has() only matches while an InlineEdit is hosted.
        'has-[[data-slot=inline-edit]]:overflow-visible',
        isHorizontal ? 'flex-1 min-w-0 py-4 truncate' : 'pt-4 min-h-[28px]',
        className,
      )}
    >
      {showPlaceholder ? (
        <Text size='sm' color='secondary'>
          &mdash;
        </Text>
      ) : (
        children
      )}
    </div>
  );
};

AttributeValue.displayName = 'AttributeValue';
