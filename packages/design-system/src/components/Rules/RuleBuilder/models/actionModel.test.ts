import { describe, expect, it } from '@rstest/core';
import { fromProtonAction, newAction, toProtonAction } from './actionModel';

describe('actionModel', () => {
  describe('newAction', () => {
    it('creates add_attack action with default values', () => {
      const action = newAction('add_attack');

      expect(action.kind).toBe('add_attack');
      expect(action.attackType).toBe('');
      expect(action.comment).toBe('');
      expect(action.experimental).toBe(false);
      expect(action.target.whole).toBe(true);
      expect(action.target.context).toBe('http_request');
    });

    it('creates combine action with point target', () => {
      const action = newAction('combine');

      expect(action.kind).toBe('combine');
      expect(action.target.whole).toBe(false);
      expect(action.separator).toBe(', ');
    });

    it('creates processing_time_limit action with flow target', () => {
      const action = newAction('processing_time_limit');

      expect(action.kind).toBe('processing_time_limit');
      expect(action.target.whole).toBe(true);
      expect(action.limit).toBe('');
    });
  });

  describe('toProtonAction', () => {
    it('converts add_attack action', () => {
      const action = newAction('add_attack');
      action.attackType = 'sqli';
      action.comment = 'SQL injection detected';
      action.experimental = true;

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'add_attack',
        target: [{ context: 'http_request', point: 'flow' }],
        attack: {
          attack_type: 'sqli',
          comment: 'SQL injection detected',
        },
        experimental: true,
      });
    });

    it('converts add_tag action', () => {
      const action = newAction('add_tag');
      action.tagKey = 'severity';
      action.tagValue = 'high';

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'add_tag',
        target: [{ context: 'http_request', point: 'flow' }],
        tag: {
          key: 'severity',
          value: 'high',
        },
      });
    });

    it('converts suppress_attack action without attack type', () => {
      const action = newAction('suppress_attack');

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'suppress_attack',
        target: [{ context: 'http_request', point: 'flow' }],
      });
    });

    it('converts suppress_attack action with attack type', () => {
      const action = newAction('suppress_attack');
      action.attackType = 'sqli';

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'suppress_attack',
        target: [{ context: 'http_request', point: 'flow' }],
        attack: { attack_type: 'sqli' },
      });
    });

    it('converts processing_time_limit action', () => {
      const action = newAction('processing_time_limit');
      action.limit = '10ms';
      action.priority = '5';

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'processing_time_limit',
        target: [{ context: 'http_request', point: 'flow' }],
        limit: '10ms',
        priority: 5,
      });
    });

    it('converts entry_limits action', () => {
      const action = newAction('entry_limits');
      action.softLimit = '1Ki';
      action.hardLimit = '64Ki';
      action.priority = '3';
      action.target = {
        whole: true,
        context: 'http_request',
        segments: [],
      };

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'entry_limits',
        target: [{ context: 'http_request', point: 'flow' }],
        entry_size_soft_limit: '1Ki',
        entry_size_hard_limit: '64Ki',
        priority: 3,
      });
    });

    it('converts disable_parsers action with array of parsers', () => {
      const action = newAction('disable_parsers');
      action.parsers = ['xml', 'json'];
      action.priority = '2';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [],
      };

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'disable_parsers',
        target: [{ context: 'http_request', point: 'flow' }],
        parsers: ['xml', 'json'],
        priority: 2,
      });
    });

    it('converts disable_parsers action with "all"', () => {
      const action = newAction('disable_parsers');
      action.parsers = 'all';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [],
      };

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'disable_parsers',
        target: [{ context: 'http_request', point: 'flow' }],
        parsers: 'all',
      });
    });

    it('converts allow_parsers action', () => {
      const action = newAction('allow_parsers');
      action.parsers = ['json', 'form'];
      action.priority = '5';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [],
      };

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'allow_parsers',
        target: [{ context: 'http_request', point: 'flow' }],
        parsers: ['json', 'form'],
        priority: 5,
      });
    });

    it('converts force_parser action', () => {
      const action = newAction('force_parser');
      action.parser = 'protobuf';
      action.priority = '10';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [],
      };

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'force_parser',
        target: [{ context: 'http_request', point: 'flow' }],
        parser: 'protobuf',
        priority: 10,
      });
    });

    it('converts disable_rule action', () => {
      const action = newAction('disable_rule');
      action.ruleIds = ['rule-1', 'rule-2', 'rule-3'];

      const result = toProtonAction(action);

      expect(result).toEqual({
        action_type: 'disable_rule',
        rule_ids: ['rule-1', 'rule-2', 'rule-3'],
      });
    });

    it('converts raw action', () => {
      const action = newAction();
      action.kind = 'raw';
      action.raw = { custom: 'field' };

      const result = toProtonAction(action);

      expect(result).toEqual({ custom: 'field' });
    });
  });

  describe('fromProtonAction', () => {
    it('converts add_attack action', () => {
      const proton = {
        action_type: 'add_attack',
        target: [{ context: 'http_request', point: 'flow' }],
        attack: {
          attack_type: 'sqli',
          comment: 'SQL injection detected',
        },
        experimental: true,
      };

      const result = fromProtonAction(proton);

      expect(result.kind).toBe('add_attack');
      expect(result.attackType).toBe('sqli');
      expect(result.comment).toBe('SQL injection detected');
      expect(result.experimental).toBe(true);
    });

    it('converts add_tag action', () => {
      const proton = {
        action_type: 'add_tag',
        target: [{ context: 'http_request', point: 'flow' }],
        tag: {
          key: 'severity',
          value: 'high',
        },
      };

      const result = fromProtonAction(proton);

      expect(result.kind).toBe('add_tag');
      expect(result.tagKey).toBe('severity');
      expect(result.tagValue).toBe('high');
    });

    it('converts processing_time_limit action', () => {
      const proton = {
        action_type: 'processing_time_limit',
        target: [{ context: 'http_request', point: 'flow' }],
        limit: '10ms',
        priority: 5,
      };

      const result = fromProtonAction(proton);

      expect(result.kind).toBe('processing_time_limit');
      expect(result.limit).toBe('10ms');
      expect(result.priority).toBe('5');
    });

    it('handles unknown action as raw', () => {
      const proton = {
        action_type: 'unknown_type',
        target: [{ context: 'http_request', point: 'flow' }],
      };

      const result = fromProtonAction(proton);

      expect(result.kind).toBe('raw');
      expect(result.raw).toEqual(proton);
    });

    it('handles invalid target format as raw', () => {
      const proton = {
        action_type: 'add_attack',
        target: [], // Invalid: empty array
      };

      const result = fromProtonAction(proton);

      expect(result.kind).toBe('raw');
    });
  });

  describe('SDK canonical rendering', () => {
    it('uses SDK render when proton is available for action targets', () => {
      // Mock Proton SDK with render method
      const mockProton = {
        point: {
          render: (segments: unknown[]) => "[http:header]['x-custom-header']",
        },
      } as any;

      const action = newAction('add_attack');
      action.attackType = 'custom';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [
          { text: '[http:header]', kind: 'native', label: 'HTTP header' },
          { text: "['x-custom-header']", kind: 'key', label: 'x-custom-header' },
        ],
      };

      const result = toProtonAction(action, mockProton);

      expect(result).toEqual({
        action_type: 'add_attack',
        target: [
          {
            context: 'http_request',
            point: "[http:header]['x-custom-header']", // SDK canonical form
          },
        ],
        attack: {
          attack_type: 'custom',
        },
      });
    });

    it('falls back to string concatenation when proton is null', () => {
      const action = newAction('combine');
      action.separator = ' | ';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [
          { text: '[http:header]', kind: 'native', label: 'HTTP header' },
          { text: "['accept']", kind: 'key', label: 'accept' },
        ],
      };

      const result = toProtonAction(action, null);

      expect(result).toEqual({
        action_type: 'combine',
        target: [
          {
            context: 'http_request',
            point: "[http:header]['accept']", // Fallback concatenation
          },
        ],
        separator: ' | ',
      });
    });

    it('preserves SDK canonical form for entry_limits with point target', () => {
      const mockProton = {
        point: {
          render: (segments: unknown[]) => "[http:body][format:json]['items'][*]",
        },
      } as any;

      const action = newAction('entry_limits');
      action.softLimit = '1Ki';
      action.hardLimit = '10Ki';
      action.target = {
        whole: false,
        context: 'http_request',
        segments: [
          { text: '[http:body]', kind: 'native', label: 'HTTP body' },
          { text: '[format:json]', kind: 'format', label: 'json' },
          { text: "['items']", kind: 'key', label: 'items' },
          { text: '[*]', kind: 'wildcard', label: 'any' },
        ],
      };

      const result = toProtonAction(action, mockProton);

      expect(result.target).toEqual([
        {
          context: 'http_request',
          point: "[http:body][format:json]['items'][*]", // SDK canonical form
        },
      ]);
    });

    it('uses SDK for whole-request targets in processing limits', () => {
      const mockProton = {
        point: {
          render: (segments: unknown[]) => 'flow',
        },
      } as any;

      const action = newAction('processing_time_limit');
      action.limit = '5ms';

      const result = toProtonAction(action, mockProton);

      expect(result).toEqual({
        action_type: 'processing_time_limit',
        target: [{ context: 'http_request', point: 'flow' }],
        limit: '5ms',
      });
    });
  });

  describe('round-trip conversions', () => {
    describe('UI → Proton → UI preserves structure', () => {
      it('add_attack action with all fields', () => {
        const original = newAction('add_attack');
        original.attackType = 'sqli';
        original.comment = 'SQL injection detected';
        original.experimental = true;

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe(original.kind);
        expect(restored.attackType).toBe(original.attackType);
        expect(restored.comment).toBe(original.comment);
        expect(restored.experimental).toBe(original.experimental);
        expect(restored.target.whole).toBe(original.target.whole);
      });

      it('add_attack action with minimal fields', () => {
        const original = newAction('add_attack');
        original.attackType = 'xss';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('add_attack');
        expect(restored.attackType).toBe('xss');
        expect(restored.comment).toBe('');
        expect(restored.experimental).toBe(false);
      });

      it('add_tag action', () => {
        const original = newAction('add_tag');
        original.tagKey = 'severity';
        original.tagValue = 'high';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('add_tag');
        expect(restored.tagKey).toBe('severity');
        expect(restored.tagValue).toBe('high');
      });

      it('suppress_attack action without attack type', () => {
        const original = newAction('suppress_attack');

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('suppress_attack');
        expect(restored.attackType).toBe('');
      });

      it('suppress_attack action with attack type', () => {
        const original = newAction('suppress_attack');
        original.attackType = 'sqli';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('suppress_attack');
        expect(restored.attackType).toBe('sqli');
      });

      it('mark_attack action', () => {
        const original = newAction('mark_attack');
        original.attackType = 'custom_attack';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('mark_attack');
        expect(restored.attackType).toBe('custom_attack');
        expect(restored.experimental).toBe(true); // Always experimental
      });

      it('combine action with custom separator', () => {
        const original = newAction('combine');
        original.separator = ' | ';
        original.target = {
          whole: false,
          context: 'http_request',
          segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
        };

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('combine');
        expect(restored.separator).toBe(' | ');
      });

      it('processing_time_limit action with priority', () => {
        const original = newAction('processing_time_limit');
        original.limit = '10ms';
        original.priority = '5';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('processing_time_limit');
        expect(restored.limit).toBe('10ms');
        expect(restored.priority).toBe('5');
      });

      it('processing_space_limit action', () => {
        const original = newAction('processing_space_limit');
        original.limit = '100Ki';
        original.priority = '3';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('processing_space_limit');
        expect(restored.limit).toBe('100Ki');
        expect(restored.priority).toBe('3');
      });

      it('entry_limits action with both limits', () => {
        const original = newAction('entry_limits');
        original.softLimit = '1Ki';
        original.hardLimit = '64Ki';
        original.priority = '2';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('entry_limits');
        expect(restored.softLimit).toBe('1Ki');
        expect(restored.hardLimit).toBe('64Ki');
        expect(restored.priority).toBe('2');
      });

      it('entry_limits action with only soft limit', () => {
        const original = newAction('entry_limits');
        original.softLimit = '2Ki';

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('entry_limits');
        expect(restored.softLimit).toBe('2Ki');
        expect(restored.hardLimit).toBe('');
      });

      it('action with point target', () => {
        const original = newAction('combine');
        original.target = {
          whole: false,
          context: 'http_request',
          segments: [
            { text: '[http:header]', kind: 'native', label: 'HTTP header' },
            { text: "['content-type']", kind: 'key', label: 'content-type' },
          ],
        };

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.target.whole).toBe(false);
        expect(restored.target.segments).toHaveLength(1); // Simplified parser creates single segment
      });

      it('action with flow target', () => {
        const original = newAction('add_attack');
        original.attackType = 'rce';
        original.target = {
          whole: true,
          context: 'http_request',
          segments: [],
        };

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.target.whole).toBe(true);
        expect(restored.target.context).toBe('http_request');
      });
    });

    describe('Proton → UI → Proton preserves structure', () => {
      it('add_attack action with full fields', () => {
        const original = {
          action_type: 'add_attack',
          target: [{ context: 'http_request', point: 'flow' }],
          attack: {
            attack_type: 'sqli',
            comment: 'SQL injection detected',
          },
          experimental: true,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('add_attack action without comment', () => {
        const original = {
          action_type: 'add_attack',
          target: [{ context: 'http_request', point: 'flow' }],
          attack: {
            attack_type: 'xss',
          },
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('add_tag action', () => {
        const original = {
          action_type: 'add_tag',
          target: [{ context: 'http_request', point: 'flow' }],
          tag: {
            key: 'severity',
            value: 'high',
          },
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('suppress_attack action without attack type', () => {
        const original = {
          action_type: 'suppress_attack',
          target: [{ context: 'http_request', point: 'flow' }],
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('suppress_attack action with attack type', () => {
        const original = {
          action_type: 'suppress_attack',
          target: [{ context: 'http_request', point: 'flow' }],
          attack: { attack_type: 'sqli' },
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('mark_attack action', () => {
        const original = {
          action_type: 'mark_attack',
          target: [{ context: 'http_request', point: 'flow' }],
          attack: { attack_type: 'custom' },
          experimental: true,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('combine action with default separator', () => {
        const original = {
          action_type: 'combine',
          target: [{ context: 'http_request', point: '[http:header]' }],
          separator: ', ',
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('combine action with custom separator', () => {
        const original = {
          action_type: 'combine',
          target: [{ context: 'http_request', point: '[http:header]' }],
          separator: ' | ',
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('processing_time_limit action without priority', () => {
        const original = {
          action_type: 'processing_time_limit',
          target: [{ context: 'http_request', point: 'flow' }],
          limit: '10ms',
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('processing_time_limit action with priority', () => {
        const original = {
          action_type: 'processing_time_limit',
          target: [{ context: 'http_request', point: 'flow' }],
          limit: '10ms',
          priority: 5,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('processing_space_limit action', () => {
        const original = {
          action_type: 'processing_space_limit',
          target: [{ context: 'http_request', point: 'flow' }],
          limit: '100Ki',
          priority: 3,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('entry_limits action with both limits', () => {
        const original = {
          action_type: 'entry_limits',
          target: [{ context: 'http_request', point: 'flow' }],
          entry_size_soft_limit: '1Ki',
          entry_size_hard_limit: '64Ki',
          priority: 2,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('entry_limits action with only soft limit', () => {
        const original = {
          action_type: 'entry_limits',
          target: [{ context: 'http_request', point: 'flow' }],
          entry_size_soft_limit: '2Ki',
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('entry_limits action with priority but no limits', () => {
        const original = {
          action_type: 'entry_limits',
          target: [{ context: 'http_request', point: 'flow' }],
          priority: 1,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('disable_parsers action with array of parsers', () => {
        const original = {
          action_type: 'disable_parsers',
          target: [{ context: 'http_request', point: '[http:body]' }],
          parsers: ['xml', 'json'],
          priority: 3,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('disable_parsers action with "all"', () => {
        const original = {
          action_type: 'disable_parsers',
          target: [{ context: 'http_request', point: '[http:body]' }],
          parsers: 'all',
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('allow_parsers action with specific parsers', () => {
        const original = {
          action_type: 'allow_parsers',
          target: [{ context: 'http_request', point: '[http:body]' }],
          parsers: ['json', 'form'],
          priority: 5,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('allow_parsers action with empty array', () => {
        const original = {
          action_type: 'allow_parsers',
          target: [{ context: 'http_request', point: '[http:body]' }],
          parsers: [],
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('force_parser action', () => {
        const original = {
          action_type: 'force_parser',
          target: [{ context: 'http_request', point: '[http:body]' }],
          parser: 'protobuf',
          priority: 10,
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('disable_rule action with single rule ID', () => {
        const original = {
          action_type: 'disable_rule',
          rule_ids: ['rule-1'],
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('disable_rule action with multiple rule IDs', () => {
        const original = {
          action_type: 'disable_rule',
          rule_ids: ['rule-1', 'rule-2', 'rule-3'],
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('action with point target', () => {
        const original = {
          action_type: 'combine',
          target: [{ context: 'http_request', point: "[http:header]['content-type']" }],
          separator: ', ',
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });

      it('all action types without optional fields', () => {
        const actionTypes = [
          { action_type: 'add_attack', attack: { attack_type: 'sqli' } },
          { action_type: 'add_tag', tag: { key: 'k', value: 'v' } },
          { action_type: 'suppress_attack' },
          { action_type: 'mark_attack', experimental: true },
          { action_type: 'combine', separator: ', ' },
          { action_type: 'processing_time_limit', limit: '10ms' },
          { action_type: 'processing_space_limit', limit: '100Ki' },
          { action_type: 'entry_limits' },
          { action_type: 'disable_parsers', parsers: [] },
          { action_type: 'allow_parsers', parsers: [] },
          { action_type: 'force_parser', parser: '' },
        ];

        for (const action of actionTypes) {
          const original = {
            ...action,
            target: [{ context: 'http_request', point: 'flow' }],
          };

          const ui = fromProtonAction(original);
          const restored = toProtonAction(ui);

          expect(restored).toEqual(original);
        }
      });

      it('disable_rule action type (no target)', () => {
        const original = {
          action_type: 'disable_rule',
          rule_ids: [],
        };

        const ui = fromProtonAction(original);
        const restored = toProtonAction(ui);

        expect(restored).toEqual(original);
      });
    });

    describe('edge cases', () => {
      it('handles empty array as unknown action', () => {
        const ui = fromProtonAction([]);
        expect(ui.kind).toBe('raw');
      });

      it('handles null as raw action', () => {
        const ui = fromProtonAction(null);
        expect(ui.kind).toBe('raw');
      });

      it('handles unknown action type', () => {
        const proton = {
          action_type: 'unknown_type',
          target: [{ context: 'http_request', point: 'flow' }],
        };

        const ui = fromProtonAction(proton);
        const restored = toProtonAction(ui);

        expect(ui.kind).toBe('raw');
        expect(restored).toEqual(proton);
      });

      it('handles invalid target format (empty array)', () => {
        const proton = {
          action_type: 'add_attack',
          target: [],
        };

        const ui = fromProtonAction(proton);
        expect(ui.kind).toBe('raw');
      });

      it('handles invalid target format (multiple targets)', () => {
        const proton = {
          action_type: 'add_attack',
          target: [
            { context: 'http_request', point: 'flow' },
            { context: 'http_request', point: '[http:header]' },
          ],
        };

        const ui = fromProtonAction(proton);
        expect(ui.kind).toBe('raw');
      });

      it('handles priority as string in Proton format', () => {
        const original = {
          action_type: 'processing_time_limit',
          target: [{ context: 'http_request', point: 'flow' }],
          limit: '10ms',
          priority: 5,
        };

        const ui = fromProtonAction(original);
        expect(ui.priority).toBe('5'); // Converted to string in UI
        const restored = toProtonAction(ui);
        expect(restored.priority).toBe(5); // Converted back to number
      });

      it('handles invalid priority string (not a number)', () => {
        const action = newAction('processing_time_limit');
        action.limit = '10ms';
        action.priority = 'invalid';

        const proton = toProtonAction(action);
        expect(proton.priority).toBeUndefined();
      });

      it('handles empty priority string', () => {
        const action = newAction('processing_time_limit');
        action.limit = '10ms';
        action.priority = '';

        const proton = toProtonAction(action);
        expect(proton.priority).toBeUndefined();
      });

      it('handles whitespace-only strings', () => {
        const action = newAction('add_attack');
        action.attackType = '  ';
        action.comment = '  ';

        const proton = toProtonAction(action);
        // attackType is not trimmed, passed as-is
        expect(proton.attack?.attack_type).toBe('  ');
        // comment is trimmed and empty strings are omitted
        expect(proton.attack?.comment).toBeUndefined();
      });

      it('trims whitespace from limits', () => {
        const action = newAction('entry_limits');
        action.softLimit = '  1Ki  ';
        action.hardLimit = '  64Ki  ';

        const proton = toProtonAction(action);
        expect(proton.entry_size_soft_limit).toBe('1Ki');
        expect(proton.entry_size_hard_limit).toBe('64Ki');
      });

      it('preserves experimental flag for add_tag', () => {
        const original = newAction('add_tag');
        original.tagKey = 'test';
        original.tagValue = 'value';
        original.experimental = true;

        const proton = toProtonAction(original);
        const restored = fromProtonAction(proton);

        expect(restored.experimental).toBe(true);
      });

      it('handles raw action round-trip', () => {
        const rawAction = newAction();
        rawAction.kind = 'raw';
        rawAction.raw = { custom: 'field', nested: { value: 123 } };

        const proton = toProtonAction(rawAction);
        const restored = fromProtonAction(proton);

        expect(restored.kind).toBe('raw');
        expect(restored.raw).toEqual(rawAction.raw);
      });
    });
  });
});
