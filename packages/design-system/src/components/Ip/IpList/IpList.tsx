import { Children, type ComponentProps, type FC, type Ref } from 'react';
import { useTestId } from '../../../utils/testId';
import { IpListHorizontal } from './IpListHorizontal';
import { IpListVertical } from './IpListVertical';

type IpListNativeProps = ComponentProps<'div'>;

type IpListType = 'vertical' | 'horizontal';

interface IpListBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  type?: IpListType;
}

export type IpListProps = IpListNativeProps & IpListBaseProps;

export const IpList: FC<IpListProps> = ({
  ref,
  asChild = false,
  type = 'vertical',
  className,
  children,
  ...props
}) => {
  const testId = useTestId('list');
  const items = Children.toArray(children);

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
