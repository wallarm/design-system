import {
  type ComponentType,
  type FC,
  type ReactNode,
  type Ref,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cva } from 'class-variance-authority';
import { CircleCheckBig, CircleDashed, Info, OctagonAlert, TriangleAlert } from '../../icons';

export type AlertColor = 'primary' | 'destructive' | 'info' | 'warning' | 'success';

const alertIconVariants = cva('shrink-0', {
  variants: {
    color: {
      primary: 'text-icon-primary',
      destructive: 'text-icon-danger',
      info: 'text-icon-info',
      warning: 'text-icon-warning',
      success: 'text-icon-success',
    },
  },
  defaultVariants: {
    color: 'primary',
  },
});

const iconMap: Record<AlertColor, ComponentType<{ className?: string; size?: 'lg' }>> = {
  primary: CircleDashed,
  destructive: OctagonAlert,
  info: Info,
  warning: TriangleAlert,
  success: CircleCheckBig,
};

export interface AlertIconProps {
  ref?: Ref<HTMLDivElement>;
  /** Override the default icon for the variant */
  icon?: ReactNode;
}

/**
 * Icon component for Alert.
 *
 * Automatically displays the appropriate icon based on the parent Alert's data-color attribute.
 * Can be overridden with a custom icon via the `icon` prop.
 */
export const AlertIcon: FC<AlertIconProps> = ({ ref, icon }) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<AlertColor>('primary');

  useLayoutEffect(() => {
    const el = internalRef.current;
    if (!el) return;

    const alertParent = el.closest('[data-color]');
    if (alertParent) {
      const parentColor = alertParent.getAttribute('data-color') as AlertColor;
      if (parentColor && parentColor in iconMap) {
        setColor(parentColor);
      }
    }
  }, []);

  const setRefs = (node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const IconComponent = iconMap[color];

  return (
    <div ref={setRefs} className='py-2 shrink-0'>
      {icon || <IconComponent size='lg' className={alertIconVariants({ color })} />}
    </div>
  );
};

AlertIcon.displayName = 'AlertIcon';
