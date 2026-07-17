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
        // (see components/InlineEdit). Both the preview's own box and the
        // control's (edit-mode) box are neutral; the host cancels its own
        // row padding against whichever one is currently rendered, so the
        // box fills the row without changing row height on toggle. If either
        // box's padding changes, this constant must follow. Consumer
        // overrides of the margin must target AttributeValue (or use `!`
        // importance on the guest) — this rule is parent-scoped and
        // outweighs plain utilities.
        '[&_[data-slot=inline-edit-preview]]:-my-4',
        '[&_[data-slot=inline-edit-control]]:-my-4',
        // Same seam, horizontal axis: pulls the hover/pressed background and
        // hit target 7px further left than surrounding content, on the
        // AttributeValue box itself rather than duplicated per guest. Applies
        // whenever AttributeValue hosts either an InlineEdit or an
        // AttributeActionsTarget, in both orientations, so the guest's text
        // lines up where a plain value would sit (in horizontal the hover row
        // overhangs 3px into the 4px label gap — accepted).
        'has-[[data-slot=inline-edit]]:-ml-7',
        'has-[[data-slot=attribute-actions-target]]:-ml-7',
        // The -ml-7 above pulls the whole box left, including InlineEditError
        // — which isn't part of the wide hover row and has no reason to
        // follow it. Cancel the pull for that one guest so the error message
        // stays flush with the label instead of overhanging its left edge.
        // (An error can only render inside an InlineEdit guest, so whenever
        // this rule matches, the inline-edit pull above is active — in both
        // orientations.)
        '[&_[data-slot=inline-edit-error]]:ml-7',
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
