/**
 * extractBindings Tests
 *
 * Unit tests for binding extraction from condition tree.
 */

import { describe, expect, it } from 'vitest';
import { newAttack, newField, newGroup, newSignal } from '../models/conditionModel';
import { extractBindings } from './extractBindings';

describe('extractBindings', () => {
  it('returns empty array for empty condition tree', () => {
    const condition = newGroup('and');
    const bindings = extractBindings(condition);

    expect(bindings).toEqual([]);
  });

  it('extracts attack binding from attack condition', () => {
    const condition = newGroup('and');
    const attack = newAttack('sqli');
    attack.bindAttack = 'a';
    condition.children = [attack];

    const bindings = extractBindings(condition);

    expect(bindings).toHaveLength(1);
    expect(bindings[0]).toMatchObject({
      id: 'a',
      type: 'attack',
    });
    expect(bindings[0]?.label).toContain('sqli');
  });

  it('extracts point binding from field condition', () => {
    const condition = newGroup('and');
    const field = newField();
    field.bindPoint = 'n';
    field.value.condition = 'regexp';
    condition.children = [field];

    const bindings = extractBindings(condition);

    expect(bindings).toHaveLength(1);
    expect(bindings[0]).toMatchObject({
      id: 'n',
      type: 'point',
    });
    expect(bindings[0]?.label).toContain('regexp');
  });

  it('extracts point binding from signal condition', () => {
    const condition = newGroup('and');
    const signal = newSignal('key_duplicate');
    signal.bindPoint = 'p';
    condition.children = [signal];

    const bindings = extractBindings(condition);

    expect(bindings).toHaveLength(1);
    expect(bindings[0]).toMatchObject({
      id: 'p',
      type: 'point',
    });
    expect(bindings[0]?.label).toContain('key_duplicate');
  });

  it('extracts multiple bindings from nested conditions', () => {
    const condition = newGroup('and');

    const attack1 = newAttack('sqli');
    attack1.bindAttack = 'a1';

    const attack2 = newAttack('xss');
    attack2.bindAttack = 'a2';

    const field = newField();
    field.bindPoint = 'n1';
    field.value.condition = 'equal';

    const signal = newSignal('resource_overlimit');
    signal.bindPoint = 'n2';

    const innerGroup = newGroup('or');
    innerGroup.children = [field, signal];

    condition.children = [attack1, attack2, innerGroup];

    const bindings = extractBindings(condition);

    expect(bindings).toHaveLength(4);

    const attackBindings = bindings.filter(b => b.type === 'attack');
    const pointBindings = bindings.filter(b => b.type === 'point');

    expect(attackBindings).toHaveLength(2);
    expect(pointBindings).toHaveLength(2);

    expect(attackBindings.map(b => b.id)).toEqual(['a1', 'a2']);
    expect(pointBindings.map(b => b.id)).toEqual(['n1', 'n2']);
  });

  it('ignores conditions without bindings', () => {
    const condition = newGroup('and');

    const attack = newAttack('sqli');
    // No bindAttack set

    const field = newField();
    field.value.condition = 'equal';
    // No bindPoint set

    condition.children = [attack, field];

    const bindings = extractBindings(condition);

    expect(bindings).toEqual([]);
  });

  it('handles mixed conditions with and without bindings', () => {
    const condition = newGroup('and');

    const attack1 = newAttack('sqli');
    attack1.bindAttack = 'a';

    const attack2 = newAttack('xss');
    // No binding

    const field1 = newField();
    field1.bindPoint = 'n';
    field1.value.condition = 'regexp';

    const field2 = newField();
    field2.value.condition = 'equal';
    // No binding

    condition.children = [attack1, attack2, field1, field2];

    const bindings = extractBindings(condition);

    expect(bindings).toHaveLength(2);
    expect(bindings.map(b => b.id)).toEqual(['a', 'n']);
  });

  it('generates descriptive labels for attack bindings', () => {
    const condition = newGroup('and');

    const attack1 = newAttack('sqli');
    attack1.bindAttack = 'a';

    const attack2 = newAttack('');
    attack2.bindAttack = 'b';

    condition.children = [attack1, attack2];

    const bindings = extractBindings(condition);

    expect(bindings[0]?.label).toContain("'a'");
    expect(bindings[0]?.label).toContain('sqli');

    expect(bindings[1]?.label).toContain("'b'");
    expect(bindings[1]?.label).toContain('any attack');
  });

  it('generates descriptive labels for point bindings', () => {
    const condition = newGroup('and');

    const field = newField();
    field.bindPoint = 'n';
    field.value.condition = 'startswith';

    const signal = newSignal('key_duplicate');
    signal.bindPoint = 'p';

    condition.children = [field, signal];

    const bindings = extractBindings(condition);

    expect(bindings[0]?.label).toContain("'n'");
    expect(bindings[0]?.label).toContain('startswith');

    expect(bindings[1]?.label).toContain("'p'");
    expect(bindings[1]?.label).toContain('key_duplicate');
  });
});
