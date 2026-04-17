import { Children, type ComponentProps, type FC, isValidElement, type Ref } from 'react';
import { useTestId } from '../../../utils/testId';
import { IpListHorizontal } from './IpListHorizontal';
import { IpListVertical } from './IpListVertical';

type IpListNativeProps = ComponentProps<'div'>;

type IpListVariantProps =
  | { type?: 'vertical'; asChild?: boolean }
  | { type: 'horizontal'; asChild?: never };

type IpListBaseProps = IpListVariantProps & {
  ref?: Ref<HTMLDivElement>;
};

export type IpListProps = IpListNativeProps & IpListBaseProps;

export const IpList: FC<IpListProps> = ({
  ref,
  type = 'vertical',
  asChild,
  className,
  children,
  ...props
}) => {
  const testId = useTestId('list');
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
