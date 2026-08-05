import { type FC, Fragment } from 'react';
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
import type { FieldMenuSection } from '../../lib';
import type { Condition, FieldMetadata } from '../../types';

interface RecentSectionProps {
  conditions: Condition[];
  fields: FieldMetadata[];
  onSelect: (field: FieldMetadata) => void;
  registerItem: (id: string) => (el: HTMLElement | null) => void;
}

export const RecentSection: FC<RecentSectionProps> = ({
  conditions,
  fields,
  onSelect,
  registerItem,
}) => (
  <>
    <div className='flex flex-col gap-1'>
      <DropdownMenuLabel sticky>Recent</DropdownMenuLabel>
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
              ref={registerItem(`recent-${index}`)}
              onSelect={() => {
                if (fieldMeta) onSelect(fieldMeta);
              }}
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
    </div>
    <DropdownMenuSeparator />
  </>
);

RecentSection.displayName = 'RecentSection';

interface SuggestionsSectionProps {
  fields: FieldMetadata[];
  onSelect: (field: FieldMetadata) => void;
  registerItem: (id: string) => (el: HTMLElement | null) => void;
}

export const SuggestionsSection: FC<SuggestionsSectionProps> = ({
  fields,
  onSelect,
  registerItem,
}) => (
  <>
    <div className='flex flex-col gap-1'>
      <DropdownMenuLabel sticky>Suggestions</DropdownMenuLabel>
      <DropdownMenuGroup>
        {fields.map((field, index) => (
          <DropdownMenuItem
            key={`suggested-${index}`}
            value={`suggested-${index}`}
            ref={registerItem(`suggested-${index}`)}
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
    </div>
    <DropdownMenuSeparator />
  </>
);

SuggestionsSection.displayName = 'SuggestionsSection';

interface OperatorsSectionProps {
  onSelectAnd?: () => void;
  onSelectOr?: () => void;
  registerItem: (id: string) => (el: HTMLElement | null) => void;
}

export const OperatorsSection: FC<OperatorsSectionProps> = ({
  onSelectAnd,
  onSelectOr,
  registerItem,
}) => (
  <>
    <DropdownMenuSeparator />
    {onSelectAnd && (
      <DropdownMenuItem value='and' ref={registerItem('and')} onSelect={() => onSelectAnd()}>
        <DropdownMenuItemIcon>
          <CirclePlus />
        </DropdownMenuItemIcon>
        <DropdownMenuItemText>AND</DropdownMenuItemText>
      </DropdownMenuItem>
    )}
    {onSelectOr && (
      <DropdownMenuItem value='or' ref={registerItem('or')} onSelect={() => onSelectOr()}>
        <DropdownMenuItemIcon>
          <CircleSlash />
        </DropdownMenuItemIcon>
        <DropdownMenuItemText>OR</DropdownMenuItemText>
      </DropdownMenuItem>
    )}
  </>
);

OperatorsSection.displayName = 'OperatorsSection';

interface FieldSectionsProps {
  sections: FieldMenuSection[];
  onSelect: (field: FieldMetadata) => void;
  registerItem: (id: string) => (el: HTMLElement | null) => void;
}

export const FieldSections: FC<FieldSectionsProps> = ({ sections, onSelect, registerItem }) => (
  <>
    {sections.map((section, index) => {
      const group = (
        <DropdownMenuGroup>
          {section.fields.map(field => (
            <DropdownMenuItem
              key={field.name}
              value={`field-${field.name}`}
              ref={registerItem(`field-${field.name}`)}
              onSelect={() => onSelect(field)}
              className='scroll-mt-32'
            >
              <DropdownMenuItemText>{field.label}</DropdownMenuItemText>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      );
      return (
        <Fragment key={`${section.label ?? 'ungrouped'}-${index}`}>
          {index > 0 && <DropdownMenuSeparator />}
          {section.label ? (
            // Per-section wrapper bounds the sticky group header while scrolling.
            <div className='flex flex-col gap-1'>
              <DropdownMenuLabel sticky>{section.label}</DropdownMenuLabel>
              {group}
            </div>
          ) : (
            group
          )}
        </Fragment>
      );
    })}
  </>
);

FieldSections.displayName = 'FieldSections';
