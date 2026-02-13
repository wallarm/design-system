import type { FC } from 'react';
import { X } from '../../icons';
import { Button } from '../Button';

interface TemporalClearProps {
  disabled?: boolean;
  onClick: () => void;
}

export const TemporalClear: FC<TemporalClearProps> = ({ onClick, disabled = false }) => (
  <Button variant='ghost' color='neutral' size='small' onClick={onClick} disabled={disabled}>
    <X />
  </Button>
);
