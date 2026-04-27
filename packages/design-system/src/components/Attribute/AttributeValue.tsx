import { Children, type FC, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useAttributeOrientation } from './AttributeOrientationContext';

export interface AttributeValueProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

function isEmpty(children: ReactNode): boolean {
  return (
    children === undefined ||
    children === null ||
    children === false ||
    Children.count(children) === 0
  );
}

export const AttributeValue: FC<AttributeValueProps> = ({ ref, children, className, ...props }) => {
  const testId = useTestId('value');
  const orientation = useAttributeOrientation();
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-value'
      className={cn(
        'flex items-center',
        isHorizontal ? 'flex-1 min-w-0 py-4 truncate' : 'pt-4 min-h-[28px]',
        className,
      )}
    >
      {isEmpty(children) ? (
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
