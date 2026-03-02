import { describe, expect, it } from 'vitest';
import type { Condition } from '../types';
import { parse, parseCondition } from './parser';

describe('FilterComponent Parser', () => {
  describe('parseCondition', () => {
    it('should parse simple equality condition', () => {
      const result = parseCondition('status = active');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      } as Condition);
    });

    it('should parse not-equal condition', () => {
      const result = parseCondition('type != admin');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'type',
        operator: '!=',
        value: 'admin',
      } as Condition);
    });

    it('should parse greater-than condition with number', () => {
      const result = parseCondition('count > 10');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'count',
        operator: '>',
        value: 10,
      } as Condition);
    });

    it('should parse less-than condition', () => {
      const result = parseCondition('age < 18');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'age',
        operator: '<',
        value: 18,
      } as Condition);
    });

    it('should parse greater-than-or-equal condition', () => {
      const result = parseCondition('score >= 100');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'score',
        operator: '>=',
        value: 100,
      } as Condition);
    });

    it('should parse less-than-or-equal condition', () => {
      const result = parseCondition('price <= 50');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'price',
        operator: '<=',
        value: 50,
      } as Condition);
    });

    it('should parse like condition', () => {
      const result = parseCondition('name like test');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'name',
        operator: 'like',
        value: 'test',
      } as Condition);
    });

    it('should parse not_like condition', () => {
      const result = parseCondition('description not_like spam');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'description',
        operator: 'not_like',
        value: 'spam',
      } as Condition);
    });

    it('should parse boolean values', () => {
      const result = parseCondition('active = true');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'active',
        operator: '=',
        value: true,
      } as Condition);
    });

    it('should parse null values', () => {
      const result = parseCondition('description = null');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'description',
        operator: '=',
        value: null,
      } as Condition);
    });

    it('should handle incomplete input (field only)', () => {
      const result = parseCondition('status');

      expect(result.isComplete).toBe(false);
      expect(result.expression).toBeNull();
      expect(result.remainingText).toBe('status');
    });

    it('should handle incomplete input (field and operator, no value)', () => {
      const result = parseCondition('status =');

      expect(result.isComplete).toBe(false);
      expect(result.expression).toBeNull();
    });

    it('should handle empty input', () => {
      const result = parseCondition('');

      expect(result.isComplete).toBe(false);
      expect(result.expression).toBeNull();
      expect(result.remainingText).toBe('');
    });

    it('should handle whitespace in input', () => {
      const result = parseCondition('  status   =   active  ');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      } as Condition);
    });

    it('should parse floating point numbers', () => {
      const result = parseCondition('price = 99.99');

      expect(result.isComplete).toBe(true);
      const condition = result.expression as Condition;
      expect(condition.value).toBe(99.99);
    });

    it('should handle field names with underscores', () => {
      const result = parseCondition('user_status = active');

      expect(result.isComplete).toBe(true);
      expect((result.expression as Condition).field).toBe('user_status');
    });

    // US-003: Quoted String Support
    describe('quoted string values', () => {
      it('should parse double-quoted string with spaces', () => {
        const result = parseCondition('title = "hello world"');

        expect(result.isComplete).toBe(true);
        expect(result.expression).toEqual({
          type: 'condition',
          field: 'title',
          operator: '=',
          value: 'hello world',
        } as Condition);
      });

      it('should parse single-quoted string with spaces', () => {
        const result = parseCondition("description = 'test value here'");

        expect(result.isComplete).toBe(true);
        expect(result.expression).toEqual({
          type: 'condition',
          field: 'description',
          operator: '=',
          value: 'test value here',
        } as Condition);
      });

      it('should handle escaped double quotes in double-quoted string', () => {
        const result = parseCondition('message = "say \\"hello\\""');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('say "hello"');
      });

      it('should handle escaped single quotes in single-quoted string', () => {
        const result = parseCondition("text = 'it\\'s working'");

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe("it's working");
      });

      it('should handle escaped backslashes', () => {
        const result = parseCondition('path = "C:\\\\Users\\\\test"');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('C:\\Users\\test');
      });

      it('should handle empty quoted string', () => {
        const result = parseCondition('value = ""');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('');
      });

      it('should handle quoted string with special characters', () => {
        const result = parseCondition('email = "user@example.com"');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('user@example.com');
      });

      it('should handle incomplete quoted string (unclosed quote)', () => {
        const result = parseCondition('title = "hello');

        expect(result.isComplete).toBe(false);
        expect(result.expression).toBeNull();
      });

      it('should handle quoted string with numbers', () => {
        const result = parseCondition('code = "123"');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('123');
        expect(typeof condition.value).toBe('string');
      });

      it('should parse quoted value with like operator', () => {
        const result = parseCondition('name like "john doe"');

        expect(result.isComplete).toBe(true);
        expect(result.expression).toEqual({
          type: 'condition',
          field: 'name',
          operator: 'like',
          value: 'john doe',
        } as Condition);
      });

      it('should handle mixed quotes (single inside double)', () => {
        const result = parseCondition('text = "it\'s fine"');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe("it's fine");
      });

      it('should handle mixed quotes (double inside single)', () => {
        const result = parseCondition('quote = \'"hello" world\'');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('"hello" world');
      });

      it('should still parse unquoted values', () => {
        const result = parseCondition('status = active');

        expect(result.isComplete).toBe(true);
        const condition = result.expression as Condition;
        expect(condition.value).toBe('active');
      });
    });
  });

  describe('parse (main function)', () => {
    it('should parse simple condition', () => {
      const result = parse('status = active');

      expect(result.isComplete).toBe(true);
      expect(result.expression).toEqual({
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      } as Condition);
    });

    it('should handle incremental parsing', () => {
      // Typing progressively
      const incompleteInputs = ['s', 'st', 'sta', 'status', 'status ', 'status ='];
      const completeInputs = ['status = a', 'status = active'];

      // Incomplete inputs should not parse
      incompleteInputs.forEach(input => {
        const result = parse(input);
        expect(result.isComplete).toBe(false);
      });

      // Complete inputs should parse successfully
      completeInputs.forEach(input => {
        const result = parse(input);
        expect(result.isComplete).toBe(true);
      });
    });
  });
});
