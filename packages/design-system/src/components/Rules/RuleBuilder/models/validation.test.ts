import { describe, expect, it } from '@rstest/core';
import type { ActionDraft } from '../types';
import { newAction } from './actionModel';
import { newAttack, newField, newGroup, newSignal } from './conditionModel';
import {
  actionProblems,
  isActionValid,
  isValidDuration,
  isValidInteger,
  isValidQuantity,
  ruleMetaProblems,
  validateActionPriority,
  validateActionTarget,
  validateBindingRefs,
  validateBindingUniqueness,
} from './validation';

describe('validation', () => {
  describe('isValidDuration', () => {
    it('accepts valid Go durations', () => {
      expect(isValidDuration('10ms')).toBe(true);
      expect(isValidDuration('1.5s')).toBe(true);
      expect(isValidDuration('2m')).toBe(true);
      expect(isValidDuration('1h')).toBe(true);
      expect(isValidDuration('100ns')).toBe(true);
      expect(isValidDuration('500us')).toBe(true);
      expect(isValidDuration('500µs')).toBe(true);
    });

    it('accepts compound durations', () => {
      expect(isValidDuration('1h30m')).toBe(true);
      expect(isValidDuration('1.5h30m15s')).toBe(true);
    });

    it('rejects invalid durations', () => {
      expect(isValidDuration('invalid')).toBe(false);
      expect(isValidDuration('10')).toBe(false);
      expect(isValidDuration('ms')).toBe(false);
      expect(isValidDuration('')).toBe(false);
    });

    it('trims whitespace', () => {
      expect(isValidDuration('  10ms  ')).toBe(true);
    });
  });

  describe('isValidQuantity', () => {
    it('accepts valid quantities', () => {
      expect(isValidQuantity('512')).toBe(true);
      expect(isValidQuantity('1.5k')).toBe(true);
      expect(isValidQuantity('2Mi')).toBe(true);
      expect(isValidQuantity('1Gi')).toBe(true);
      expect(isValidQuantity('.5k')).toBe(true);
    });

    it('accepts all SI suffixes', () => {
      expect(isValidQuantity('1k')).toBe(true);
      expect(isValidQuantity('1M')).toBe(true);
      expect(isValidQuantity('1G')).toBe(true);
      expect(isValidQuantity('1T')).toBe(true);
      expect(isValidQuantity('1Ki')).toBe(true);
      expect(isValidQuantity('1Mi')).toBe(true);
      expect(isValidQuantity('1Gi')).toBe(true);
      expect(isValidQuantity('1Ti')).toBe(true);
    });

    it('rejects invalid quantities', () => {
      expect(isValidQuantity('invalid')).toBe(false);
      expect(isValidQuantity('k')).toBe(false);
      expect(isValidQuantity('')).toBe(false);
    });

    it('trims whitespace', () => {
      expect(isValidQuantity('  512Ki  ')).toBe(true);
    });
  });

  describe('isValidInteger', () => {
    it('accepts valid integers', () => {
      expect(isValidInteger('0')).toBe(true);
      expect(isValidInteger('123')).toBe(true);
      expect(isValidInteger('-5')).toBe(true);
    });

    it('rejects non-integers', () => {
      expect(isValidInteger('1.5')).toBe(false);
      expect(isValidInteger('abc')).toBe(false);
      expect(isValidInteger('')).toBe(false);
      expect(isValidInteger('  ')).toBe(false);
    });

    it('trims whitespace', () => {
      expect(isValidInteger('  42  ')).toBe(true);
    });
  });

  describe('ruleMetaProblems', () => {
    it('requires non-empty rule ID', () => {
      expect(ruleMetaProblems('')).toEqual(['Rule ID is required']);
      expect(ruleMetaProblems('  ')).toEqual(['Rule ID is required']);
    });

    it('accepts valid rule ID', () => {
      expect(ruleMetaProblems('my-rule-1')).toEqual([]);
    });
  });

  describe('validateActionTarget', () => {
    const makeTarget = (whole: boolean, segments: number = 0) => ({
      whole,
      context: 'http_request' as const,
      segments: new Array(segments).fill({ type: 'key', value: 'test' }),
    });

    describe('actions requiring point pattern (not flow)', () => {
      const pointOnlyActions = [
        'combine',
        'entry_limits',
        'disable_parsers',
        'allow_parsers',
        'force_parser',
      ] as const;

      it.each(pointOnlyActions)('%s rejects flow target', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toMatch(/needs a specific point, not the whole request/);
      });

      it.each(pointOnlyActions)('%s accepts point pattern', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(false, 2),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toEqual([]);
      });

      it.each(pointOnlyActions)('%s requires target when empty', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(false, 0),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toEqual(['Say where the action applies.']);
      });
    });

    describe('actions requiring flow (not point pattern)', () => {
      const flowOnlyActions = [
        'processing_time_limit',
        'processing_space_limit',
        'disable_rule',
      ] as const;

      it.each(flowOnlyActions)('%s rejects point pattern', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(false, 2),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toMatch(/applies to the whole request, not a specific point/);
      });

      it.each(flowOnlyActions)('%s accepts flow target', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toEqual([]);
      });
    });

    describe('actions accepting either flow or point', () => {
      const eitherActions = ['add_attack', 'add_tag', 'suppress_attack', 'mark_attack'] as const;

      it.each(eitherActions)('%s accepts flow target', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toEqual([]);
      });

      it.each(eitherActions)('%s accepts point pattern', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(false, 2),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toEqual([]);
      });

      it.each(eitherActions)('%s requires target when empty', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(false, 0),
        };

        const problems = validateActionTarget(draft);

        expect(problems).toEqual(['Say where the action applies.']);
      });
    });

    it('skips validation for raw actions', () => {
      const draft: ActionDraft = {
        kind: 'raw',
        target: makeTarget(false, 0),
        raw: {},
      };

      const problems = validateActionTarget(draft);

      expect(problems).toEqual([]);
    });
  });

  describe('validateActionPriority', () => {
    const makeTarget = (whole: boolean) => ({
      whole,
      context: 'http_request' as const,
      segments: [],
    });

    describe('actions that allow priority', () => {
      const priorityAllowed = [
        'processing_time_limit',
        'processing_space_limit',
        'entry_limits',
        'disable_parsers',
        'allow_parsers',
        'force_parser',
      ] as const;

      it.each(priorityAllowed)('%s accepts valid priority', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '100',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toEqual([]);
      });

      it.each(priorityAllowed)('%s accepts negative priority', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '-50',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toEqual([]);
      });

      it.each(priorityAllowed)('%s accepts zero priority', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '0',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toEqual([]);
      });

      it.each(priorityAllowed)('%s accepts empty priority', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toEqual([]);
      });

      it.each(priorityAllowed)('%s rejects non-integer priority', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '1.5',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toContain('Priority must be a whole number.');
      });

      it.each(priorityAllowed)('%s rejects out-of-range priority (too large)', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '9999999999',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toContain('Priority must be between -2147483648 and 2147483647.');
      });

      it.each(priorityAllowed)('%s rejects out-of-range priority (too small)', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '-9999999999',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toContain('Priority must be between -2147483648 and 2147483647.');
      });
    });

    describe('actions that forbid priority', () => {
      const priorityForbidden = [
        'add_attack',
        'add_tag',
        'suppress_attack',
        'mark_attack',
        'combine',
        'disable_rule',
      ] as const;

      it.each(priorityForbidden)('%s rejects any priority value', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '10',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toContain(`Priority is not allowed for ${kind} actions.`);
      });

      it.each(priorityForbidden)('%s accepts empty priority', kind => {
        const draft: ActionDraft = {
          kind,
          target: makeTarget(true),
          priority: '',
        };

        const problems = validateActionPriority(draft);

        expect(problems).toEqual([]);
      });
    });

    it('skips validation for raw actions', () => {
      const draft: ActionDraft = {
        kind: 'raw',
        target: makeTarget(true),
        priority: '9999999999',
        raw: {},
      };

      const problems = validateActionPriority(draft);

      expect(problems).toEqual([]);
    });
  });

  describe('actionProblems', () => {
    const makeTarget = (whole: boolean, segments: number = 0) => ({
      whole,
      context: 'http_request' as const,
      segments: new Array(segments).fill({ type: 'key', value: 'test' }),
    });

    describe('add_attack', () => {
      it('requires attack type', () => {
        const draft: ActionDraft = {
          kind: 'add_attack',
          target: makeTarget(true),
          attackType: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Choose the attack type.');
      });

      it('accepts valid attack with type', () => {
        const draft: ActionDraft = {
          kind: 'add_attack',
          target: makeTarget(true),
          attackType: 'sqli',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });
    });

    describe('add_tag', () => {
      it('requires tag key', () => {
        const draft: ActionDraft = {
          kind: 'add_tag',
          target: makeTarget(true),
          tagKey: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Give the tag a key.');
      });

      it('accepts tag with key and empty value', () => {
        const draft: ActionDraft = {
          kind: 'add_tag',
          target: makeTarget(true),
          tagKey: 'mode',
          tagValue: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });
    });

    describe('processing_time_limit', () => {
      it('requires limit', () => {
        const draft: ActionDraft = {
          kind: 'processing_time_limit',
          target: makeTarget(true),
          limit: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Set the time limit.');
      });

      it('validates duration format', () => {
        const draft: ActionDraft = {
          kind: 'processing_time_limit',
          target: makeTarget(true),
          limit: 'invalid',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Write the time limit with a unit, for example 5ms or 1.5s.');
      });

      it('accepts valid duration', () => {
        const draft: ActionDraft = {
          kind: 'processing_time_limit',
          target: makeTarget(true),
          limit: '10ms',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('includes target validation error for point pattern', () => {
        const draft: ActionDraft = {
          kind: 'processing_time_limit',
          target: makeTarget(false, 2),
          limit: '10ms',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain(
          'The "Limit processing time" action applies to the whole request, not a specific point.',
        );
      });
    });

    describe('processing_space_limit', () => {
      it('requires limit', () => {
        const draft: ActionDraft = {
          kind: 'processing_space_limit',
          target: makeTarget(true),
          limit: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Set the memory limit.');
      });

      it('validates quantity format', () => {
        const draft: ActionDraft = {
          kind: 'processing_space_limit',
          target: makeTarget(true),
          limit: 'invalid',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Write the memory limit as a size, for example 512Ki or 2Mi.');
      });

      it('accepts valid quantity', () => {
        const draft: ActionDraft = {
          kind: 'processing_space_limit',
          target: makeTarget(true),
          limit: '2Mi',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });
    });

    describe('entry_limits', () => {
      it('requires at least one limit', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(false, 2),
          softLimit: '',
          hardLimit: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Set a soft limit, a hard limit, or both.');
      });

      it('validates soft limit format', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(false, 2),
          softLimit: 'invalid',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Write the soft limit as a size, for example 1Ki.');
      });

      it('validates hard limit format', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(false, 2),
          hardLimit: 'invalid',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Write the hard limit as a size, for example 64Ki.');
      });

      it('accepts valid soft limit only', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(false, 2),
          softLimit: '1Ki',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('accepts valid hard limit only', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(false, 2),
          hardLimit: '64Ki',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('accepts both limits', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(false, 2),
          softLimit: '1Ki',
          hardLimit: '64Ki',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('includes target validation error for flow', () => {
        const draft: ActionDraft = {
          kind: 'entry_limits',
          target: makeTarget(true),
          softLimit: '1Ki',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain(
          'The "Limit the size of values" action needs a specific point, not the whole request.',
        );
      });
    });

    describe('combine', () => {
      it('accepts combine with point target', () => {
        const draft: ActionDraft = {
          kind: 'combine',
          target: makeTarget(false, 2),
          separator: ', ',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('includes target validation error for flow', () => {
        const draft: ActionDraft = {
          kind: 'combine',
          target: makeTarget(true),
        };

        const problems = actionProblems(draft);

        expect(problems).toContain(
          'The "Join repeated keys into one value" action needs a specific point, not the whole request.',
        );
      });
    });

    describe('disable_parsers', () => {
      it('requires parsers to be specified', () => {
        const draft: ActionDraft = {
          kind: 'disable_parsers',
          target: makeTarget(false, 2),
          parsers: [],
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Choose at least one parser to disable, or use "all".');
      });

      it('accepts "all" as parsers value', () => {
        const draft: ActionDraft = {
          kind: 'disable_parsers',
          target: makeTarget(false, 2),
          parsers: 'all',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('accepts array of parser names', () => {
        const draft: ActionDraft = {
          kind: 'disable_parsers',
          target: makeTarget(false, 2),
          parsers: ['json', 'xml'],
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('rejects undefined parsers', () => {
        const draft: ActionDraft = {
          kind: 'disable_parsers',
          target: makeTarget(false, 2),
          parsers: undefined,
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Choose at least one parser to disable, or use "all".');
      });
    });

    describe('allow_parsers', () => {
      it('requires parsers field to be defined', () => {
        const draft: ActionDraft = {
          kind: 'allow_parsers',
          target: makeTarget(false, 2),
          parsers: undefined,
        };

        const problems = actionProblems(draft);

        expect(problems).toContain(
          'Specify which parsers to allow (use "all", a list, or leave empty for none).',
        );
      });

      it('accepts "all" as parsers value', () => {
        const draft: ActionDraft = {
          kind: 'allow_parsers',
          target: makeTarget(false, 2),
          parsers: 'all',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('accepts array of parser names', () => {
        const draft: ActionDraft = {
          kind: 'allow_parsers',
          target: makeTarget(false, 2),
          parsers: ['json', 'xml'],
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('accepts empty array (allow none)', () => {
        const draft: ActionDraft = {
          kind: 'allow_parsers',
          target: makeTarget(false, 2),
          parsers: [],
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });
    });

    describe('force_parser', () => {
      it('requires parser to be specified', () => {
        const draft: ActionDraft = {
          kind: 'force_parser',
          target: makeTarget(false, 2),
          parser: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Choose which parser to force.');
      });

      it('accepts valid parser name', () => {
        const draft: ActionDraft = {
          kind: 'force_parser',
          target: makeTarget(false, 2),
          parser: 'json',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('rejects undefined parser', () => {
        const draft: ActionDraft = {
          kind: 'force_parser',
          target: makeTarget(false, 2),
          parser: undefined,
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Choose which parser to force.');
      });
    });

    describe('disable_rule', () => {
      it('requires at least one rule ID', () => {
        const draft: ActionDraft = {
          kind: 'disable_rule',
          target: makeTarget(true),
          ruleIds: [],
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Specify at least one rule ID to disable.');
      });

      it('accepts array of rule IDs', () => {
        const draft: ActionDraft = {
          kind: 'disable_rule',
          target: makeTarget(true),
          ruleIds: ['rule-1', 'rule-2'],
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });

      it('rejects undefined ruleIds', () => {
        const draft: ActionDraft = {
          kind: 'disable_rule',
          target: makeTarget(true),
          ruleIds: undefined,
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Specify at least one rule ID to disable.');
      });
    });

    describe('priority validation (integrated)', () => {
      it('rejects priority for add_attack', () => {
        const draft: ActionDraft = {
          kind: 'add_attack',
          target: makeTarget(true),
          attackType: 'sqli',
          priority: '100',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Priority is not allowed for add_attack actions.');
      });

      it('rejects non-integer priority', () => {
        const draft: ActionDraft = {
          kind: 'processing_time_limit',
          target: makeTarget(true),
          limit: '10ms',
          priority: '1.5',
        };

        const problems = actionProblems(draft);

        expect(problems).toContain('Priority must be a whole number.');
      });

      it('accepts empty priority', () => {
        const draft: ActionDraft = {
          kind: 'processing_time_limit',
          target: makeTarget(true),
          limit: '10ms',
          priority: '',
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });
    });

    describe('raw actions', () => {
      it('skips validation for raw actions', () => {
        const draft: ActionDraft = {
          kind: 'raw',
          target: makeTarget(false, 0),
          raw: {},
        };

        const problems = actionProblems(draft);

        expect(problems).toEqual([]);
      });
    });
  });

  describe('isActionValid', () => {
    const makeTarget = (whole: boolean, segments: number = 0) => ({
      whole,
      context: 'http_request' as const,
      segments: new Array(segments).fill({ type: 'key', value: 'test' }),
    });

    it('returns true for valid action', () => {
      const draft: ActionDraft = {
        kind: 'add_attack',
        target: makeTarget(true),
        attackType: 'sqli',
      };

      expect(isActionValid(draft)).toBe(true);
    });

    it('returns false for invalid action', () => {
      const draft: ActionDraft = {
        kind: 'add_attack',
        target: makeTarget(true),
        attackType: '',
      };

      expect(isActionValid(draft)).toBe(false);
    });
  });

  describe('validateBindingUniqueness', () => {
    it('returns no problems for unique bindings', () => {
      const condition = newGroup('and');
      const attack1 = newAttack('sqli');
      attack1.bindAttack = 'a';
      const field = newField();
      field.bindPoint = 'n';
      condition.children = [attack1, field];

      const problems = validateBindingUniqueness(condition);

      expect(problems).toEqual([]);
    });

    it('detects duplicate binding names', () => {
      const condition = newGroup('and');
      const attack1 = newAttack('sqli');
      attack1.bindAttack = 'a';
      const attack2 = newAttack('xss');
      attack2.bindAttack = 'a';
      condition.children = [attack1, attack2];

      const problems = validateBindingUniqueness(condition);

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('"a"');
      expect(problems[0]).toContain('used more than once');
    });

    it('handles empty condition tree', () => {
      const condition = newGroup('and');

      const problems = validateBindingUniqueness(condition);

      expect(problems).toEqual([]);
    });
  });

  describe('validateBindingRefs', () => {
    it('returns no problems when attackRef matches existing binding', () => {
      const condition = newGroup('and');
      const attack = newAttack('sqli');
      attack.bindAttack = 'a';
      condition.children = [attack];
      const action = newAction('suppress_attack');
      action.attackRef = 'a';

      const problems = validateBindingRefs(action, condition);

      expect(problems).toEqual([]);
    });

    it('returns problem when attackRef does not match any binding', () => {
      const condition = newGroup('and');
      const attack = newAttack('sqli');
      attack.bindAttack = 'a';
      condition.children = [attack];
      const action = newAction('suppress_attack');
      action.attackRef = 'b';

      const problems = validateBindingRefs(action, condition);

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('"b"');
      expect(problems[0]).toContain('does not match any bind_attack');
    });

    it('returns no problems when targetRef matches existing binding', () => {
      const condition = newGroup('and');
      const field = newField();
      field.bindPoint = 'n';
      condition.children = [field];
      const action = newAction('add_attack');
      action.targetRef = 'n';

      const problems = validateBindingRefs(action, condition);

      expect(problems).toEqual([]);
    });

    it('returns problem when targetRef does not match any binding', () => {
      const condition = newGroup('and');
      const field = newField();
      field.bindPoint = 'n';
      condition.children = [field];
      const action = newAction('add_attack');
      action.targetRef = 'x';

      const problems = validateBindingRefs(action, condition);

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('"x"');
      expect(problems[0]).toContain('does not match any bind_point');
    });

    it('returns problem when targetRole is set without targetRef', () => {
      const condition = newGroup('and');
      const action = newAction('add_attack');
      action.targetRole = 'before';

      const problems = validateBindingRefs(action, condition);

      expect(problems).toHaveLength(1);
      expect(problems[0]).toContain('Target role requires a target reference');
    });

    it('skips validation for raw actions', () => {
      const condition = newGroup('and');
      const action = {
        kind: 'raw' as const,
        raw: { action_type: 'unknown' },
        target: { whole: true, context: 'http_request' as const, segments: [] },
      };

      const problems = validateBindingRefs(action, condition);

      expect(problems).toEqual([]);
    });

    describe('bind_attack type checking', () => {
      it('rejects bind_attack on data check', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'data_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'authorization' },
          ],
          canonical: "[http:header]['authorization']",
          condition: 'exists',
          value: '',
          ignoreCase: false,
        };
        condition.children = [field];

        // Try to use a data check's binding as attack_ref
        const action = newAction('suppress_attack');
        action.attackRef = 'data_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain('"data_point"');
        expect(problems[0]).toContain('does not match any bind_attack');
      });

      it('accepts bind_attack on attack_present check', () => {
        const condition = newGroup('and');
        const attack = newAttack('sqli');
        attack.bindAttack = 'my_attack';
        condition.children = [attack];

        const action = newAction('suppress_attack');
        action.attackRef = 'my_attack';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toEqual([]);
      });

      it('accepts bind_attack on attack_absent check', () => {
        const condition = newGroup('and');
        const attack = newAttack('sqli');
        attack.bindAttack = 'my_attack';
        attack.absent = true; // Makes it attack_absent
        condition.children = [attack];

        const action = newAction('mark_attack');
        action.attackRef = 'my_attack';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toEqual([]);
      });
    });

    describe('bind_point type checking', () => {
      it('rejects bind_point on signal check (signal_present)', () => {
        const condition = newGroup('and');
        const signal = newSignal('key_duplicate', '[http:header]');
        signal.bindPoint = 'signal_point';
        condition.children = [signal];

        const action = newAction('add_attack');
        action.targetRef = 'signal_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain('bind_point "signal_point"');
        expect(problems[0]).toContain('cannot reference signal check');
        expect(problems[0]).toContain('signal_present');
      });

      it('rejects bind_point on signal check (signal_absent)', () => {
        const condition = newGroup('and');
        const signal = newSignal('key_duplicate', '[http:header]');
        signal.bindPoint = 'signal_point';
        signal.absent = true; // Makes it signal_absent
        condition.children = [signal];

        const action = newAction('add_attack');
        action.targetRef = 'signal_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain('bind_point "signal_point"');
        expect(problems[0]).toContain('cannot reference signal check');
        expect(problems[0]).toContain('signal_absent');
      });

      it('accepts bind_point on data check (exists)', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'data_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'authorization' },
          ],
          canonical: "[http:header]['authorization']",
          condition: 'exists',
          value: '',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'data_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toEqual([]);
      });

      it('accepts bind_point on data check (equal)', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'eq_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'content-type' },
          ],
          canonical: "[http:header]['content-type']",
          condition: 'equal',
          value: 'application/json',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'eq_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toEqual([]);
      });

      it('accepts bind_point on data check (contains)', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'contains_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'query' },
            { kind: 'format', value: 'form' },
            { kind: 'key', value: 'q' },
          ],
          canonical: "[http:query][format:form]['q']",
          condition: 'contains',
          value: 'SELECT',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'contains_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toEqual([]);
      });

      it('accepts bind_point on data check (regexp)', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'rx_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'query' },
            { kind: 'format', value: 'form' },
            { kind: 'key', value: 'user' },
          ],
          canonical: "[http:query][format:form]['user']",
          condition: 'regexp',
          value: '^admin',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'rx_point';

        const problems = validateBindingRefs(action, condition);

        expect(problems).toEqual([]);
      });
    });

    describe('bind_point exactness checking (with SDK)', () => {
      it('rejects bind_point on fuzzy point (wildcard)', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'fuzzy_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'query' },
            { kind: 'format', value: 'form' },
            { kind: 'key', value: '*' }, // Wildcard
          ],
          canonical: '[http:query][format:form][key:*]',
          condition: 'exists',
          value: '',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'fuzzy_point';

        // Mock proton SDK that returns exact: false for wildcard
        const mockProton = {
          point: {
            check: (point: string, options: unknown) => ({
              ok: true,
              canonical: '[http:query][format:form][key:*]',
              exact: false, // Wildcard is NOT exact
            }),
          },
        };

        const problems = validateBindingRefs(action, condition, mockProton as any);

        expect(problems).toHaveLength(1);
        expect(problems[0]).toContain('bind_point "fuzzy_point"');
        expect(problems[0]).toContain('requires exact point');
        expect(problems[0]).toContain('[key:*]');
        expect(problems[0]).toContain('wildcards');
      });

      it('accepts bind_point on exact point', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'exact_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'authorization' },
          ],
          canonical: "[http:header]['authorization']",
          condition: 'exists',
          value: '',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'exact_point';

        // Mock proton SDK that returns exact: true
        const mockProton = {
          point: {
            check: (point: string, options: unknown) => ({
              ok: true,
              canonical: "[http:header]['authorization']",
              exact: true, // Exact point
            }),
          },
        };

        const problems = validateBindingRefs(action, condition, mockProton as any);

        expect(problems).toEqual([]);
      });

      it('skips exactness check when proton is null', () => {
        const condition = newGroup('and');
        const field = newField();
        field.bindPoint = 'fuzzy_point';
        field.value = {
          segments: [
            { kind: 'native', value: 'query' },
            { kind: 'format', value: 'form' },
            { kind: 'key', value: '*' },
          ],
          canonical: '[http:query][format:form][key:*]',
          condition: 'exists',
          value: '',
          ignoreCase: false,
        };
        condition.children = [field];

        const action = newAction('add_attack');
        action.targetRef = 'fuzzy_point';

        // No proton = skip exactness check
        const problems = validateBindingRefs(action, condition, null);

        expect(problems).toEqual([]);
      });
    });
  });
});
