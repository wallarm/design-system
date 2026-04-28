import type { FC } from 'react';
import { Skeleton } from '../Skeleton';
import { AttributeLabel } from './AttributeLabel';
import { useAttributeOrientation } from './AttributeOrientationContext';
import { AttributeValue } from './AttributeValue';

export const AttributeLoading: FC = () => {
  const orientation = useAttributeOrientation();
  const valueHeight = orientation === 'horizontal' ? '16px' : '24px';

  return (
    <>
      <AttributeLabel>
        <Skeleton width='100px' height='16px' rounded={6} />
      </AttributeLabel>
      <AttributeValue>
        <Skeleton width='100%' height={valueHeight} rounded={6} />
      </AttributeValue>
    </>
  );
};

AttributeLoading.displayName = 'AttributeLoading';
