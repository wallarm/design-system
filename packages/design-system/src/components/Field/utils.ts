import { Children, isValidElement, type ReactNode } from 'react';
import { CheckboxGroup } from '../Checkbox';

export const checkContainCheckboxGroup = (children: ReactNode) => {
  const checkboxGroup = Children.toArray(children).find(item => {
    return isValidElement(item) && item.type === CheckboxGroup;
  });

  return !!checkboxGroup;
};
