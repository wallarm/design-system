import { Children, type ComponentProps, type FC, isValidElement, type Ref } from 'react';
import { type TestableProps, useTestId } from '../../../utils/testId';
import { IpListHorizontal } from './IpListHorizontal';
import { IpListVertical } from './IpListVertical';

type IpListNativeProps = ComponentProps<'div'>;

type IpListVariantProps =
  | { type?: 'vertical'; asChild?: boolean }
  | { type: 'horizontal'; asChild?: never };

type IpListBaseProps = IpListVariantProps &
  TestableProps & {
    ref?: Ref<HTMLDivElement>;
  };

export type IpListProps = IpListNativeProps & IpListBaseProps;

export const IpList: FC<IpListProps> = ({
  ref,
  type = 'vertical',
  asChild,
  'data-testid': testIdProp,
  className,
  children,
  ...props
}) => {
  const contextTestId = useTestId('list');
  const testId = testIdProp ?? contextTestId;
  const items = Children.toArray(children).filter(isValidElement);

  if (items.length === 0) return null;

  if (type === 'horizontal') {
    return (
      <IpListHorizontal ref={ref} testId={testId} items={items} className={className} {...props} />
    );
  }

  return (
    <IpListVertical
      ref={ref}
      asChild={asChild}
      testId={testId}
      items={items}
      className={className}
      {...props}
    />
  );
};

IpList.displayName = 'IpList';
