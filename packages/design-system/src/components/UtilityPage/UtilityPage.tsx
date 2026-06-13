import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { AnimatedBackground } from '../AnimatedBackground';
import { Logo } from '../Logo';

export interface UtilityPageProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  title: string;
  subtitle: string;
  description: string;
  children?: ReactNode;
}

export const UtilityPage: FC<UtilityPageProps> = ({
  ref,
  title,
  subtitle,
  description,
  className,
  children,
  ...props
}) => (
  <AnimatedBackground
    {...props}
    ref={ref}
    data-slot='utility-page'
    className={cn('min-h-screen w-full bg-component-app-shell-bg', className)}
  >
    <div className='flex w-[482px] flex-col items-center gap-32 rounded-12 border-1 border-border-primary-light bg-bg-surface-1 px-48 pt-32 pb-80'>
      <Logo type='full' size='md' className='self-start mb-32' />

      <div className='w-full flex flex-col items-start'>
        <h1 className='font-mono text-6xl leading-7xl font-medium text-text-primary'>{title}</h1>

        <div className='flex flex-col items-start'>
          <p className='text-lg leading-xl font-medium text-text-primary'>{subtitle}</p>
          <p className='text-sm text-text-secondary'>{description}</p>
        </div>
      </div>

      {children && <div className='w-full flex flex-col gap-8'>{children}</div>}
    </div>
  </AnimatedBackground>
);

UtilityPage.displayName = 'UtilityPage';
