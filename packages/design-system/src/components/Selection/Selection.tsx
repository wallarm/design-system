import type { FC, ReactNode } from 'react';
import type { TestableProps } from '../../utils/testId';

export interface SelectionProps<T> extends TestableProps {
  items: T[];
  getItemId: (item: T) => string;
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
  children?: ReactNode;
}

export const Selection = <T,>(_props: SelectionProps<T>) => {
  return null;
};

(Selection as FC).displayName = 'Selection';
