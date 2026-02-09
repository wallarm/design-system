import type {
  ComponentPropsWithoutRef,
  ElementType,
  FC,
  PropsWithChildren,
  ReactElement,
  Ref,
} from 'react';

export type AsProp<C extends ElementType> = {
  as?: C;
};

export type PolymorphicComponentProps<C extends ElementType, Props = object> = PropsWithChildren<
  Props & AsProp<C>
> &
  Omit<ComponentPropsWithoutRef<C>, keyof (AsProp<C> & Props)>;

export type PolymorphicComponent<T extends ElementType, Props = object> = {
  <C extends ElementType = T>(
    props: PolymorphicComponentProps<C, Props> & { ref?: Ref<unknown> },
  ): ReactElement | null;
};

export type PolymorphicProps = {
  className?: string;
  ref?: Ref<unknown>;
};

export const Polymorphic: FC<PolymorphicComponentProps<ElementType, PolymorphicProps>> = ({
  as = 'div',
  className,
  children,
  ...props
}) => {
  const Component = as;

  return (
    <Component className={className} {...props}>
      {children}
    </Component>
  );
};

Polymorphic.displayName = 'Polymorphic';
