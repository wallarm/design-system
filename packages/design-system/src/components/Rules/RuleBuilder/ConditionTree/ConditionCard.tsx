/**
 * ConditionCard
 *
 * Reusable card wrapper for individual condition nodes.
 * Provides consistent styling and remove button.
 */

import type { FC, ReactNode, Ref } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { Button } from '../../../Button';
import { Trash2 } from '../../../icons';
import { cn } from '../../../utils/cn';
import { useTestId } from '../../../utils/testId';
import { conditionCardVariants } from './classes';

type ConditionCardVariantProps = VariantProps<typeof conditionCardVariants>;

export interface ConditionCardProps extends ConditionCardVariantProps {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
  onRemove: () => void;
  removeLabel: string;
  className?: string;
}

export const ConditionCard: FC<ConditionCardProps> = ({
  ref,
  variant = 'default',
  children,
  onRemove,
  removeLabel,
  className,
}) => {
  const testId = useTestId('condition-card');

  return (
    <div
      ref={ref}
      data-slot='condition-card'
      data-testid={testId}
      className={cn(conditionCardVariants({ variant }), className)}
    >
      <div className='flex min-w-0 grow flex-col gap-8'>{children}</div>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        aria-label={removeLabel}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  );
};

ConditionCard.displayName = 'ConditionCard';
