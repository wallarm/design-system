import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInput } from '../FilterInput';
import type { ExprNode, FieldMetadata } from '../types';

/**
 * Ark UI defers menu mount a frame after the state transition, so the default
 * 1s findByRole timeout flakes under CI shard load. Mirrors the helper in
 * FilterInput.test.tsx.
 */
const findMenuitem = (name: RegExp | string) =>
  screen.findByRole('menuitem', { name }, { timeout: 10000 });

/**
 * `severity` groups 4 of its 5 values, leaving `info` for the trailing
 * headerless section. `single_only` allows no multi-select operator, so its
 * group headers must stay inert.
 */
const fields: FieldMetadata[] = [
  {
    name: 'severity',
    label: 'Severity',
    type: 'enum',
    operators: ['=', '!=', 'in', 'not_in'],
    values: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'info', label: 'Info' },
    ],
    valueGroups: [
      { label: 'Urgent', values: ['critical', 'high'] },
      { label: 'Routine', values: ['medium', 'low'] },
    ],
  },
  {
    name: 'single_only',
    label: 'Single only',
    type: 'enum',
    // No `in` / `not_in` — nothing for a group header to switch into.
    operators: ['=', '!='],
    values: [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ],
    valueGroups: [{ label: 'Letters', values: ['a', 'b'] }],
  },
];

/** Drive the field → operator menus so the value menu is open. */
const openValueMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  fieldLabel: string,
  operatorLabel: RegExp,
) => {
  await user.click(screen.getByRole('combobox'));
  await user.click(await findMenuitem(fieldLabel));
  await user.click(await findMenuitem(operatorLabel));
};

const groupHeader = (label: string) =>
  screen.getByRole('menuitem', { name: new RegExp(`^${label}$`) });

describe('FilterInput value groups', () => {
  describe('rendering', () => {
    it('renders group headers with their members', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);

      expect(await findMenuitem(/^Urgent$/)).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /^Routine$/ })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Critical' })).toBeInTheDocument();
    });

    it('renders values in group order, not declaration order', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem(/^Urgent$/);

      const rows = screen
        .getAllByRole('menuitem')
        .map(el => el.textContent)
        .filter((t): t is string => !!t);

      // Urgent group and its members precede the Routine group; the ungrouped
      // `Info` lands last, in the trailing headerless section.
      expect(rows.indexOf('Urgent')).toBeLessThan(rows.indexOf('Critical'));
      expect(rows.indexOf('Critical')).toBeLessThan(rows.indexOf('Routine'));
      expect(rows.indexOf('Routine')).toBeLessThan(rows.indexOf('Medium'));
      expect(rows.indexOf('Info')).toBe(rows.length - 1);
    });

    it('renders headers as non-selectable labels when the field allows no multi-select operator', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Single only', /^is =$/);
      await findMenuitem('Alpha');

      // Present as a label, absent from the menuitem (keyboard-nav) set.
      expect(screen.getByText('Letters')).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /^Letters$/ })).not.toBeInTheDocument();
    });

    it('keeps a selected value inside its group rather than hoisting it to the top', async () => {
      const user = userEvent.setup();
      const expression: ExprNode = {
        type: 'condition',
        field: 'severity',
        operator: '=',
        value: 'low',
      };
      render(<FilterInput fields={fields} value={expression} />);

      // Click the chip's value segment to reopen the value menu for editing.
      await user.click(screen.getByText('Low'));
      await findMenuitem(/^Urgent$/);

      const rows = screen
        .getAllByRole('menuitem')
        .map(el => el.textContent)
        .filter((t): t is string => !!t);

      expect(rows.indexOf('Urgent')).toBeLessThan(rows.indexOf('Low'));
      expect(rows.indexOf('Routine')).toBeLessThan(rows.indexOf('Low'));
    });
  });

  describe('group select in multi-select mode', () => {
    it('checks every member when the header is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={fields} onChange={onChange} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem(/^Urgent$/);
      await user.click(groupHeader('Urgent'));

      // ArrowRight is the multi-select commit gesture (useValueMenuState wires it
      // to commitChecked); Escape would discard instead.
      await user.keyboard('{ArrowRight}');

      const condition = onChange.mock.calls.at(-1)?.[0];
      expect(condition).toMatchObject({
        type: 'condition',
        field: 'severity',
        operator: 'in',
        value: ['critical', 'high'],
      });
    });

    it('clears every member when an already-full group is selected again', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem(/^Urgent$/);

      await user.click(groupHeader('Urgent'));
      expect(groupHeader('Urgent').querySelector('[data-state]')).toHaveAttribute(
        'data-state',
        'checked',
      );

      await user.click(groupHeader('Urgent'));
      expect(groupHeader('Urgent').querySelector('[data-state]')).toHaveAttribute(
        'data-state',
        'unchecked',
      );
    });

    it('shows the header as indeterminate when only some members are checked', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem('Critical');
      await user.click(screen.getByRole('menuitem', { name: 'Critical' }));

      expect(groupHeader('Urgent').querySelector('[data-state]')).toHaveAttribute(
        'data-state',
        'indeterminate',
      );
    });

    it('leaves other groups untouched', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem(/^Urgent$/);
      await user.click(groupHeader('Urgent'));

      expect(groupHeader('Routine').querySelector('[data-state]')).toHaveAttribute(
        'data-state',
        'unchecked',
      );
    });
  });

  describe('group select under a single-select operator', () => {
    it('switches `=` to `in` and commits the members in one step', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={fields} onChange={onChange} />);

      await openValueMenu(user, 'Severity', /^is =$/);
      await findMenuitem(/^Urgent$/);
      await user.click(groupHeader('Urgent'));

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'condition',
          field: 'severity',
          operator: 'in',
          value: ['critical', 'high'],
        }),
      );
    });

    it('switches `!=` to `not_in`, preserving polarity', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={fields} onChange={onChange} />);

      await openValueMenu(user, 'Severity', /^is not !=$/);
      await findMenuitem(/^Urgent$/);
      await user.click(groupHeader('Urgent'));

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          field: 'severity',
          operator: 'not_in',
          value: ['critical', 'high'],
        }),
      );
    });
  });

  describe('search interaction', () => {
    it('drops groups with no matching values and keeps matching ones', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={fields} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem(/^Urgent$/);
      await user.keyboard('crit');

      expect(await findMenuitem(/^Urgent$/)).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /^Routine$/ })).not.toBeInTheDocument();
    });

    it('selects only the visible members of a searched-down group', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={fields} onChange={onChange} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem(/^Urgent$/);
      // Narrows Urgent to `Critical` only — `High` must not be swept in.
      await user.keyboard('crit');
      await user.click(groupHeader('Urgent'));

      await user.keyboard('{ArrowRight}');

      const condition = onChange.mock.calls.at(-1)?.[0];
      expect(condition).toMatchObject({ value: ['critical'] });
    });
  });

  describe('ungrouped fields', () => {
    it('renders a flat list with no headers when valueGroups is absent', async () => {
      const user = userEvent.setup();
      const flat: FieldMetadata[] = [{ ...fields[0]!, valueGroups: undefined }];
      render(<FilterInput fields={flat} />);

      await openValueMenu(user, 'Severity', /^is any of IN$/);
      await findMenuitem('Critical');

      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
      expect(screen.queryByText('Routine')).not.toBeInTheDocument();
    });
  });
});
