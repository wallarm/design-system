import { type ComponentPropsWithRef, forwardRef } from 'react';

export const TableLayoutBody = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithRef<'tbody'>
>((props, ref) => <tbody ref={ref} {...props} />);
TableLayoutBody.displayName = 'TableLayoutBody';
