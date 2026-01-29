import { Children, isValidElement, type PropsWithChildren } from 'react';

import { Text } from '../components/Text';

export const hasNonTextEnd = (
  children: PropsWithChildren['children'],
): boolean => {
  const childrenArray = Children.toArray(children);
  const hasMultipleChildren = childrenArray.length > 1;
  const lastChild = childrenArray[childrenArray.length - 1];

  const isTextComponent = isValidElement(lastChild) && lastChild.type === Text;

  const isLastChildText =
    typeof lastChild === 'string' ||
    typeof lastChild === 'number' ||
    isTextComponent;

  return hasMultipleChildren && !isLastChildText;
};
