import { isValidElement, type PropsWithChildren, type ReactNode } from 'react';
import { IpCountry } from '../IpCountry';

export const checkHasCountry = (node: ReactNode): boolean => {
  if (isValidElement<PropsWithChildren>(node) && Array.isArray(node.props.children)) {
    const hasCountry = node.props.children.find(c => isValidElement(c) && c.type === IpCountry);

    return !!hasCountry;
  }

  return false;
};
