import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterInput } from '../FilterInput';
import type { Condition, ExprNode, FieldMetadata, Group } from '../types';

/**
 * Default findByRole timeout (1s) flakes under CI shard load because Ark UI
 * defers menu mount a frame after the state transition. Use this helper for
 * any menuitem we expect to appear after a click that opens or transitions a
 * menu — it widens the timeout uniformly. 10s is calibrated to absorb the
 * worst-case full-file run where userEvent + Ark UI mount + jsdom layout
 * stack up; tests still finish in <1s on a happy path.
 */
const findMenuitem = (name: RegExp | string) =>
  screen.findByRole('menuitem', { name }, { timeout: 10000 });

const sampleFields = [
  {
    name: 'status',
    label: 'Status',
    type: 'enum' as const,
    values: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'integer' as const,
    values: [
      { value: 1, label: 'Low' },
      { value: 5, label: 'Medium' },
    ],
  },
];

describe('FilterInput', () => {
  describe('basic rendering', () => {
    it('renders with default placeholder', () => {
      render(<FilterInput fields={sampleFields} />);
      expect(screen.getByPlaceholderText('Type to filter...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<FilterInput fields={sampleFields} placeholder='Search attacks...' />);
      expect(screen.getByPlaceholderText('Search attacks...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<FilterInput fields={sampleFields} className='custom-class' />);
      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('has combobox role on input', () => {
      render(<FilterInput fields={sampleFields} />);
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('controlled mode with single condition', () => {
    it('displays chip when value is a single Condition', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('calls onChange with null when chip is cleared', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} onChange={onChange} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('controlled mode with Group (multi-condition)', () => {
    it('displays multiple chips with AND connector', () => {
      const group: Group = {
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '=', value: 1 },
        ],
      };

      render(<FilterInput fields={sampleFields} value={group} />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
      expect(screen.getByText('AND')).toBeInTheDocument();
    });

    it('displays OR connector when group operator is or', () => {
      const group: Group = {
        type: 'group',
        operator: 'or',
        children: [
          { type: 'condition', field: 'status', operator: '=', value: 'active' },
          { type: 'condition', field: 'priority', operator: '=', value: 1 },
        ],
      };

      render(<FilterInput fields={sampleFields} value={group} />);

      expect(screen.getByText('OR')).toBeInTheDocument();
    });
  });

  describe('keyboard hint', () => {
    it('shows keyboard hint when showKeyboardHint is true', () => {
      render(<FilterInput fields={sampleFields} showKeyboardHint={true} />);

      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('does not show keyboard hint by default', () => {
      render(<FilterInput fields={sampleFields} />);

      expect(screen.queryByText('K')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('applies error border when error is true', () => {
      const { container } = render(<FilterInput fields={sampleFields} error={true} />);
      const field = container.querySelector('[data-slot="filter-input"]');
      expect(field).toHaveClass('border-border-strong-danger');
    });

    it('sets aria-invalid when error is true', () => {
      render(<FilterInput fields={sampleFields} error={true} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('applies normal styling when error is false', () => {
      const { container } = render(<FilterInput fields={sampleFields} error={false} />);
      const field = container.querySelector('[data-slot="filter-input"]');
      expect(field).toHaveClass('border-border-primary');
      expect(field).not.toHaveClass('border-border-strong-danger');
    });
  });

  describe('onErrorsChange (AS-1134)', () => {
    it('reports validation messages and clears them when fixed', async () => {
      const onErrorsChange = vi.fn();
      const invalid: Condition = {
        type: 'condition',
        field: 'priority',
        operator: '=',
        value: 'abc',
      };
      const { rerender } = render(
        <FilterInput fields={sampleFields} value={invalid} onErrorsChange={onErrorsChange} />,
      );
      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenLastCalledWith(
          expect.arrayContaining([expect.stringMatching(/Priority/i)]),
        );
      });

      const valid: Condition = { type: 'condition', field: 'priority', operator: '=', value: 5 };
      rerender(<FilterInput fields={sampleFields} value={valid} onErrorsChange={onErrorsChange} />);
      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenLastCalledWith([]);
      });
    });
  });

  describe('input focus on empty space click', () => {
    it('has cursor-text wrapper that delegates clicks to input', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      const { container } = render(<FilterInput fields={sampleFields} value={condition} />);

      const filterInput = container.querySelector('[data-slot="filter-input"]')!;
      const wrapper = filterInput.querySelector('.cursor-text')!;
      expect(wrapper).toBeTruthy();
      expect(wrapper.classList.contains('cursor-text')).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('has correct aria-label for clear button when chips exist', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      expect(clearButton).toHaveAttribute('aria-label', 'Clear all filters');
    });

    it('has combobox role attribute on input', () => {
      render(<FilterInput fields={sampleFields} />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });
  });

  describe('AS-983: focus stays in input while pointer hovers menu items', () => {
    // zag.js Menu's `focusMenu` action (fired on ITEM_POINTERMOVE) moves DOM
    // focus into Menu.Content (or its first tabbable — e.g. ScrollAreaViewport)
    // every time the mouse hovers a menu item. For the combobox pattern we
    // implement, that steals focus from the chip input and hides the caret.
    // The focusin guard in useFocusManagement must bounce focus back to the
    // input. We simulate the focus steal by calling `.focus()` directly on a
    // non-interactive descendant of the menu — jsdom doesn't reliably fire
    // pointermove → focusMenu via mouse helpers, so we exercise the guard
    // directly. See AS-983.

    it('bounces focus back to the main input when menu container receives focus', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={sampleFields} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Field menu should be open.
      const menu = await screen.findByRole('menu');
      expect(menu).toBeInTheDocument();

      // Simulate zag.js focusMenu stealing focus to Menu.Content.
      (menu as HTMLElement).focus();

      // The guard listens on document focusin and synchronously restores focus.
      expect(document.activeElement).toBe(input);
    });

    it('still bounces focus when a non-interactive descendant inside the menu is focused', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={sampleFields} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      const menu = await screen.findByRole('menu');
      // Pick any non-button/input descendant — guard should still redirect.
      const innerDiv = menu.querySelector('div[role="presentation"], div:not([role])');
      expect(innerDiv).toBeTruthy();
      // Force it focusable so .focus() works in jsdom regardless of tabindex.
      (innerDiv as HTMLElement).setAttribute('tabindex', '-1');
      (innerDiv as HTMLElement).focus();

      expect(document.activeElement).toBe(input);
    });

    it('does NOT bounce focus away from a deliberate click on a button inside the menu', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={sampleFields} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      const menu = await screen.findByRole('menu');
      // Inject a button into the menu and focus it — the guard must let
      // deliberate clicks on interactive controls through (date picker
      // Apply button, calendar arrows, etc.).
      const button = document.createElement('button');
      button.type = 'button';
      menu.appendChild(button);
      button.focus();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('Keyboard flow stays alive after Backspace removes a chip', () => {
    // Without this guard the user would be stranded: after Backspace deletes
    // the previous chip the dropdown stays closed, so the natural follow-up
    // (ArrowDown to navigate, Enter to select) does nothing.
    it('reopens the field menu immediately after Backspace removes the previous chip', async () => {
      const user = userEvent.setup();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };
      const { container } = render(<FilterInput fields={sampleFields} value={condition} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      // Backspace from the empty main input removes the previous chip.
      await user.keyboard('{Backspace}');

      // The chip must be gone AND the field menu must already be open so
      // ArrowDown highlights the first item on a single keypress.
      await waitFor(() => {
        expect(container.querySelector('[data-slot="filter-input-condition-chip"]')).toBeNull();
      });
      expect(await findMenuitem('Status')).toBeInTheDocument();
    });

    // Defense-in-depth: even if some path leaves the menu closed (e.g. a
    // future refactor), ArrowDown on a closed menu must reopen it via
    // nextBuildingMenu so the keyboard flow never deadlocks.
    it('reopens the menu on ArrowDown when state is closed and input is empty', async () => {
      const user = userEvent.setup();
      render(<FilterInput fields={sampleFields} />);

      const input = screen.getByRole('combobox');
      // Focus the container without going through onClick (which opens the
      // menu): blur immediately so menuState lands on 'closed' with the
      // input still focused.
      input.focus();
      input.blur();
      input.focus();
      // Now press ArrowDown while menu is closed.
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(await findMenuitem('Status')).toBeInTheDocument();
    });
  });

  describe('AS-929: state leak after segment edit cancel', () => {
    it('reopens field menu after editing a value segment, blurring, and removing the chip', async () => {
      const user = userEvent.setup();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      const input = screen.getByRole('combobox');

      // Step 1: Click value segment to enter editing mode.
      const valueSegment = screen.getByRole('button', { name: /Edit filter value/i });
      await user.click(valueSegment);

      // Sanity: segment is now an editable input.
      const segmentInput = screen.getByLabelText('Filter value');
      expect(segmentInput.tagName).toBe('INPUT');

      // Step 2: Blur the segment by focusing back to the main input
      // (cursor leaves the value segment but stays inside FilterInput).
      input.focus();

      // Step 3: Remove the chip via the X button.
      const removeButton = screen.getByRole('button', { name: 'Remove filter' });
      await user.click(removeButton);

      // Step 4: Click the main input — the field dropdown must reopen.
      await user.click(input);

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('reopens field menu after Escape cancels a value segment edit and the chip is removed', async () => {
      const user = userEvent.setup();
      const condition: Condition = {
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      const input = screen.getByRole('combobox');

      const valueSegment = screen.getByRole('button', { name: /Edit filter value/i });
      await user.click(valueSegment);

      // Cancel segment edit via Escape — same code path as blur, but a
      // different entry point (handleSegmentEditKeyDown). Pinning the post-
      // Escape state guards against the editing-state leak resurfacing on
      // either trigger.
      await user.keyboard('{Escape}');

      const removeButton = screen.getByRole('button', { name: 'Remove filter' });
      await user.click(removeButton);

      await user.click(input);

      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('getSuggestions-backed fields (AS-877)', () => {
    const staticCodeField: FieldMetadata = {
      name: 'code',
      label: 'Status code',
      type: 'enum',
      values: [
        { value: '200', label: '200 OK' },
        { value: '404', label: '404 Not Found' },
      ],
    };

    const dynamicCodeField: FieldMetadata = {
      name: 'code',
      label: 'Status code',
      type: 'integer',
      getSuggestions: (t: string) => [{ value: `${t || '2'}00`, label: `${t || '2'}00` }],
    };

    it('renders a specific invalid-value error for static-allowlist field', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: 'in',
        value: ['200', 'bogus'],
        error: 'value',
      };

      render(<FilterInput fields={[staticCodeField]} value={condition} />);

      expect(screen.getByText('Invalid value for Status code: bogus')).toBeInTheDocument();
    });

    it('renders a generic invalid-value error for dynamic (getSuggestions) field', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: 'in',
        value: ['bogus'],
        error: 'value',
      };

      render(<FilterInput fields={[dynamicCodeField]} value={condition} />);

      expect(screen.getByText('Invalid value for Status code')).toBeInTheDocument();
      // Must NOT include the specific value — the list is a hint, not an allowlist.
      expect(screen.queryByText('Invalid value for Status code: bogus')).not.toBeInTheDocument();
    });

    it('does not render any error for dynamic field without per-condition error flag', () => {
      // Consumer accepts arbitrary values (e.g. free-typed status code '429').
      // Without an `error: 'value'` marker set by the consumer, we expect no alert.
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: '=',
        value: '429',
      };

      render(<FilterInput fields={[dynamicCodeField]} value={condition} />);

      expect(screen.queryByText(/Invalid value for Status code/)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not call getSuggestions during initial render of a committed chip', () => {
      const spy = vi.fn(() => [{ value: 'only', label: 'Only' }]);
      const field: FieldMetadata = {
        name: 'code',
        label: 'Status code',
        type: 'integer',
        getSuggestions: spy,
      };
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: '=',
        value: '429',
      };

      render(<FilterInput fields={[field]} value={condition} />);

      // With no selected field + no open menu, the autocomplete pipeline should not
      // prefetch suggestions. This pins the "dynamic fields don't run on every render"
      // behavior — if anyone adds a blanket getFieldValues() call at FilterInput top level,
      // this test will fail.
      expect(spy).not.toHaveBeenCalled();
    });

    it('renders chip for dynamic field without attempting to validate value against static list', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'code',
        operator: '=',
        value: '429',
      };

      render(<FilterInput fields={[dynamicCodeField]} value={condition} />);

      // Chip renders with the free-typed value — validation does not flag it.
      expect(screen.getByText('Status code')).toBeInTheDocument();
      expect(screen.getByText('429')).toBeInTheDocument();
    });
  });

  describe('building chip segment clicks', () => {
    // Pin the UX where a user mid-build can revisit attribute/operator without
    // the chip committing as errored. Two same-type fields share operators so
    // the operator survives a filter switch; the date field has a disjoint
    // operator set so the operator is dropped instead.
    const fields: FieldMetadata[] = [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        values: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ],
      },
      {
        name: 'role',
        label: 'Role',
        type: 'enum',
        values: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ],
      },
      {
        name: 'createdAt',
        label: 'Created at',
        type: 'date',
      },
    ];

    const startBuildingThroughOperator = async (user: ReturnType<typeof userEvent.setup>) => {
      const input = screen.getByRole('combobox');
      await user.click(input);
      // findMenuitem widens timeout — Ark UI defers menu mount and CI flakes
      // intermittently on the default 1s.
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is =$/));
    };

    it('lets the user reopen the field menu by clicking the building chip attribute', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={fields} onChange={onChange} />);

      await startBuildingThroughOperator(user);

      // Building chip is rendered with attribute + operator. Clicking the
      // attribute segment must open the field menu without committing.
      const attributeSegment = screen.getByRole('button', { name: /Edit filter attribute/i });
      await user.click(attributeSegment);

      expect(screen.getByRole('menuitem', { name: 'Status' })).toBeInTheDocument();
      // No chip is committed — onChange remains untouched.
      expect(onChange).not.toHaveBeenCalled();
    });

    it('preserves the chosen operator when switching to a type-compatible filter', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={fields} />);

      await startBuildingThroughOperator(user);

      // Switch from Status to Role — both are enum/string-shaped, so the
      // previously chosen "is" operator must survive the switch.
      await user.click(await screen.findByRole('button', { name: /Edit filter attribute/i }));
      await user.click(await findMenuitem('Role'));

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-attribute"]')!.textContent).toBe('Role');
      expect(chip.querySelector('[data-slot="segment-operator"]')!.textContent).toBe('is');
    });

    it('drops an incompatible operator when switching to a different type filter', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={fields} />);

      // Start building with Status / "in" — `in` is not allowed for date fields,
      // so switching to Created at must drop the operator.
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is any of IN$/));

      await user.click(await screen.findByRole('button', { name: /Edit filter attribute/i }));
      await user.click(await findMenuitem('Created at'));

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-attribute"]')!.textContent).toBe('Created at');
      expect(chip.querySelector('[data-slot="segment-operator"]')).toBeNull();
    });

    it('escape from inline-edit on a building chip keeps the building state intact', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<FilterInput fields={fields} onChange={onChange} />);

      await startBuildingThroughOperator(user);

      await user.click(await screen.findByRole('button', { name: /Edit filter attribute/i }));
      await user.keyboard('{Escape}');

      // Building chip survives — attribute + operator still visible inside
      // the chip itself (menu menuitems may also contain "Status", so scope
      // the assertion to the chip).
      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip).toBeInTheDocument();
      expect(chip.querySelector('[data-slot="segment-attribute"]')!.textContent).toBe('Status');
      expect(chip.querySelector('[data-slot="segment-operator"]')!.textContent).toBe('is');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('commit only when fully built', () => {
    const fields: FieldMetadata[] = [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        values: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ],
      },
      { name: 'description', label: 'Description', type: 'string' },
    ];

    it('does not commit an incomplete building chip on blur', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <div>
          <FilterInput fields={fields} onChange={onChange} />
          <button type='button'>outside</button>
        </div>,
      );

      // Build only filter + operator (no value yet).
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is =$/));

      // Blur the whole FilterInput by clicking the outside button.
      await user.click(screen.getByRole('button', { name: 'outside' }));

      // Building chip survives — attribute + operator visible, no onChange.
      // waitFor — the blur path runs through useBlurCommit + resetState
      // asynchronously; under jsdom load the chip rerender lands a tick later.
      await waitFor(() => {
        const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
        expect(chip).not.toBeNull();
        expect(chip!.querySelector('[data-slot="segment-attribute"]')!.textContent).toBe('Status');
        expect(chip!.querySelector('[data-slot="segment-operator"]')!.textContent).toBe('is');
        // Chip is still in `building` state — no value segment.
        expect(chip!.querySelector('[data-slot="segment-value"]')).toBeNull();
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('auto-commits when the third (value) segment is chosen', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={fields} onChange={onChange} />);

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is =$/));
      await user.click(await findMenuitem(/^Active$/));

      // Single condition committed — onChange called with that condition.
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls.at(-1)![0];
      expect(lastCall).toMatchObject({
        type: 'condition',
        field: 'status',
        operator: '=',
        value: 'active',
      });
    });

    it('reopens the value menu (not field) when focus returns to an incomplete building chip', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <FilterInput fields={fields} />
          <button type='button'>outside</button>
        </div>,
      );

      // Build attribute + operator, leaving the value missing.
      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is =$/));

      // Blur out, then return focus to the FilterInput's input. The
      // intermediate menu close races with React focus state on slower
      // environments (CI), so use a longer timeout on the assertion below.
      await user.click(screen.getByRole('button', { name: 'outside' }));
      await user.click(screen.getByRole('combobox'));

      // The value menu must be the one that reopens — confirmed by the
      // presence of value items ("Active") from the enum field. The field
      // menu would surface a "Status" menuitem instead.
      expect(await findMenuitem(/^Active$/)).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Status' })).toBeNull();
    });

    it('renders a value placeholder for no-value operator chips', () => {
      // Pre-committed no-value chip (consumer-provided value) — chip must
      // visually show three segments with the value slot filled by "—".
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: 'is_null', value: null }}
        />,
      );

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-attribute"]')!.textContent).toBe('Status');
      expect(chip.querySelector('[data-slot="segment-operator"]')!.textContent).toBe('is not set');
      expect(chip.querySelector('[data-slot="segment-value"]')!.textContent).toBe('—');
    });
  });

  describe('Backspace cascade in chip segments', () => {
    // Pins the cascading-Backspace UX:
    //   1) Empty inline-edit + Backspace walks one segment to the left
    //      (value → operator → attribute), erasing the source segment's
    //      data so it does not re-appear on the next render.
    //   2) Once the cascade reaches an empty attribute (op/value already
    //      cleared) the chip is removed entirely.
    //   3) From the main input during building, the same Backspace lands
    //      the user in inline-edit of the previous segment with its text
    //      pre-selected — so a single Backspace wipes the segment.
    const fields: FieldMetadata[] = [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        values: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ],
      },
    ];

    // Segment.tsx uses double-rAF to focus its input on enter-edit; userEvent
    // does not block on those rAFs between events, so in tests we drive the
    // segment input directly. fireEvent.change empties it (the browser would
    // do this via select-all + Backspace), then a keyDown triggers the
    // empty-segment cascade. This keeps the assertions on the real handler
    // chain without depending on real-time rAF callbacks.
    const pressBackspaceOn = (el: HTMLElement) => {
      (el as HTMLInputElement).focus();
      fireEvent.keyDown(el, { key: 'Backspace', code: 'Backspace' });
    };
    const clearSegment = (label: string) => {
      const segInput = screen.getByLabelText(label) as HTMLInputElement;
      fireEvent.change(segInput, { target: { value: '' } });
      pressBackspaceOn(segInput);
    };

    it('cascades from value inline-edit to operator on empty Backspace and clears the value', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter value/i }));
      clearSegment('Filter value');

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      // Operator is now in inline-edit (its <input> is rendered).
      expect(chip.querySelector('[data-slot="segment-operator"] input')).not.toBeNull();
      // Value segment is gone — the chip data was cleared on cascade so it
      // does not re-render its previous committed text.
      expect(chip.querySelector('[data-slot="segment-value"]')).toBeNull();
    });

    it('removes the chip when the cascade reaches an empty attribute', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter value/i }));
      clearSegment('Filter value');
      clearSegment('Filter operator');
      clearSegment('Filter attribute');

      expect(container.querySelector('[data-slot="filter-input-condition-chip"]')).toBeNull();
    });

    it('preserves the value when the cascade walks from operator inline-edit to attribute', async () => {
      // Cascading off the operator segment only clears the operator — the
      // user did not touch the value, so it stays committed (renders as a
      // sole-value chip in this in-between state).
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter operator/i }));
      clearSegment('Filter operator');

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      // Attribute is now in inline-edit (its <input> is rendered).
      expect(chip.querySelector('[data-slot="segment-attribute"] input')).not.toBeNull();
      // Operator is gone — its data was cleared on cascade.
      expect(chip.querySelector('[data-slot="segment-operator"]')).toBeNull();
      // Value survives — the user did not delete it.
      expect(chip.querySelector('[data-slot="segment-value"]')?.textContent).toBe('Active');
    });

    it('does not remove the chip when Backspace empties attribute while operator and value are still present', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter attribute/i }));
      clearSegment('Filter attribute');

      // Operator/value still committed — cascade off attribute is suppressed.
      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
      expect(chip).not.toBeNull();
    });

    it('keeps inline-edit alive when a field is selected after the chip was cascaded clear', async () => {
      // After cascading through all segments the committed chip has no
      // operator/value; selecting a field must NOT commit it as
      // attribute-only — it should transition to operator selection so the
      // user can finish building.
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter value/i }));
      clearSegment('Filter value');
      clearSegment('Filter operator');

      // Attribute is now in inline-edit and field menu is open. Pick "Status".
      await user.click(await findMenuitem('Status'));

      // The operator menu must open — confirmed by the operator menuitem.
      expect(await findMenuitem(/^is =$/)).toBeInTheDocument();
    });

    it('steps back from the value menu into operator inline-edit when main-input Backspace fires on empty input', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={fields} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is =$/));

      // After picking operator the live combobox is the ChipSearchInput
      // inside the building chip — the original FilterInputSearch is
      // unmounted. Re-query so we drive a node still in the React tree.
      pressBackspaceOn(screen.getByRole('combobox'));

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-operator"] input')).not.toBeNull();
    });

    it('steps back from the operator menu into attribute inline-edit when main-input Backspace fires on empty input', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={fields} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Status'));

      pressBackspaceOn(screen.getByRole('combobox'));

      // waitFor — the cascade triggers a chain of state updates and React
      // renders that don't all flush synchronously under jsdom load.
      await waitFor(() => {
        const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
        expect(chip.querySelector('[data-slot="segment-attribute"] input')).not.toBeNull();
      });
    });

    it('removes the building chip when the attribute is wiped via the step-back-into-edit cascade', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={fields} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Status'));
      pressBackspaceOn(screen.getByRole('combobox'));
      // Wait for the step-back to land in attribute inline-edit before clearing
      // it — without this clearSegment runs against the wrong segment under
      // jsdom load.
      await waitFor(() => {
        expect(screen.getByLabelText('Filter attribute')).toBeInTheDocument();
      });
      clearSegment('Filter attribute');

      await waitFor(() => {
        expect(container.querySelector('[data-slot="filter-input-condition-chip"]')).toBeNull();
      });
    });
  });

  describe('ArrowDown + Enter selects highlighted menu item from emptied segment', () => {
    // After clearing a segment's text via Backspace the dropdown re-opens
    // (filtered to all items). Arrow-navigating and pressing Enter must
    // commit the highlighted item — without this guard Enter would fall
    // through to the segment's onKeyDown and try to commit the empty
    // typed text, stranding the user mid-flow.
    const fields: FieldMetadata[] = [
      {
        name: 'status',
        label: 'Status',
        type: 'enum',
        values: [
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ],
      },
      {
        name: 'role',
        label: 'Role',
        type: 'enum',
        values: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ],
      },
    ];

    it('selects highlighted field after emptying the attribute segment', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter attribute/i }));
      const segInput = screen.getByLabelText('Filter attribute') as HTMLInputElement;
      fireEvent.change(segInput, { target: { value: '' } });

      // Two ArrowDowns — first highlights "Status" (already selected), second
      // moves to "Role". Picking Role lets us assert the segment actually
      // committed via Enter rather than just staying on the original value.
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-attribute"]')!.textContent).toBe('Role');
    });

    it('selects highlighted operator after emptying the operator segment', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter operator/i }));
      const segInput = screen.getByLabelText('Filter operator') as HTMLInputElement;
      fireEvent.change(segInput, { target: { value: '' } });

      // Two ArrowDowns to land on the *second* operator (`is not`) so the
      // assertion can distinguish a real Enter-commit from a no-op that
      // would have left the original `=` (`is`) in place.
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-operator"]')!.textContent).toBe('is not');
    });

    it('selects highlighted value after emptying the value segment', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterInput
          fields={fields}
          value={{ type: 'condition', field: 'status', operator: '=', value: 'active' }}
        />,
      );

      await user.click(screen.getByRole('button', { name: /Edit filter value/i }));
      const segInput = screen.getByLabelText('Filter value') as HTMLInputElement;
      fireEvent.change(segInput, { target: { value: '' } });

      // Two ArrowDowns to land on `Pending` (the non-default value) so the
      // assertion proves Enter actually committed rather than leaving the
      // original `active` (`Active`) untouched.
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-value"]')!.textContent).toBe('Pending');
    });
  });

  // The `error` flag lives on the Condition. A consumer that round-trips the
  // expression through a domain shape without an `error` slot (e.g. a backend
  // query type) drops it; FilterInput must re-derive value errors on sync so
  // they survive the round-trip and surface for values from any source.
  describe('value error re-derivation on sync (AS-1085)', () => {
    it('renders an invalid-value error for a static field loaded with an out-of-allowlist value', () => {
      // No `error` flag on the incoming condition — must be derived.
      const condition: Condition = {
        type: 'condition',
        field: 'priority',
        operator: '=',
        value: 'active', // not in priority values (Low=1, Medium=5)
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      expect(screen.getByText(/Invalid value for Priority/i)).toBeInTheDocument();
    });

    it('shows the error after changing a chip field even when the consumer drops the error flag', async () => {
      const user = userEvent.setup();

      // Mimics my's converters: strip `error` on every round-trip.
      const stripError = (node: ExprNode | null): ExprNode | null => {
        if (!node) return null;
        if (node.type === 'condition') {
          const next = { ...node };
          delete next.error;
          return next;
        }
        return {
          ...node,
          children: node.children.map(stripError).filter((c): c is ExprNode => c !== null),
        };
      };

      const Wrapper = () => {
        const [value, setValue] = useState<ExprNode | null>({
          type: 'condition',
          field: 'status',
          operator: '=',
          value: 'active',
        });
        return (
          <FilterInput
            fields={sampleFields}
            value={value}
            onChange={next => setValue(stripError(next))}
          />
        );
      };

      render(<Wrapper />);

      await user.click(await screen.findByRole('button', { name: /Edit filter attribute/i }));
      await screen.findByRole('menuitem', { name: 'Priority' }, { timeout: 10000 });
      await user.click(screen.getByRole('menuitem', { name: 'Priority' }));

      expect(await screen.findByText(/Invalid value for Priority/i)).toBeInTheDocument();
    });

    it('does not flag a value that is valid for the new field', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'priority',
        operator: '=',
        value: 5, // Medium — valid
      };

      render(<FilterInput fields={sampleFields} value={condition} />);

      expect(screen.queryByText(/Invalid value/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('flags a type-mismatched value on a freeform field (no allowlist)', () => {
      // A string value carried into an integer field — e.g. after a field change.
      const portField: FieldMetadata = { name: 'port', label: 'Port', type: 'integer' };
      const condition: Condition = {
        type: 'condition',
        field: 'port',
        operator: '=',
        value: 'active',
      };

      render(<FilterInput fields={[portField]} value={condition} />);

      expect(screen.getByText(/Invalid value for Port/i)).toBeInTheDocument();
    });

    it('shows the borrowed label (not the raw value) for the selected item in the value menu', async () => {
      const user = userEvent.setup();
      const labelFields: FieldMetadata[] = [
        {
          name: 'attack_subtype',
          label: 'Attack Subtype',
          type: 'enum',
          operators: ['in'],
          values: [{ value: 'xss', label: 'XSS' }],
        },
        {
          name: 'legacy',
          label: 'Legacy',
          type: 'enum',
          values: [{ value: '__none__', label: 'None' }],
        },
      ];
      // '__none__' is invalid for attack_subtype but Legacy labels it "None".
      const condition: Condition = {
        type: 'condition',
        field: 'attack_subtype',
        operator: 'in',
        value: ['__none__'],
        error: 'value',
      };

      render(<FilterInput fields={labelFields} value={condition} />);

      await user.click(await screen.findByRole('button', { name: /Edit filter value/i }));

      expect(
        await screen.findByRole('menuitem', { name: /None/i }, { timeout: 10000 }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: '__none__' })).toBeNull();
    });
  });

  describe('AS-1134: Enter commits free text on suggestions-only fields', () => {
    const suggestionFields: FieldMetadata[] = [
      {
        name: 'host',
        label: 'Host',
        type: 'string',
        options: ['a.example.com'],
        strictValues: false,
      },
    ];

    it('commits a typed value missing from options when strictValues is false', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={suggestionFields} onChange={onChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Host'));
      await user.click(await findMenuitem(/^is =$/));
      await user.keyboard('my-free-host.example.com{Enter}');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'condition',
            field: 'host',
            operator: '=',
            value: 'my-free-host.example.com',
          }),
        );
      });
    });

    it('does not commit free text on a strict-allowlist field', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<FilterInput fields={sampleFields} onChange={onChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Status'));
      await user.click(await findMenuitem(/^is =$/));
      await user.keyboard('archived{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('paired field build cascade (AS-1160)', () => {
    const pairedValueField: FieldMetadata = {
      name: 'ctx_value',
      label: 'Value',
      type: 'enum',
      values: [{ value: 'yyy', label: 'yyy' }],
    };
    const pairedFields: FieldMetadata[] = [
      {
        name: 'ctx_param',
        label: 'Context Param',
        type: 'enum',
        values: [{ value: 'xxx', label: 'xxx' }],
        pairedField: pairedValueField,
      },
    ];

    it('reveals the second triplet as one building chip after the first value', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={pairedFields} />);

      const input = screen.getByRole('combobox');
      await user.click(input);

      // Side 0: field → operator → value.
      await user.click(await findMenuitem('Context Param'));
      await user.click(await findMenuitem(/^is =$/));
      await user.click(await findMenuitem(/^xxx$/));

      // The cascade advances into the paired second triplet: the SAME (building)
      // chip now shows the first value, the paired attribute, and a ; separator —
      // not a separate second chip.
      await waitFor(() => {
        const chip = container.querySelector('[data-building]');
        expect(chip).not.toBeNull();
        expect(chip!.querySelector('[data-slot="segment-separator"]')).not.toBeNull();
      });
      const buildingChip = container.querySelector('[data-building]')!;
      expect(
        [...buildingChip.querySelectorAll('[data-slot="segment-attribute"]')].map(
          n => n.textContent,
        ),
      ).toEqual(['Context Param', 'Value']);
      expect(buildingChip.querySelector('[data-slot="segment-value"]')!.textContent).toBe('xxx');
      // The operator menu for the paired field is open (side 1 in progress).
      expect(await findMenuitem(/^is =$/)).toBeInTheDocument();
    });

    it('enters inline edit on the paired value segment when clicked', async () => {
      const user = userEvent.setup();
      const condition: Condition = {
        type: 'condition',
        field: 'ctx_param',
        operator: '=',
        value: 'xxx',
        pair: { operator: '=', value: 'yyy' },
      };
      render(<FilterInput fields={pairedFields} value={condition} />);

      await user.click(screen.getByText('yyy'));

      // The paired value segment becomes an inline input seeded with its value;
      // the base value stays display text.
      const valueInput = await screen.findByLabelText('Filter value');
      expect(valueInput).toHaveValue('yyy');
      expect(screen.getByText('xxx')).toBeInTheDocument();
    });

    it('renders a committed paired condition as one chip with both triplets', () => {
      const condition: Condition = {
        type: 'condition',
        field: 'ctx_param',
        operator: '=',
        value: 'xxx',
        pair: { operator: '=', value: 'yyy' },
      };
      const { container } = render(<FilterInput fields={pairedFields} value={condition} />);
      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(
        [...chip.querySelectorAll('[data-slot="segment-attribute"]')].map(n => n.textContent),
      ).toEqual(['Context Param', 'Value']);
      expect(
        [...chip.querySelectorAll('[data-slot="segment-value"]')].map(n => n.textContent),
      ).toEqual(['xxx', 'yyy']);
      expect(chip.querySelector('[data-slot="segment-separator"]')).not.toBeNull();
    });

    it('completes a paired chip when the Value operator is "is set" (no second value)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const setValueFields: FieldMetadata[] = [
        {
          name: 'ctx_param',
          label: 'Context Param',
          type: 'enum',
          values: [{ value: 'xxx', label: 'xxx' }],
          operators: ['=', '!='],
          pairedField: {
            name: 'ctx_value',
            label: 'Value',
            type: 'string',
            operators: ['=', '!=', 'is_null', 'is_not_null'],
          },
        },
      ];
      const { container } = render(<FilterInput fields={setValueFields} onChange={onChange} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Context Param'));
      await user.click(await findMenuitem(/^is =$/));
      await user.click(await findMenuitem(/^xxx$/));
      // Side 1 operator menu is open — choose "is set", which takes no value.
      await user.click(await findMenuitem(/^is set != null$/));

      // One committed chip carrying both triplets; the second has no value segment.
      await waitFor(() => {
        const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
        expect(chip).not.toBeNull();
        expect(chip!.querySelector('[data-slot="segment-separator"]')).not.toBeNull();
      });
      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(
        [...chip.querySelectorAll('[data-slot="segment-attribute"]')].map(n => n.textContent),
      ).toEqual(['Context Param', 'Value']);
      // Emits one paired condition: ctx_param = xxx AND ctx_value is_not_null
      // ("is set" maps to is_not_null).
      expect(onChange.mock.calls.at(-1)?.[0]).toEqual({
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'ctx_param', operator: '=', value: 'xxx' },
          { type: 'condition', field: 'ctx_value', operator: 'is_not_null', value: null },
        ],
      });
    });

    it('reopens the operator menu in place for an attribute-only chip without removing it (AS-1179)', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={pairedFields} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Context Param'));
      // Operator menu is open; force-commit before choosing one → attribute-only chip.
      fireEvent.click(container.querySelector('[data-filter-input-inner]')!);
      await waitFor(() => {
        expect(container.querySelector('[data-slot="filter-input-condition-chip"]')).not.toBeNull();
      });

      // Re-clicking "continues" the condition: the operator dropdown reopens and
      // the chip is edited in place — it must NOT be deleted.
      await user.click(container.querySelector('[data-slot="segment-attribute"]')!);
      expect(await findMenuitem(/^is =$/)).toBeInTheDocument();
      expect(container.querySelector('[data-slot="filter-input-condition-chip"]')).not.toBeNull();
    });

    it('resumes the value menu when an incomplete base chip is re-clicked (AS-1179)', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={pairedFields} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Context Param'));
      await user.click(await findMenuitem(/^is =$/));

      // Leave the base value empty, then force-commit with an area click.
      fireEvent.click(container.querySelector('[data-filter-input-inner]')!);
      await waitFor(() => {
        expect(container.querySelector('[data-slot="filter-input-condition-chip"]')).not.toBeNull();
      });

      // Re-clicking the incomplete chip must reopen the base VALUE menu (xxx),
      // not the operator/field menu.
      await user.click(container.querySelector('[data-slot="segment-operator"]')!);
      expect(await findMenuitem(/^xxx$/)).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Context Param' })).toBeNull();
    });

    it('keeps the base triplet when force-committed mid-pair and stays editable (AS-1179)', async () => {
      const user = userEvent.setup();
      const { container } = render(<FilterInput fields={pairedFields} />);

      await user.click(screen.getByRole('combobox'));
      await user.click(await findMenuitem('Context Param'));
      await user.click(await findMenuitem(/^is =$/));
      await user.click(await findMenuitem(/^xxx$/));
      // Paired operator menu is open — pick the operator, leaving its value empty.
      await user.click(await findMenuitem(/^is =$/));

      // Force-commit with an area click while building the paired second value.
      fireEvent.click(container.querySelector('[data-filter-input-inner]')!);

      // The base triplet must survive (not collapse to a broken `ctx_value`
      // standalone chip): one chip carrying both attributes and the base value.
      await waitFor(() => {
        const chip = container.querySelector('[data-slot="filter-input-condition-chip"]');
        expect(chip).not.toBeNull();
        expect(
          [...chip!.querySelectorAll('[data-slot="segment-attribute"]')].map(n => n.textContent),
        ).toEqual(['Context Param', 'Value']);
      });
      const chip = container.querySelector('[data-slot="filter-input-condition-chip"]')!;
      expect(chip.querySelector('[data-slot="segment-value"]')!.textContent).toBe('xxx');

      // Re-clicking the paired operator resumes the paired VALUE menu (yyy).
      const operators = chip.querySelectorAll('[data-slot="segment-operator"]');
      await user.click(operators[operators.length - 1]!);
      expect(await findMenuitem(/^yyy$/)).toBeInTheDocument();
    });
  });
});
