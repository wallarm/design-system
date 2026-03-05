import type { FC } from 'react';
import { CirclePlus } from '../../../../icons/CirclePlus';
import { CircleSlash } from '../../../../icons/CircleSlash';
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../../DropdownMenu';
import type { Condition, FieldMetadata } from '../../types';

// ── Recent conditions section ────────────────────────────

interface RecentSectionProps {
  conditions: Condition[];
  fields: FieldMetadata[];
  onSelect: (field: FieldMetadata) => void;
}

export const RecentSection: FC<RecentSectionProps> = ({ conditions, fields, onSelect }) => (
  <>
    <DropdownMenuLabel>Recent</DropdownMenuLabel>
    <DropdownMenuGroup>
      {conditions.map((condition, index) => {
        const fieldMeta = fields.find(f => f.name === condition.field);
        const attribute = fieldMeta?.label || condition.field;
        const operator = String(condition.operator);
        const value = String(condition.value);

        return (
          <DropdownMenuItem
            key={`recent-${index}`}
            value={`recent-${index}`}
            onSelect={() => { if (fieldMeta) onSelect(fieldMeta); }}
          >
            <span className='flex gap-2 items-center text-sm'>
              <span className='text-text-primary'>{attribute}</span>
              <span className='text-text-secondary'>{operator}</span>
              <span className='font-medium text-text-info'>{value}</span>
            </span>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
  </>
);

RecentSection.displayName = 'RecentSection';

// ── Suggested fields section ─────────────────────────────

interface SuggestionsSectionProps {
  fields: FieldMetadata[];
  onSelect: (field: FieldMetadata) => void;
}

export const SuggestionsSection: FC<SuggestionsSectionProps> = ({ fields, onSelect }) => (
  <>
    <DropdownMenuLabel>Suggestions</DropdownMenuLabel>
    <DropdownMenuGroup>
      {fields.map((field, index) => (
        <DropdownMenuItem
          key={`suggested-${index}`}
          value={`suggested-${index}`}
          onSelect={() => onSelect(field)}
        >
          <span className='flex gap-2 items-center text-sm'>
            <span className='text-text-primary'>{field.label}</span>
            <span className='text-text-secondary'>operator</span>
            <span className='font-medium text-text-info'>Value</span>
          </span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
  </>
);

SuggestionsSection.displayName = 'SuggestionsSection';

// ── AND/OR operators section ─────────────────────────────

interface OperatorsSectionProps {
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
}

export const OperatorsSection: FC<OperatorsSectionProps> = ({ onSelectAnd, onSelectOr }) => (
  <>
    <DropdownMenuSeparator />
    {onSelectAnd && (
      <DropdownMenuItem value='and' onSelect={() => onSelectAnd()}>
        <DropdownMenuItemIcon><CirclePlus /></DropdownMenuItemIcon>
        <DropdownMenuItemText>AND</DropdownMenuItemText>
      </DropdownMenuItem>
    )}
    {onSelectOr && (
      <DropdownMenuItem value='or' onSelect={() => onSelectOr()}>
        <DropdownMenuItemIcon><CircleSlash /></DropdownMenuItemIcon>
        <DropdownMenuItemText>OR</DropdownMenuItemText>
      </DropdownMenuItem>
    )}
  </>
);

OperatorsSection.displayName = 'OperatorsSection';
