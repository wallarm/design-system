import { describe, expect, it } from '@rstest/core';
import type { GroupCondition } from '../types';
import {
  conditionProblems,
  EMPTY_FIELD_VALUE,
  fieldComplete,
  fromProtonCondition,
  newAttack,
  newField,
  newGroup,
  newSample,
  newSignal,
  toProtonCondition,
} from './conditionModel';

describe('conditionModel', () => {
  // Mock Proton instance for tests
  // This mock implements the minimal SDK interface needed for tests
  const mockProton = {
    point: {
      // render() converts SDK segments to canonical point string
      render: (segments: any[]) => {
        return segments
          .map((s: any) => {
            // Handle UI segments with text property (used in some tests)
            if (s.text) return s.text;

            // Handle SDK segments
            if (s.kind === 'native') return `[http:${s.value}]`;
            if (s.kind === 'key') return `['${s.value}']`;
            if (s.kind === 'content') return `[format:${s.name}]`;

            // Fallback for other segment types
            return '';
          })
          .join('');
      },
      // parse() converts canonical point string back to SDK segments
      parse: (point: string) => {
        // Simple mock parser - just enough for round-trip tests
        const segments: any[] = [];
        const parts = point.match(/\[([^\]]+)\]/g) || [];

        for (const part of parts) {
          const content = part.slice(1, -1); // Remove [ ]

          if (content.startsWith('http:')) {
            segments.push({ kind: 'native', value: content.slice(5) });
          } else if (content.startsWith("'") && content.endsWith("'")) {
            segments.push({ kind: 'key', value: content.slice(1, -1) });
          } else if (content.startsWith('format:')) {
            segments.push({ kind: 'content', name: content.slice(7) });
          }
        }

        return segments;
      },
    },
    version: () => ({ canonical: '1' }),
  } as any;

  describe('factory functions', () => {
    it('creates a new field condition', () => {
      const field = newField('http_request');

      expect(field.kind).toBe('field');
      expect(field.context).toBe('http_request');
      expect(field.value).toEqual(EMPTY_FIELD_VALUE);
      expect(field.id).toMatch(/^c\d+$/);
    });

    it('creates a new attack condition', () => {
      const attack = newAttack('sqli', 'flow');

      expect(attack.kind).toBe('attack');
      expect(attack.attackType).toBe('sqli');
      expect(attack.point).toBe('flow');
    });

    it('creates a new signal condition', () => {
      const signal = newSignal('key_duplicate', '[http:header]');

      expect(signal.kind).toBe('signal');
      expect(signal.signalType).toBe('key_duplicate');
      expect(signal.point).toBe('[http:header]');
    });

    it('creates a new group condition', () => {
      const group = newGroup('and');

      expect(group.kind).toBe('group');
      expect(group.operator).toBe('and');
      expect(group.children).toHaveLength(1);
      expect(group.children[0]?.kind).toBe('field');
    });

    it('creates a new sample condition', () => {
      const sample = newSample(25);

      expect(sample.kind).toBe('sample');
      expect(sample.percent).toBe(25);
      expect(sample.id).toMatch(/^c\d+$/);
    });
  });

  describe('fieldComplete', () => {
    it('returns false for empty field', () => {
      const field = newField();
      expect(fieldComplete(field)).toBe(false);
    });

    it('returns true for complete field with value', () => {
      const field = newField();
      field.value = {
        segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
        condition: 'equal',
        value: 'test',
        ignoreCase: false,
      };

      expect(fieldComplete(field)).toBe(true);
    });

    it('returns true for complete field without value (exists/absent)', () => {
      const field = newField();
      field.value = {
        segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
        condition: 'exists',
        value: '',
        ignoreCase: false,
      };

      expect(fieldComplete(field)).toBe(true);
    });

    it('returns false for field with segments but no condition', () => {
      const field = newField();
      field.value = {
        segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
        condition: null,
        value: '',
        ignoreCase: false,
      };

      expect(fieldComplete(field)).toBe(false);
    });
  });

  describe('toProtonCondition', () => {
    it('converts empty group to null', () => {
      const group = newGroup('and');
      group.children = [];

      const result = toProtonCondition(group, mockProton);
      expect(result).toBeNull();
    });

    it('converts simple field condition', () => {
      const group = newGroup('and');
      group.children = [
        {
          kind: 'field',
          id: 'c1',
          context: 'http_request',
          value: {
            segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
            condition: 'equal',
            value: 'test',
            ignoreCase: false,
          },
        },
      ];

      const result = toProtonCondition(group, mockProton);
      expect(result).toEqual({
        operator: 'and',
        checks: [
          {
            type: 'equal',
            context: 'http_request',
            point: '[http:header]',
            value: 'test',
          },
        ],
      });
    });

    it('converts attack condition', () => {
      const group = newGroup('and');
      group.children = [newAttack('sqli', 'flow')];

      const result = toProtonCondition(group, mockProton);
      expect(result).toEqual({
        operator: 'and',
        checks: [
          {
            type: 'attack_present',
            context: 'http_request',
            point: 'flow',
            attack: { attack_type: 'sqli' },
          },
        ],
      });
    });

    it('wraps not(multiple) as not(or(...))', () => {
      const group = newGroup('not');
      const attack1 = newAttack('sqli', 'flow');
      const attack2 = newAttack('xss', 'flow');
      group.children = [attack1, attack2];

      const result = toProtonCondition(group, mockProton);
      expect(result).toEqual({
        operator: 'not',
        checks: [
          {
            operator: 'or',
            checks: [
              {
                type: 'attack_present',
                context: 'http_request',
                point: 'flow',
                attack: { attack_type: 'sqli' },
              },
              {
                type: 'attack_present',
                context: 'http_request',
                point: 'flow',
                attack: { attack_type: 'xss' },
              },
            ],
          },
        ],
      });
    });

    it('converts sample condition', () => {
      const group = newGroup('and');
      group.children = [newSample(25)];

      const result = toProtonCondition(group, mockProton);
      expect(result).toEqual({
        operator: 'and',
        checks: [
          {
            type: 'sample',
            percent: 25,
          },
        ],
      });
    });
  });

  describe('fromProtonCondition', () => {
    it('converts null to empty group', () => {
      const result = fromProtonCondition(null);
      expect(result.kind).toBe('group');
      expect(result.operator).toBe('and');
      expect(result.children).toHaveLength(0);
    });

    it('unwraps not(or(...)) to not with children', () => {
      const proton = {
        operator: 'not' as const,
        checks: [
          {
            operator: 'or' as const,
            checks: [
              {
                type: 'attack_present',
                context: 'http_request',
                point: 'flow',
                attack: { attack_type: 'sqli' },
              },
              {
                type: 'attack_present',
                context: 'http_request',
                point: 'flow',
                attack: { attack_type: 'xss' },
              },
            ],
          },
        ],
      };

      const result = fromProtonCondition(proton);
      expect(result.operator).toBe('not');
      expect(result.children).toHaveLength(2);
      expect(result.children[0]?.kind).toBe('attack');
      expect(result.children[1]?.kind).toBe('attack');
    });

    it('converts sample check from Proton', () => {
      const proton = {
        operator: 'and' as const,
        checks: [
          {
            type: 'sample',
            percent: 10,
          },
        ],
      };

      const result = fromProtonCondition(proton);
      expect(result.operator).toBe('and');
      expect(result.children).toHaveLength(1);
      const sample = result.children[0];
      expect(sample?.kind).toBe('sample');
      if (sample?.kind === 'sample') {
        expect(sample.percent).toBe(10);
      }
    });
  });

  describe('conditionProblems', () => {
    it('returns no problems for valid condition', () => {
      const group = newGroup('and');
      group.children = [
        {
          kind: 'field',
          id: 'c1',
          context: 'http_request',
          value: {
            segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
            condition: 'equal',
            value: 'test',
            ignoreCase: false,
          },
        },
      ];

      const problems = conditionProblems(group);
      expect(problems).toHaveLength(0);
    });

    it('detects incomplete field conditions', () => {
      const group = newGroup('and');
      group.children = [newField()];

      const problems = conditionProblems(group);
      expect(problems).toContain(
        'Finish every condition: say where the value is, the condition and the value.',
      );
    });

    it('detects attack/signal in not group', () => {
      const group = newGroup('not');
      group.children = [newAttack('sqli', 'flow')];

      const problems = conditionProblems(group);
      expect(problems).toContain(
        '"None of" cannot contain attack, anomaly, tag, or sample conditions.',
      );
    });

    it('detects empty signal type', () => {
      const group = newGroup('and');
      const signal = newSignal('', '[http:header]');
      group.children = [signal];

      const problems = conditionProblems(group);
      expect(problems).toContain('Choose which request anomaly.');
    });

    it('detects invalid sample percent (too low)', () => {
      const group = newGroup('and');
      const sample = newSample(0);
      group.children = [sample];

      const problems = conditionProblems(group);
      expect(problems).toContain('Sample percent must be between 0 and 100.');
    });

    it('detects invalid sample percent (too high)', () => {
      const group = newGroup('and');
      const sample = newSample(150);
      group.children = [sample];

      const problems = conditionProblems(group);
      expect(problems).toContain('Sample percent must be between 0 and 100.');
    });

    it('allows valid sample percent', () => {
      const group = newGroup('and');
      const sample = newSample(50);
      group.children = [sample];

      const problems = conditionProblems(group);
      expect(problems).toHaveLength(0);
    });
  });

  describe('SDK canonical rendering', () => {
    it('uses SDK render when proton is available', () => {
      // Mock Proton SDK with render method - override default for this test
      const customMockProton = {
        point: {
          render: (segments: unknown[]) => {
            // Return canonical form instead of simple concatenation
            return "[http:header]['authorization']";
          },
        },
      } as any;

      const group = newGroup('and');
      group.children = [
        {
          kind: 'field',
          id: 'c1',
          context: 'http_request',
          value: {
            segments: [
              { text: '[http:header]', kind: 'native', label: 'HTTP header' },
              { text: "['authorization']", kind: 'key', label: 'authorization' },
            ],
            condition: 'equal',
            value: 'Bearer token',
            ignoreCase: false,
          },
        },
      ];

      const result = toProtonCondition(group, customMockProton);
      expect(result).toEqual({
        operator: 'and',
        checks: [
          {
            type: 'equal',
            context: 'http_request',
            point: "[http:header]['authorization']", // SDK canonical form
            value: 'Bearer token',
          },
        ],
      });
    });

    it('throws error when proton is null (P1.8+ behavior)', () => {
      const group = newGroup('and');
      group.children = [
        {
          kind: 'field',
          id: 'c1',
          context: 'http_request',
          value: {
            segments: [
              { text: '[http:header]', kind: 'native', label: 'HTTP header' },
              { text: "['authorization']", kind: 'key', label: 'authorization' },
            ],
            condition: 'equal',
            value: 'Bearer token',
            ignoreCase: false,
          },
        },
      ];

      // After P1.8 refactoring, pointOf() requires SDK - passing null throws error
      expect(() => toProtonCondition(group, null)).toThrow(
        'renderSegments: SDK not available - cannot render segments without Proton instance',
      );
    });

    it('preserves SDK canonical form through round-trip', () => {
      const customMockProton = {
        point: {
          render: (segments: unknown[]) => "[http:header]['content-type'][role:value]",
        },
      } as any;

      const group = newGroup('and');
      group.children = [
        {
          kind: 'field',
          id: 'c1',
          context: 'http_request',
          value: {
            segments: [
              { text: '[http:header]', kind: 'native', label: 'HTTP header' },
              { text: "['content-type']", kind: 'key', label: 'content-type' },
              { text: '[role:value]', kind: 'role', label: 'value' },
            ],
            condition: 'contains',
            value: 'json',
            ignoreCase: false,
          },
        },
      ];

      // Convert to Proton format
      const protonFormat = toProtonCondition(group, customMockProton);

      // Verify canonical form is stored
      expect(protonFormat?.checks[0]).toMatchObject({
        type: 'contains',
        point: "[http:header]['content-type'][role:value]",
        value: 'json',
      });
    });
  });

  describe('round-trip conversions', () => {
    describe('UI → Proton → UI preserves structure', () => {
      it('single field condition', () => {
        const original: GroupCondition = {
          kind: 'group',
          id: 'c1',
          operator: 'and',
          children: [
            {
              kind: 'field',
              id: 'c2',
              context: 'http_request',
              value: {
                segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
                condition: 'equal',
                value: 'test-value',
                ignoreCase: false,
              },
            },
          ],
        };

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        // IDs will be regenerated, so compare structure without them
        expect(restored.operator).toBe(original.operator);
        expect(restored.children).toHaveLength(original.children.length);
        const restoredField = restored.children[0] as FieldCondition;
        const originalField = original.children[0] as FieldCondition;
        expect(restoredField.kind).toBe(originalField.kind);
        expect(restoredField.context).toBe(originalField.context);
        expect(restoredField.value.condition).toBe(originalField.value.condition);
        expect(restoredField.value.value).toBe(originalField.value.value);
      });

      it('attack condition', () => {
        const original = newGroup('and');
        original.children = [newAttack('sqli', 'flow')];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.operator).toBe('and');
        expect(restored.children).toHaveLength(1);
        const attack = restored.children[0];
        expect(attack?.kind).toBe('attack');
        if (attack?.kind === 'attack') {
          expect(attack.attackType).toBe('sqli');
          expect(attack.point).toBe('flow');
        }
      });

      it('signal condition - key_duplicate', () => {
        const original = newGroup('or');
        original.children = [newSignal('key_duplicate', '[http:header]')];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.operator).toBe('or');
        const signal = restored.children[0];
        expect(signal?.kind).toBe('signal');
        if (signal?.kind === 'signal') {
          expect(signal.signalType).toBe('key_duplicate');
          expect(signal.point).toBe('[http:header]');
        }
      });

      it('signal condition - resource_overlimit', () => {
        const original = newGroup('and');
        const signal = newSignal('resource_overlimit', 'flow');
        signal.limit = '10Ki';
        original.children = [signal];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        const restoredSignal = restored.children[0];
        expect(restoredSignal?.kind).toBe('signal');
        if (restoredSignal?.kind === 'signal') {
          expect(restoredSignal.signalType).toBe('resource_overlimit');
          expect(restoredSignal.limit).toBe('10Ki');
        }
      });

      it('sample condition', () => {
        const original = newGroup('and');
        original.children = [newSample(33)];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.operator).toBe('and');
        const sample = restored.children[0];
        expect(sample?.kind).toBe('sample');
        if (sample?.kind === 'sample') {
          expect(sample.percent).toBe(33);
        }
      });

      it('nested group with mixed conditions', () => {
        const original = newGroup('and');
        original.children = [
          newField(),
          {
            kind: 'group',
            id: 'nested',
            operator: 'or',
            children: [newAttack('xss', 'flow'), newSignal('key_duplicate', '[http:header]')],
          },
        ];

        // Complete the field to make it valid
        const field = original.children[0] as FieldCondition;
        field.value = {
          segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
          condition: 'contains',
          value: 'test',
          ignoreCase: false,
        };

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.operator).toBe('and');
        expect(restored.children).toHaveLength(2);

        const nestedGroup = restored.children[1];
        expect(nestedGroup?.kind).toBe('group');
        if (nestedGroup?.kind === 'group') {
          expect(nestedGroup.operator).toBe('or');
          expect(nestedGroup.children).toHaveLength(2);
        }
      });

      it('not group with multiple children', () => {
        const original = newGroup('not');
        original.children = [
          {
            kind: 'field',
            id: 'c1',
            context: 'http_request',
            value: {
              segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
              condition: 'equal',
              value: 'admin',
              ignoreCase: false,
            },
          },
          {
            kind: 'field',
            id: 'c2',
            context: 'http_request',
            value: {
              segments: [{ text: '[http:uri]', kind: 'native', label: 'URI' }],
              condition: 'startswith',
              value: '/api',
              ignoreCase: false,
            },
          },
        ];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.operator).toBe('not');
        expect(restored.children).toHaveLength(2);
      });

      it('empty group', () => {
        const original = newGroup('and');
        original.children = [];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.kind).toBe('group');
        expect(restored.children).toHaveLength(0);
      });

      it('field with case insensitive flag', () => {
        const original = newGroup('and');
        original.children = [
          {
            kind: 'field',
            id: 'c1',
            context: 'http_request',
            value: {
              segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
              condition: 'contains',
              value: 'test',
              ignoreCase: true,
            },
          },
        ];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        const field = restored.children[0];
        expect(field?.kind).toBe('field');
        if (field?.kind === 'field') {
          expect(field.value.ignoreCase).toBe(true);
        }
      });

      it('field with exists condition (no value)', () => {
        const original = newGroup('and');
        original.children = [
          {
            kind: 'field',
            id: 'c1',
            context: 'http_request',
            value: {
              segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
              condition: 'exists',
              value: '',
              ignoreCase: false,
            },
          },
        ];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        const field = restored.children[0];
        expect(field?.kind).toBe('field');
        if (field?.kind === 'field') {
          expect(field.value.condition).toBe('exists');
          expect(field.value.value).toBe('');
        }
      });

      it('complex nested tree', () => {
        const original = newGroup('and');
        original.children = [
          newAttack('sqli', 'flow'),
          {
            kind: 'group',
            id: 'nested1',
            operator: 'or',
            children: [
              {
                kind: 'field',
                id: 'c1',
                context: 'http_request',
                value: {
                  segments: [{ text: '[http:uri]', kind: 'native', label: 'URI' }],
                  condition: 'regexp',
                  value: '^/admin',
                  ignoreCase: false,
                },
              },
              {
                kind: 'group',
                id: 'nested2',
                operator: 'and',
                children: [
                  newSignal('key_duplicate', '[http:header]'),
                  {
                    kind: 'field',
                    id: 'c2',
                    context: 'http_request',
                    value: {
                      segments: [{ text: '[http:method]', kind: 'native', label: 'Method' }],
                      condition: 'equal',
                      value: 'POST',
                      ignoreCase: false,
                    },
                  },
                ],
              },
            ],
          },
        ];

        const proton = toProtonCondition(original, mockProton);
        const restored = fromProtonCondition(proton, mockProton);

        expect(restored.operator).toBe('and');
        expect(restored.children).toHaveLength(2);
        expect(restored.children[0]?.kind).toBe('attack');

        const nestedOr = restored.children[1];
        expect(nestedOr?.kind).toBe('group');
        if (nestedOr?.kind === 'group') {
          expect(nestedOr.operator).toBe('or');
          expect(nestedOr.children).toHaveLength(2);

          const deepNested = nestedOr.children[1];
          expect(deepNested?.kind).toBe('group');
          if (deepNested?.kind === 'group') {
            expect(deepNested.operator).toBe('and');
            expect(deepNested.children).toHaveLength(2);
          }
        }
      });
    });

    describe('Proton → UI → Proton preserves structure', () => {
      it('simple field check', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'equal',
              context: 'http_request',
              point: '[http:header]',
              value: 'test',
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('attack check', () => {
        const original = {
          operator: 'or' as const,
          checks: [
            {
              type: 'attack_present',
              context: 'http_request',
              point: 'flow',
              attack: { attack_type: 'xss' },
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('signal check - key_duplicate', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'signal_present',
              context: 'http_request',
              point: '[http:header]',
              signal: { signal_type: 'key_duplicate' },
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('signal check - resource_overlimit with limit', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'signal_present',
              context: 'http_request',
              point: 'flow',
              signal: { signal_type: 'resource_overlimit', limit: '5Ki' },
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('nested groups', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'equal',
              context: 'http_request',
              point: '[http:method]',
              value: 'POST',
            },
            {
              operator: 'or' as const,
              checks: [
                {
                  type: 'attack_present',
                  context: 'http_request',
                  point: 'flow',
                  attack: { attack_type: 'sqli' },
                },
                {
                  type: 'attack_present',
                  context: 'http_request',
                  point: 'flow',
                  attack: { attack_type: 'xss' },
                },
              ],
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('not with wrapped or (multiple children)', () => {
        const original = {
          operator: 'not' as const,
          checks: [
            {
              operator: 'or' as const,
              checks: [
                {
                  type: 'equal',
                  context: 'http_request',
                  point: '[http:uri]',
                  value: '/admin',
                },
                {
                  type: 'equal',
                  context: 'http_request',
                  point: '[http:uri]',
                  value: '/secret',
                },
              ],
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('field with case_sensitive false', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'contains',
              context: 'http_request',
              point: '[http:header]',
              value: 'test',
              case_sensitive: false,
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('exists condition (no value field)', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'exists',
              context: 'http_request',
              point: '[http:header]',
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('sample check', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'sample',
              percent: 15,
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('all condition types', () => {
        const types = [
          'equal',
          'nequal',
          'contains',
          'startswith',
          'endswith',
          'regexp',
          'nregexp',
          'exists',
          'absent',
        ];

        for (const type of types) {
          const original = {
            operator: 'and' as const,
            checks: [
              {
                type,
                context: 'http_request',
                point: '[http:uri]',
                ...(type !== 'exists' && type !== 'absent' ? { value: 'test' } : {}),
              },
            ],
          };

          const ui = fromProtonCondition(original, mockProton);
          const restored = toProtonCondition(ui, mockProton);

          expect(restored).toEqual(original);
        }
      });

      it('deeply nested tree', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'attack_present',
              context: 'http_request',
              point: 'flow',
              attack: { attack_type: 'sqli' },
            },
            {
              operator: 'or' as const,
              checks: [
                {
                  type: 'equal',
                  context: 'http_request',
                  point: '[http:uri]',
                  value: '/admin',
                },
                {
                  operator: 'and' as const,
                  checks: [
                    {
                      type: 'signal_present',
                      context: 'http_request',
                      point: '[http:header]',
                      signal: { signal_type: 'key_duplicate' },
                    },
                    {
                      type: 'equal',
                      context: 'http_request',
                      point: '[http:method]',
                      value: 'POST',
                    },
                  ],
                },
              ],
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });
    });

    describe('edge cases', () => {
      it('handles null as empty group', () => {
        const ui = fromProtonCondition(null);
        const proton = toProtonCondition(ui, mockProton);

        expect(proton).toBeNull();
      });

      it('handles empty checks array', () => {
        const original = { operator: 'and' as const, checks: [] };
        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toBeNull();
      });

      it('filters out incomplete field conditions on UI→Proton', () => {
        const ui = newGroup('and');
        ui.children = [
          newField(), // Incomplete
          {
            kind: 'field',
            id: 'c2',
            context: 'http_request',
            value: {
              segments: [{ text: '[http:header]', kind: 'native', label: 'HTTP header' }],
              condition: 'equal',
              value: 'valid',
              ignoreCase: false,
            },
          },
        ];

        const proton = toProtonCondition(ui, mockProton);

        expect(proton?.checks).toHaveLength(1);
      });

      it('preserves raw conditions', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              custom_type: 'unsupported',
              some_field: 'value',
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });

      it('handles attack without attack_type', () => {
        const original = {
          operator: 'and' as const,
          checks: [
            {
              type: 'attack_present',
              context: 'http_request',
              point: 'flow',
            },
          ],
        };

        const ui = fromProtonCondition(original, mockProton);
        const restored = toProtonCondition(ui, mockProton);

        expect(restored).toEqual(original);
      });
    });
  });
});

describe('attack filter fields', () => {
  // Reuse the same mock Proton instance from the main describe block
  const mockProton = {
    point: {
      // render() converts SDK segments to canonical point string
      render: (segments: any[]) => {
        return segments
          .map((s: any) => {
            // Handle UI segments with text property
            if (s.text) return s.text;

            // Handle SDK segments
            if (s.kind === 'native') return `[http:${s.value}]`;
            if (s.kind === 'key') return `['${s.value}']`;
            if (s.kind === 'content') return `[format:${s.name}]`;

            // Fallback
            return '';
          })
          .join('');
      },
      // parse() converts canonical point string back to SDK segments
      parse: (point: string) => {
        const segments: any[] = [];
        const parts = point.match(/\[([^\]]+)\]/g) || [];

        for (const part of parts) {
          const content = part.slice(1, -1);

          if (content.startsWith('http:')) {
            segments.push({ kind: 'native', value: content.slice(5) });
          } else if (content.startsWith("'") && content.endsWith("'")) {
            segments.push({ kind: 'key', value: content.slice(1, -1) });
          } else if (content.startsWith('format:')) {
            segments.push({ kind: 'content', name: content.slice(7) });
          }
        }

        return segments;
      },
    },
    version: () => ({ canonical: '1' }),
  } as any;

  describe('property and reference (format 0.10.3)', () => {
    it('serializes attack with property filter (single value)', () => {
      const attack = newAttack('xxe', '[http:body][format:xml][**]');
      attack.source = 'xml';
      attack.property = 'dtd';

      const group = newGroup('and');
      group.children = [attack];

      const result = toProtonCondition(group, mockProton);
      expect(result).toEqual({
        operator: 'and',
        checks: [
          {
            type: 'attack_present',
            context: 'http_request',
            point: '[http:body][format:xml][**]',
            attack: {
              attack_type: 'xxe',
              source: 'xml',
              property: 'dtd',
            },
          },
        ],
      });
    });

    it('serializes attack with reference filter (equal operator, single value)', () => {
      const attack = newAttack('xxe', '[http:body][format:xml][**]');
      attack.source = 'xml';
      attack.property = 'dtd';
      attack.reference = {
        operator: 'equal',
        value: 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd',
      };

      const group = newGroup('and');
      group.children = [attack];

      const result = toProtonCondition(group, mockProton);
      expect(result).toEqual({
        operator: 'and',
        checks: [
          {
            type: 'attack_present',
            context: 'http_request',
            point: '[http:body][format:xml][**]',
            attack: {
              attack_type: 'xxe',
              source: 'xml',
              property: 'dtd',
              reference: {
                operator: 'equal',
                value: 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd',
              },
            },
          },
        ],
      });
    });

    it('deserializes attack with reference filter', () => {
      const proton = {
        operator: 'and' as const,
        checks: [
          {
            type: 'attack_present',
            context: 'http_request',
            point: '[http:body][format:xml][**]',
            attack: {
              attack_type: 'xxe',
              source: 'xml',
              property: 'dtd',
              reference: {
                operator: 'equal',
                value: 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd',
              },
            },
          },
        ],
      };

      const result = fromProtonCondition(proton, mockProton);
      const attack = result.children[0];

      expect(attack?.kind).toBe('attack');
      if (attack?.kind === 'attack') {
        expect(attack.reference).toEqual({
          operator: 'equal',
          value: 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd',
        });
      }
    });

    it('round-trips attack with property and reference filters', () => {
      const original = {
        operator: 'and' as const,
        checks: [
          {
            type: 'attack_present',
            context: 'http_request',
            point: '[http:body][format:xml][**]',
            attack: {
              attack_type: 'xxe',
              source: 'xml',
              property: ['dtd', 'xinclude'],
              reference: {
                operator: 'equal' as const,
                value: ['http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'],
              },
            },
          },
        ],
      };

      const ui = fromProtonCondition(original, mockProton);
      const restored = toProtonCondition(ui, mockProton);

      expect(restored).toEqual(original);
    });
  });
});
