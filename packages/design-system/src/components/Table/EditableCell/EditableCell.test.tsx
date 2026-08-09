import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../../testUtils/captureAnalyticsClicks';
import { EditableSelectCell } from './EditableSelectCell';
import { EditableTextCell } from './EditableTextCell';

const statusItems = [
  { label: 'Blocked', value: 'Blocked' },
  { label: 'Monitoring', value: 'Monitoring' },
];

describe('EditableTextCell', () => {
  describe('Interactions', () => {
    it('enters edit mode on click and focuses the input', async () => {
      render(<EditableTextCell value='hello' onCommit={vi.fn()} aria-label='Name' />);

      await userEvent.click(screen.getByRole('button'));

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
      expect(input).toHaveValue('hello');
    });

    it('commits the new value on Enter', async () => {
      const onCommit = vi.fn();
      render(<EditableTextCell value='hello' onCommit={onCommit} aria-label='Name' />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{Control>}a{/Control}world{Enter}');

      expect(onCommit).toHaveBeenCalledExactlyOnceWith('world');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('commits on blur', async () => {
      const onCommit = vi.fn();
      render(<EditableTextCell value='hello' onCommit={onCommit} aria-label='Name' />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{Control>}a{/Control}world');
      await userEvent.tab();

      expect(onCommit).toHaveBeenCalledExactlyOnceWith('world');
    });

    it('reverts on Escape without committing', async () => {
      const onCommit = vi.fn();
      render(<EditableTextCell value='hello' onCommit={onCommit} aria-label='Name' />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{Control>}a{/Control}world{Escape}');

      expect(onCommit).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).toHaveTextContent('hello');
    });

    it('does not fire onCommit when the value is unchanged', async () => {
      const onCommit = vi.fn();
      render(<EditableTextCell value='hello' onCommit={onCommit} aria-label='Name' />);

      await userEvent.click(screen.getByRole('button'));
      await userEvent.keyboard('{Enter}');

      expect(onCommit).not.toHaveBeenCalled();
    });
  });

  describe('Attribute pass-through', () => {
    it('forwards data-analytics-id + props to the cell in read mode', () => {
      render(
        <EditableTextCell
          value='hello'
          onCommit={vi.fn()}
          aria-label='Name'
          data-testid='cell'
          data-analytics-id='EDIT_NAME'
          data-analytics-props='{"field":"name"}'
        />,
      );

      const cell = screen.getByTestId('cell');
      expect(cell).toHaveAttribute('data-analytics-id', 'EDIT_NAME');
      expect(cell).toHaveAttribute('data-analytics-props', '{"field":"name"}');
    });

    it('keeps data-analytics-id resolvable via closest() while editing', async () => {
      const captured = captureAnalyticsClicks();
      render(
        <EditableTextCell
          value='hello'
          onCommit={vi.fn()}
          aria-label='Name'
          data-testid='cell'
          data-analytics-id='EDIT_NAME'
        />,
      );

      // Click to edit, then click the input — the id resolves through the
      // persistent cell ancestor in both states.
      await userEvent.click(screen.getByRole('button'));
      await userEvent.click(screen.getByRole('textbox'));

      expect(captured).toHaveBeenLastCalledWith('EDIT_NAME');
    });

    it('composes a consumer onClick with the enter-edit behaviour', async () => {
      const onClick = vi.fn();
      render(
        <EditableTextCell value='hello' onCommit={vi.fn()} aria-label='Name' onClick={onClick} />,
      );

      await userEvent.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledOnce();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('derives a --input testid for the editor', async () => {
      render(
        <EditableTextCell value='hello' onCommit={vi.fn()} aria-label='Name' data-testid='cell' />,
      );

      await userEvent.click(screen.getByRole('button'));

      expect(screen.getByTestId('cell--input')).toBe(screen.getByRole('textbox'));
    });
  });
});

describe('EditableSelectCell', () => {
  describe('Empty state', () => {
    it('renders the default placeholder when nothing is selected', () => {
      render(
        <EditableSelectCell value={null} items={statusItems} onCommit={vi.fn()}>
          unused
        </EditableSelectCell>,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Select…');
    });

    it('renders a custom placeholder set from outside', () => {
      render(
        <EditableSelectCell value='' items={statusItems} onCommit={vi.fn()} placeholder='Pick one'>
          unused
        </EditableSelectCell>,
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Pick one');
    });

    it('renders children (not the placeholder) once a value is set', () => {
      render(
        <EditableSelectCell value='Blocked' items={statusItems} onCommit={vi.fn()}>
          Blocked badge
        </EditableSelectCell>,
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Blocked badge');
      expect(trigger).not.toHaveTextContent('Select…');
    });
  });

  describe('Interactions', () => {
    it('commits the picked option', async () => {
      const onCommit = vi.fn();
      render(
        <EditableSelectCell value='Blocked' items={statusItems} onCommit={onCommit}>
          Blocked
        </EditableSelectCell>,
      );

      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByRole('option', { name: 'Monitoring' }));

      expect(onCommit).toHaveBeenCalledExactlyOnceWith('Monitoring');
    });
  });

  describe('Attribute pass-through', () => {
    it('forwards data-analytics-id to the trigger (the real interactive node)', () => {
      render(
        <EditableSelectCell
          value='Blocked'
          items={statusItems}
          onCommit={vi.fn()}
          data-analytics-id='EDIT_STATUS'
        >
          Blocked
        </EditableSelectCell>,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('data-analytics-id', 'EDIT_STATUS');
    });
  });
});
