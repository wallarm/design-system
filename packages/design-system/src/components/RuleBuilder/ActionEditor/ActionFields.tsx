/**
 * ActionFields
 *
 * Conditional field rendering based on action kind.
 * Each action type has different required fields.
 */

import type { FC } from 'react';
import { useMemo } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../../Checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from '../../Field';
import { Input } from '../../Input';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../Select';
import type { ActionDraft, ActionKind, Choice, GroupCondition } from '../types';
import { isValidDuration, isValidQuantity } from '../models/validation';
import { PARSER_CHOICES } from '../utils/constants';
import { extractBindings } from '../utils/extractBindings';
import { AttackTypeField } from './AttackTypeField';

const WIDE = { maxWidth: 420 } as const;

export interface ActionFieldsProps {
  /** Current action draft */
  action: ActionDraft;
  /** Called when action changes */
  onChange: (action: ActionDraft) => void;
  /** Available attack types for selection */
  attackTypes: Choice[];
  /** Current condition tree (for extracting bindings) */
  condition: GroupCondition;
}

/**
 * Renders action-specific fields based on action.kind.
 * Switches on kind and renders appropriate input fields.
 */
export const ActionFields: FC<ActionFieldsProps> = ({
  action,
  onChange,
  attackTypes,
  condition,
}) => {
  const set = (patch: Partial<ActionDraft>) => onChange({ ...action, ...patch });
  const kind = action.kind as ActionKind;

  // Extract available bindings from condition tree
  const bindings = useMemo(() => extractBindings(condition), [condition]);
  const attackBindings = useMemo(() => bindings.filter(b => b.type === 'attack'), [bindings]);
  const pointBindings = useMemo(() => bindings.filter(b => b.type === 'point'), [bindings]);

  return (
    <div className='flex flex-col gap-12' data-slot='action-fields'>
      {/* Attack type field (add_attack, suppress_attack, mark_attack) */}
      {(kind === 'add_attack' || kind === 'suppress_attack' || kind === 'mark_attack') && (
        <Field>
          <FieldLabel>{kind === 'add_attack' ? 'Attack type' : 'Which attacks'}</FieldLabel>
          <AttackTypeField
            value={action.attackType ?? ''}
            choices={attackTypes}
            allowAny={kind !== 'add_attack'}
            onChange={attackType => set({ attackType })}
          />
        </Field>
      )}

      {/* Comment field (add_attack only) */}
      {kind === 'add_attack' && (
        <div style={WIDE}>
          <Field>
            <FieldLabel>Comment</FieldLabel>
            <Input value={action.comment ?? ''} onChange={e => set({ comment: e.target.value })} />
            <FieldDescription>Shown with the attack in events.</FieldDescription>
          </Field>
        </div>
      )}

      {/* Known labels (add_attack, mark_attack) */}
      {(kind === 'add_attack' || kind === 'mark_attack') && (
        <div className='flex flex-col gap-12'>
          <div className='text-sm font-medium text-text-primary'>Known attack labels</div>
          <div className='flex flex-wrap gap-12'>
            <div style={{ width: 200 }}>
              <Field>
                <FieldLabel>CVE IDs</FieldLabel>
                <Input
                  value={(action.known?.cve ?? []).join(', ')}
                  onChange={e => {
                    const val = e.target.value.trim();
                    const cve = val === '' ? undefined : val.split(/\s*,\s*/);
                    set({ known: { ...action.known, cve } });
                  }}
                  placeholder='CVE-2024-1234, ...'
                />
                <FieldDescription>Comma-separated CVE identifiers</FieldDescription>
              </Field>
            </div>
            <div style={{ width: 200 }}>
              <Field>
                <FieldLabel>Vulnerabilities</FieldLabel>
                <Input
                  value={(action.known?.vuln ?? []).join(', ')}
                  onChange={e => {
                    const val = e.target.value.trim();
                    const vuln = val === '' ? undefined : val.split(/\s*,\s*/);
                    set({ known: { ...action.known, vuln } });
                  }}
                  placeholder='sqli, xss, ...'
                />
                <FieldDescription>Vulnerability types</FieldDescription>
              </Field>
            </div>
          </div>
          <div className='flex flex-wrap gap-12'>
            <div style={{ width: 200 }}>
              <Field>
                <FieldLabel>Techniques</FieldLabel>
                <Input
                  value={(action.known?.technique ?? []).join(', ')}
                  onChange={e => {
                    const val = e.target.value.trim();
                    const technique = val === '' ? undefined : val.split(/\s*,\s*/);
                    set({ known: { ...action.known, technique } });
                  }}
                  placeholder='T1190, T1059, ...'
                />
                <FieldDescription>MITRE ATT&CK technique IDs</FieldDescription>
              </Field>
            </div>
            <div style={{ width: 200 }}>
              <Field>
                <FieldLabel>Payloads</FieldLabel>
                <Input
                  value={(action.known?.payload ?? []).join(', ')}
                  onChange={e => {
                    const val = e.target.value.trim();
                    const payload = val === '' ? undefined : val.split(/\s*,\s*/);
                    set({ known: { ...action.known, payload } });
                  }}
                  placeholder='union-select, alert-xss, ...'
                />
                <FieldDescription>Known payload patterns</FieldDescription>
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Known false positive reasons (add_attack, mark_attack) */}
      {(kind === 'add_attack' || kind === 'mark_attack') && (
        <div style={WIDE}>
          <Field>
            <FieldLabel>Known false positive reasons</FieldLabel>
            <Input
              value={
                Array.isArray(action.knownFalse)
                  ? action.knownFalse.join(', ')
                  : (action.knownFalse ?? '')
              }
              onChange={e => {
                const val = e.target.value.trim();
                const knownFalse = val === '' ? undefined : val.split(/\s*,\s*/);
                set({ knownFalse });
              }}
              placeholder='safe-html, benign-pattern, ...'
            />
            <FieldDescription>
              Comma-separated reasons why this might be a false positive. Used for mark_attack to
              flag known safe cases.
            </FieldDescription>
          </Field>
        </div>
      )}

      {/* Tag fields (add_tag) */}
      {kind === 'add_tag' && (
        <div className='flex flex-wrap gap-12'>
          <div style={{ width: 220 }}>
            <Field>
              <FieldLabel>Tag key</FieldLabel>
              <Input value={action.tagKey ?? ''} onChange={e => set({ tagKey: e.target.value })} />
            </Field>
          </div>
          <div style={{ width: 220 }}>
            <Field>
              <FieldLabel>Tag value</FieldLabel>
              <Input
                value={action.tagValue ?? ''}
                onChange={e => set({ tagValue: e.target.value })}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Experimental checkbox (add_attack, add_tag) */}
      {(kind === 'add_attack' || kind === 'add_tag') && (
        <Checkbox
          checked={action.experimental === true}
          onCheckedChange={d => set({ experimental: d.checked === true })}
        >
          <CheckboxIndicator />
          <CheckboxLabel>Report only — do not block on it</CheckboxLabel>
        </Checkbox>
      )}

      {/* Separator field (combine) */}
      {kind === 'combine' && (
        <div style={{ width: 220 }}>
          <Field>
            <FieldLabel>Join values with</FieldLabel>
            <Input
              value={action.separator ?? ''}
              onChange={e => set({ separator: e.target.value })}
            />
            <FieldDescription>Any text, including none.</FieldDescription>
          </Field>
        </div>
      )}

      {/* Limit fields (processing_time_limit, processing_space_limit) */}
      {(kind === 'processing_time_limit' || kind === 'processing_space_limit') && (() => {
        const isDuration = kind === 'processing_time_limit';
        const limitValue = action.limit ?? '';
        const hasError = limitValue !== '' && (
          isDuration ? !isValidDuration(limitValue) : !isValidQuantity(limitValue)
        );

        return (
          <div style={{ width: 220 }}>
            <Field>
              <FieldLabel>
                {isDuration ? 'Time limit' : 'Memory limit'}
              </FieldLabel>
              <Input
                value={limitValue}
                onChange={e => set({ limit: e.target.value })}
                invalid={hasError}
              />
              {hasError ? (
                <FieldError>
                  {isDuration
                    ? 'Invalid Go duration (e.g., "1.5ms", "300us", "2h45m")'
                    : 'Invalid quantity (e.g., "512", "1.5Ki", "2Mi")'
                  }
                </FieldError>
              ) : (
                <FieldDescription>
                  {isDuration
                    ? 'For example 5ms or 1.5s'
                    : 'For example 512Ki or 2Mi'}
                </FieldDescription>
              )}
            </Field>
          </div>
        );
      })()}

      {/* Entry limits (soft/hard) */}
      {kind === 'entry_limits' && (() => {
        const softValue = action.softLimit ?? '';
        const hardValue = action.hardLimit ?? '';
        const softError = softValue !== '' && !isValidQuantity(softValue);
        const hardError = hardValue !== '' && !isValidQuantity(hardValue);

        return (
          <div className='flex flex-wrap gap-12'>
            <div style={{ width: 200 }}>
              <Field>
                <FieldLabel>Soft limit</FieldLabel>
                <Input
                  value={softValue}
                  onChange={e => set({ softLimit: e.target.value })}
                  invalid={softError}
                />
                {softError ? (
                  <FieldError>Invalid quantity (e.g., "512", "1.5Ki", "2Mi")</FieldError>
                ) : (
                  <FieldDescription>Larger values are flagged</FieldDescription>
                )}
              </Field>
            </div>
            <div style={{ width: 200 }}>
              <Field>
                <FieldLabel>Hard limit</FieldLabel>
                <Input
                  value={hardValue}
                  onChange={e => set({ hardLimit: e.target.value })}
                  invalid={hardError}
                />
                {hardError ? (
                  <FieldError>Invalid quantity (e.g., "512", "1.5Ki", "2Mi")</FieldError>
                ) : (
                  <FieldDescription>Larger values are cut off</FieldDescription>
                )}
              </Field>
            </div>
          </div>
        );
      })()}

      {/* Priority field (limit actions) */}
      {(kind === 'processing_time_limit' ||
        kind === 'processing_space_limit' ||
        kind === 'entry_limits') && (
        <div style={{ width: 200 }}>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Input
              inputMode='numeric'
              value={action.priority ?? ''}
              onChange={e => set({ priority: e.target.value })}
            />
            <FieldDescription>When rules disagree, the higher one wins.</FieldDescription>
          </Field>
        </div>
      )}

      {/* Parsers field (disable_parsers, allow_parsers) */}
      {(kind === 'disable_parsers' || kind === 'allow_parsers') && (
        <div style={WIDE}>
          <Field>
            <FieldLabel>
              {kind === 'disable_parsers' ? 'Disable these parsers' : 'Allow these parsers'}
            </FieldLabel>
            <Input
              value={
                Array.isArray(action.parsers) ? action.parsers.join(', ') : (action.parsers ?? '')
              }
              onChange={e => {
                const val = e.target.value.trim();
                set({ parsers: val === 'all' || val === '' ? val : val.split(/\s*,\s*/) });
              }}
              placeholder={
                kind === 'disable_parsers'
                  ? 'Parser names (comma-separated) or "all"'
                  : 'Parser names (comma-separated), "all", or leave empty for none'
              }
            />
            <FieldDescription>
              {kind === 'disable_parsers'
                ? 'Prevent these parsers from running. Use "all" to disable all parsers.'
                : 'Only allow these parsers to run. Use "all" to allow all, or leave empty to allow none.'}
              {` Available: ${PARSER_CHOICES.map(p => p.value).join(', ')}`}
            </FieldDescription>
          </Field>
        </div>
      )}

      {/* Parser field (force_parser) */}
      {kind === 'force_parser' &&
        (() => {
          const parserCollection = createListCollection({ items: PARSER_CHOICES });
          return (
            <div style={{ width: 300 }}>
              <Field>
                <FieldLabel>Force this parser</FieldLabel>
                <Select
                  collection={parserCollection}
                  value={action.parser ? [action.parser] : []}
                  onValueChange={details => set({ parser: details.value[0] ?? '' })}
                  positioning={{ sameWidth: true }}
                >
                  <SelectButton>{action.parser || 'Choose a parser...'}</SelectButton>
                  <SelectPositioner>
                    <SelectContent>
                      {PARSER_CHOICES.map(choice => (
                        <SelectOption key={choice.value} item={choice}>
                          <SelectOptionText>{choice.label}</SelectOptionText>
                          <SelectOptionIndicator />
                        </SelectOption>
                      ))}
                    </SelectContent>
                  </SelectPositioner>
                </Select>
                <FieldDescription>
                  This parser will be forced at the target, bypassing auto-detection.
                </FieldDescription>
              </Field>
            </div>
          );
        })()}

      {/* Rule IDs field (disable_rule) */}
      {kind === 'disable_rule' && (
        <div style={WIDE}>
          <Field>
            <FieldLabel>Rule IDs to disable</FieldLabel>
            <Input
              value={(action.ruleIds ?? []).join(', ')}
              onChange={e => {
                const val = e.target.value.trim();
                set({ ruleIds: val === '' ? [] : val.split(/\s*,\s*/) });
              }}
              placeholder='UUID-1, UUID-2, ...'
            />
            <FieldDescription>
              Comma-separated list of rule IDs (meta.id values) to disable when this rule fires.
            </FieldDescription>
          </Field>
        </div>
      )}

      {/* Priority field (parser actions) */}
      {(kind === 'disable_parsers' || kind === 'allow_parsers' || kind === 'force_parser') && (
        <div style={{ width: 200 }}>
          <Field>
            <FieldLabel>Priority</FieldLabel>
            <Input
              inputMode='numeric'
              value={action.priority ?? ''}
              onChange={e => set({ priority: e.target.value })}
            />
            <FieldDescription>When parse settings conflict, higher priority wins.</FieldDescription>
          </Field>
        </div>
      )}

      {/* Binding fields - attack_ref for suppress_attack and mark_attack */}
      {(kind === 'suppress_attack' || kind === 'mark_attack') &&
        (() => {
          const attackRefChoices = [
            { value: '', label: '(Any attack)' },
            ...attackBindings.map(b => ({ value: b.id, label: b.label })),
          ];
          const attackRefCollection = createListCollection({ items: attackRefChoices });

          return (
            <div style={{ width: 360 }}>
              <Field>
                <FieldLabel>Attack reference (optional)</FieldLabel>
                {attackBindings.length > 0 ? (
                  <Select
                    collection={attackRefCollection}
                    value={action.attackRef ? [action.attackRef] : ['']}
                    onValueChange={details => set({ attackRef: details.value[0] || undefined })}
                    positioning={{ sameWidth: true }}
                  >
                    <SelectButton>
                      {attackRefChoices.find(c => c.value === (action.attackRef ?? ''))?.label ||
                        '(Any attack)'}
                    </SelectButton>
                    <SelectPositioner>
                      <SelectContent>
                        {attackRefChoices.map(choice => (
                          <SelectOption key={choice.value} item={choice}>
                            <SelectOptionText>{choice.label}</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                ) : (
                  <Input
                    value={action.attackRef ?? ''}
                    onChange={e => set({ attackRef: e.target.value || undefined })}
                    placeholder='e.g., "a"'
                    className='font-mono text-sm'
                  />
                )}
                <FieldDescription>
                  {attackBindings.length > 0
                    ? 'Reference to bind_attack ID from condition. Acts on attacks that check matched.'
                    : 'No attack bindings available. Add bind_attack to an attack condition first.'}
                </FieldDescription>
              </Field>
            </div>
          );
        })()}

      {/* Binding fields - target_ref for actions with point target */}
      {kind !== 'disable_rule' &&
        (() => {
          const targetRefChoices = [
            { value: '', label: '(No binding)' },
            ...pointBindings.map(b => ({ value: b.id, label: b.label })),
          ];
          const targetRefCollection = createListCollection({ items: targetRefChoices });

          const roleChoices = [
            { value: '', label: 'On node (default)' },
            { value: 'before', label: 'Before node' },
            { value: 'after', label: 'After node' },
            { value: 'child', label: 'As child' },
          ];
          const roleCollection = createListCollection({ items: roleChoices });

          return (
            <div className='flex flex-wrap gap-12'>
              <div style={{ width: 360 }}>
                <Field>
                  <FieldLabel>Target reference (optional)</FieldLabel>
                  {pointBindings.length > 0 ? (
                    <Select
                      collection={targetRefCollection}
                      value={action.targetRef ? [action.targetRef] : ['']}
                      onValueChange={details => set({ targetRef: details.value[0] || undefined })}
                      positioning={{ sameWidth: true }}
                    >
                      <SelectButton>
                        {targetRefChoices.find(c => c.value === (action.targetRef ?? ''))?.label ||
                          '(No binding)'}
                      </SelectButton>
                      <SelectPositioner>
                        <SelectContent>
                          {targetRefChoices.map(choice => (
                            <SelectOption key={choice.value} item={choice}>
                              <SelectOptionText>{choice.label}</SelectOptionText>
                              <SelectOptionIndicator />
                            </SelectOption>
                          ))}
                        </SelectContent>
                      </SelectPositioner>
                    </Select>
                  ) : (
                    <Input
                      value={action.targetRef ?? ''}
                      onChange={e => set({ targetRef: e.target.value || undefined })}
                      placeholder='e.g., "n"'
                      className='font-mono text-sm'
                    />
                  )}
                  <FieldDescription>
                    {pointBindings.length > 0
                      ? 'Reference to bind_point ID from condition. Lands action at matched nodes.'
                      : 'No point bindings available. Add bind_point to a field or signal condition first.'}
                  </FieldDescription>
                </Field>
              </div>

              {/* target_role - only when target_ref is set */}
              {action.targetRef && (
                <div style={{ width: 220 }}>
                  <Field>
                    <FieldLabel>Target role</FieldLabel>
                    <Select
                      collection={roleCollection}
                      value={action.targetRole ? [action.targetRole] : ['']}
                      onValueChange={details =>
                        set({
                          targetRole:
                            details.value[0] === '' ? undefined : (details.value[0] as any),
                        })
                      }
                      positioning={{ sameWidth: true }}
                    >
                      <SelectButton>
                        {roleChoices.find(c => c.value === (action.targetRole ?? ''))?.label ||
                          'On node (default)'}
                      </SelectButton>
                      <SelectPositioner>
                        <SelectContent>
                          {roleChoices.map(choice => (
                            <SelectOption key={choice.value} item={choice}>
                              <SelectOptionText>{choice.label}</SelectOptionText>
                              <SelectOptionIndicator />
                            </SelectOption>
                          ))}
                        </SelectContent>
                      </SelectPositioner>
                    </Select>
                    <FieldDescription>Where to land relative to bound node.</FieldDescription>
                  </Field>
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
};

ActionFields.displayName = 'ActionFields';
