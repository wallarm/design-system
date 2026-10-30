/**
 * RuleBuilder - Main orchestrator component
 *
 * Combines ConditionTree, ActionEditor, and code output into a complete
 * rule authoring interface. Manages validation display and section control.
 */

import type { FC, ReactNode, Ref } from 'react';
import { useEffect, useMemo } from 'react';
import { type Proton, useProton } from '@wallarm-org/rules-lib';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { Code } from '../Code';
import { checkPoint, needsRecanonalization } from '../PointSelector/sdkBridge';
import { Text } from '../Text';
import { ActionEditor } from './ActionEditor';
import { ConditionTree } from './ConditionTree';
import { ruleBuilderVariants } from './classes';
import { toProtonAction } from './models/actionModel';
import { conditionProblems, toProtonCondition } from './models/conditionModel';
import {
  actionProblems,
  ruleMetaProblems,
  validateBindingRefs,
  validateBindingUniqueness,
} from './models/validation';
import type {
  ActionDraft,
  AttackCondition,
  Choice,
  ConditionNode,
  FieldCondition,
  GroupCondition,
  SignalCondition,
  TagCondition,
} from './types';

export type RuleBuilderSection = 'conditions' | 'action' | 'code';

export interface RuleBuilderProps extends TestableProps {
  ref?: Ref<HTMLDivElement>;

  /** Rule ID (required, non-empty) — ruleset meta.id field */
  ruleId: string;

  /** Rule description (optional) — ruleset meta.desc field */
  ruleDescription?: string;

  /** Application scope (optional) — restricts rule to specific application_id */
  scope?: { application_id?: string };

  /** Current condition tree (empty group = unconditional rule) */
  condition: GroupCondition;

  /** Current action configuration */
  action: ActionDraft;

  /** Called when condition tree changes */
  onConditionChange: (condition: GroupCondition) => void;

  /** Called when action changes */
  onActionChange: (action: ActionDraft) => void;

  /** Available attack types for selection */
  attackTypes: Choice[];

  /** Show validation errors (after first save attempt) */
  showProblems?: boolean;

  /** Which sections to render (default: all) */
  sections?: readonly RuleBuilderSection[];

  /** Content to render after conditions section */
  afterConditions?: ReactNode;

  /** Additional CSS class */
  className?: string;

  /** Proton SDK instance (optional, will use useProton if not provided) */
  proton?: Proton | null;
}

const ALL_SECTIONS: readonly RuleBuilderSection[] = ['conditions', 'action', 'code'];

/**
 * Main RuleBuilder orchestrator component.
 *
 * Combines condition tree editing, action configuration, and JSON code output
 * into a complete rule authoring interface.
 *
 * @example
 * ```tsx
 * const [condition, setCondition] = useState(newGroup('and'));
 * const [action, setAction] = useState(newAction('add_attack'));
 *
 * <RuleBuilder
 *   ruleId="my-rule-1"
 *   ruleDescription="Block SQL injection attempts"
 *   scope={{ application_id: 'app-123' }}
 *   condition={condition}
 *   action={action}
 *   onConditionChange={setCondition}
 *   onActionChange={setAction}
 *   attackTypes={attackTypeChoices}
 *   showProblems={showValidation}
 * />
 * ```
 */
export const RuleBuilder: FC<RuleBuilderProps> = ({
  ref,
  'data-testid': testIdProp,
  ruleId,
  ruleDescription,
  scope,
  condition,
  action,
  onConditionChange,
  onActionChange,
  attackTypes,
  showProblems = false,
  sections = ALL_SECTIONS,
  afterConditions,
  className,
  proton: protonProp,
}) => {
  const testId = useTestId('rule-builder');
  const finalTestId = testIdProp ?? testId;

  // Load Proton SDK if not provided
  // Note: useProton has tuple return type but TS sees it as Proton in some contexts
  // Use direct access instead of destructuring to avoid TS error
  const protonFromHook = (useProton() as [Proton | null, Error | null, () => void])[0];
  const proton = protonProp ?? protonFromHook;

  // Check which sections to show
  const shows = (section: RuleBuilderSection) => sections.includes(section);

  // Only show section headings when there are multiple sections
  const showHeadings = sections.length > 1;

  // Compute validation problems
  const metaIssues = useMemo(
    () => (showProblems ? ruleMetaProblems(ruleId) : []),
    [showProblems, ruleId],
  );

  const conditionIssues = useMemo(
    () =>
      showProblems
        ? [...conditionProblems(condition), ...validateBindingUniqueness(condition)]
        : [],
    [showProblems, condition],
  );

  const actionIssues = useMemo(
    () =>
      showProblems
        ? [...actionProblems(action), ...validateBindingRefs(action, condition, proton)]
        : [],
    [showProblems, action, condition, proton],
  );

  // Auto-re-canonicalize condition points when SDK version changes
  useEffect(() => {
    if (!proton) return;

    const currentVersion = parseInt(proton.version().canonical);
    let conditionUpdated = false;
    let actionUpdated = false;

    // Walk condition tree and re-canonicalize points
    const migrateCondition = (node: ConditionNode): ConditionNode => {
      if (node.kind === 'group') {
        const updatedChildren = node.children.map(migrateCondition);
        return { ...node, children: updatedChildren };
      }

      if (node.kind === 'field') {
        // FieldCondition uses PointSelectorValue with canonicalVersion
        if (
          node.value.canonical &&
          needsRecanonalization(currentVersion, node.value.canonicalVersion ?? undefined)
        ) {
          const result = checkPoint(proton, node.value.canonical, {
            context: node.context,
            profile: 'tree',
          });

          if (result.canonical && result.canonical !== node.value.canonical) {
            console.info('Condition point re-canonicalized due to SDK version change', {
              old: node.value.canonical,
              new: result.canonical,
              oldVersion: node.value.canonicalVersion,
              newVersion: currentVersion,
            });
            conditionUpdated = true;
            return {
              ...node,
              value: {
                ...node.value,
                canonical: result.canonical,
                canonicalVersion: currentVersion,
              },
            } as FieldCondition;
          }
        }
        return node;
      }

      if (
        (node.kind === 'attack' || node.kind === 'signal' || node.kind === 'tag') &&
        node.point !== 'flow'
      ) {
        // AttackCondition, SignalCondition, TagCondition have point string
        if (needsRecanonalization(currentVersion, node.canonicalVersion)) {
          const result = checkPoint(proton, node.point, {
            context: 'http_request', // Context for attack/signal/tag points
            profile: 'tree',
          });

          if (result.canonical && result.canonical !== node.point) {
            console.info(
              `${node.kind} condition point re-canonicalized due to SDK version change`,
              {
                old: node.point,
                new: result.canonical,
                oldVersion: node.canonicalVersion,
                newVersion: currentVersion,
              },
            );
            conditionUpdated = true;
            if (node.kind === 'attack') {
              return {
                ...node,
                point: result.canonical,
                canonicalVersion: currentVersion,
              } as AttackCondition;
            }
            if (node.kind === 'signal') {
              return {
                ...node,
                point: result.canonical,
                canonicalVersion: currentVersion,
              } as SignalCondition;
            }
            if (node.kind === 'tag') {
              return {
                ...node,
                point: result.canonical,
                canonicalVersion: currentVersion,
              } as TagCondition;
            }
          }
        }
        return node;
      }

      return node;
    };

    const updatedCondition = migrateCondition(condition);
    if (conditionUpdated) {
      onConditionChange(updatedCondition as GroupCondition);
    }

    // Re-canonicalize action target point
    if (
      action.target &&
      !action.target.whole &&
      action.target.canonical &&
      needsRecanonalization(currentVersion, action.target.canonicalVersion)
    ) {
      const result = checkPoint(proton, action.target.canonical, {
        context: action.target.context,
        profile: 'tree',
      });

      if (result.canonical && result.canonical !== action.target.canonical) {
        console.info('Action target re-canonicalized due to SDK version change', {
          old: action.target.canonical,
          new: result.canonical,
          oldVersion: action.target.canonicalVersion,
          newVersion: currentVersion,
        });
        actionUpdated = true;
        onActionChange({
          ...action,
          target: {
            ...action.target,
            canonical: result.canonical,
            canonicalVersion: currentVersion,
          },
        });
      }
    }

    // Only run when SDK loads or version changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proton]);

  // Generate JSON output with SDK canonical rendering
  const generatedJSON = useMemo(() => {
    const protonCondition = toProtonCondition(condition, proton);
    const protonAction = toProtonAction(action, proton);

    // Build complete ruleset in format 0.10.3
    // See packages/docs/rules-framework.md:50-74
    const ruleset = {
      meta: {
        format: '0.10.3',
        revision: new Date().toISOString(),
      },
      rules: [
        {
          meta: {
            id: ruleId,
            desc: ruleDescription ?? '',
          },
          ...(scope && { scope }),
          condition: protonCondition,
          action: [protonAction],
        },
      ],
    };

    return JSON.stringify(ruleset, null, 2);
  }, [condition, action, proton, ruleId, ruleDescription, scope]);

  return (
    <TestIdProvider value={finalTestId}>
      <div
        ref={ref}
        data-slot='rule-builder'
        data-testid={finalTestId}
        className={cn(ruleBuilderVariants(), className)}
      >
        {/* Rule Meta Validation */}
        {metaIssues.length > 0 && showProblems && (
          <div className='flex flex-col gap-4 rounded-lg border border-border-danger bg-bg-danger-subtle p-12'>
            {metaIssues.map(problem => (
              <Text key={problem} size='sm' color='danger'>
                {problem}
              </Text>
            ))}
          </div>
        )}

        {/* Conditions Section */}
        {shows('conditions') && (
          <section className='flex flex-col gap-12'>
            {showHeadings && <h3 className='text-md font-medium'>Conditions</h3>}
            <ConditionTree
              condition={condition}
              onChange={onConditionChange}
              attackTypes={attackTypes}
              isRoot
              showProblems={showProblems}
              problems={conditionIssues}
            />
            {conditionIssues.length > 0 && showProblems && (
              <div className='flex flex-col gap-4'>
                {conditionIssues.map(problem => (
                  <Text key={problem} size='sm' color='danger'>
                    {problem}
                  </Text>
                ))}
              </div>
            )}
            {afterConditions}
          </section>
        )}

        {/* Action Section */}
        {shows('action') && (
          <section className='flex flex-col gap-12'>
            {showHeadings && <h3 className='text-md font-medium'>Action</h3>}
            <ActionEditor
              value={action}
              onChange={onActionChange}
              attackTypes={attackTypes}
              condition={condition}
              problems={actionIssues}
              showProblems={showProblems}
            />
          </section>
        )}

        {/* Code Section */}
        {shows('code') && (
          <section className='flex flex-col gap-12'>
            {showHeadings && <h3 className='text-md font-medium'>Generated Rule</h3>}
            <Code size='m' className='max-h-[600px] overflow-auto'>
              {generatedJSON}
            </Code>
          </section>
        )}
      </div>
    </TestIdProvider>
  );
};

RuleBuilder.displayName = 'RuleBuilder';
