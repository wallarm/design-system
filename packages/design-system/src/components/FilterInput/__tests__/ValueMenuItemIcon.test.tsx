import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { AgentGlyph } from '../../AgentGlyph';
import { DropdownMenu, DropdownMenuContent } from '../../DropdownMenu';
import { NestedValueMenuItem } from '../FilterInputMenu/FilterInputValueMenu/NestedValueMenuItem';
import { ValueMenuItem } from '../FilterInputMenu/FilterInputValueMenu/ValueMenuItem';

const icon = <AgentGlyph agent='radar' size={16} data-testid='radar-glyph' />;

describe('value option icon', () => {
  it('renders the icon before the label in a flat value row', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <ValueMenuItem
            option={{ value: 'radar', label: 'Radar', icon }}
            isChecked={false}
            isPending={false}
            multiSelect={false}
            onSelect={rs.fn()}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const glyph = await screen.findByTestId('radar-glyph');
    const label = screen.getByText('Radar');
    expect(glyph.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the icon in a nested value row', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <NestedValueMenuItem
            id='radar'
            option={{ value: 'radar', label: 'Radar', icon }}
            isGroup={false}
            checkedState={false}
            isPending={false}
            multiSelect={false}
            onSelect={rs.fn()}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(await screen.findByTestId('radar-glyph')).toBeInTheDocument();
  });

  it('renders no icon wrapper when the option has none', async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuContent>
          <ValueMenuItem
            option={{ value: 'get', label: 'GET' }}
            isChecked={false}
            isPending={false}
            multiSelect={false}
            onSelect={rs.fn()}
          />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const row = (await screen.findByText('GET')).closest('[role="menuitem"]');
    expect(row?.firstElementChild?.tagName).toBe('DIV');
  });
});
