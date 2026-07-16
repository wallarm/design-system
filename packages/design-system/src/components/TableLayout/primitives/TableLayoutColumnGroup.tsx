import { type ComponentPropsWithRef, forwardRef } from 'react';

export const TableLayoutColumnGroup = forwardRef<
  HTMLTableColElement,
  ComponentPropsWithRef<'colgroup'>
>((props, ref) => <colgroup ref={ref} {...props} />);
TableLayoutColumnGroup.displayName = 'TableLayoutColumnGroup';
