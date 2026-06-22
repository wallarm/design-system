import { Children, type FC, isValidElement, type ReactElement, type ReactNode } from 'react';
import { Tour as ArkUiTour } from '@ark-ui/react';
import type { TestableProps } from '../../utils/testId';
import { TourClose } from './TourClose';
import { TourInner } from './TourInner';

export interface TourProps extends Omit<ArkUiTour.RootProps, 'children'>, TestableProps {
  /**
   * Optional override slot for the close control. Pass a `<TourClose>` child
   * (typically with `data-analytics-id`) to suppress the auto-rendered
   * default close button and use the consumer-supplied one in its place.
   */
  children?: ReactNode;
}

const findCustomClose = (children: ReactNode): ReactElement | undefined => {
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === TourClose) {
      return child;
    }
  }
  return undefined;
};

export const Tour: FC<TourProps> = ({
  lazyMount = true,
  unmountOnExit = true,
  'data-testid': testId,
  children,
  ...props
}) => (
  <ArkUiTour.Root {...props} lazyMount={lazyMount} unmountOnExit={unmountOnExit}>
    <TourInner testId={testId} customClose={findCustomClose(children)} />
  </ArkUiTour.Root>
);

Tour.displayName = 'Tour';
