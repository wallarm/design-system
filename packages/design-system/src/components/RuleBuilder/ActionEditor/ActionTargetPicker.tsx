/**
 * ActionTargetPicker
 *
 * Target selection for actions: whole flow or specific point.
 * Conditionally renders based on action kind's target requirements.
 */

import type { FC } from 'react';
import { PointSelector } from '../../PointSelector';
import { SegmentedControl, SegmentedControlItem } from '../../SegmentedControl';
import type { ActionDraft, ActionKind } from '../types';
import { TARGET_REQUIREMENT } from '../utils/constants';

export interface ActionTargetPickerProps {
  /** Current action draft */
  action: ActionDraft;
  /** Called when target changes */
  onChange: (action: ActionDraft) => void;
}

/**
 * Action target selector with conditional rendering:
 * - 'flow' actions: no picker (always whole request)
 * - 'point' actions: only PointSelector (must specify point)
 * - 'either' actions: toggle + conditional PointSelector
 */
export const ActionTargetPicker: FC<ActionTargetPickerProps> = ({ action, onChange }) => {
  const kind = action.kind as ActionKind;
  const targetMode = TARGET_REQUIREMENT[kind];

  // Flow-only actions: no picker needed
  if (targetMode === 'flow') {
    return null;
  }

  const handleWholeChange = (value: string) => {
    onChange({
      ...action,
      target: {
        ...action.target,
        whole: value === 'whole',
      },
    });
  };

  const handlePointChange = (value: { segments: ActionDraft['target']['segments'] }) => {
    onChange({
      ...action,
      target: {
        ...action.target,
        whole: false,
        segments: value.segments,
      },
    });
  };

  return (
    <div className='flex flex-col gap-8' data-slot='action-target-picker'>
      {targetMode === 'either' && (
        <div className='flex'>
          <SegmentedControl
            value={action.target.whole ? 'whole' : 'part'}
            onChange={handleWholeChange}
          >
            <SegmentedControlItem value='whole'>The whole request</SegmentedControlItem>
            <SegmentedControlItem value='part'>A part of the request</SegmentedControlItem>
          </SegmentedControl>
        </div>
      )}
      {(!action.target.whole || targetMode === 'point') && (
        <PointSelector
          pointOnly
          title={kind === 'combine' ? 'Where do keys repeat?' : 'Which part of the request?'}
          context={action.target.context}
          value={{
            segments: action.target.segments,
            condition: null,
            value: '',
            ignoreCase: false,
            canonical: null,
            canonicalVersion: null,
          }}
          onChange={handlePointChange}
        />
      )}
    </div>
  );
};

ActionTargetPicker.displayName = 'ActionTargetPicker';
