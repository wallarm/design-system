import { Children, isValidElement, type ReactNode } from 'react';

// Match the `fieldSlot` tag, not CheckboxGroup's identity: a copy from another
// bundle (e.g. a Module Federation container) is a different function, and a
// wrapper can tag itself the same way.
export const checkContainCheckboxGroup = (children: ReactNode) =>
  Children.toArray(children).some(
    item =>
      isValidElement(item) &&
      typeof item.type === 'function' &&
      (item.type as { fieldSlot?: string }).fieldSlot === 'checkbox-group',
  );
