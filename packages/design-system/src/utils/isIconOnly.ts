import { Children, type PropsWithChildren } from 'react';
import { isSvgElement } from './isValidSvg';

export const isIconOnly = (children: PropsWithChildren['children']): boolean =>
  Children.count(children) === 1 && isSvgElement(children);
