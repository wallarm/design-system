import { Time } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditTime } from './InlineEditTime';

function Harness() {
  return (
    <InlineEdit defaultValue={new Time(14, 30)} defaultEdit data-testid='ie'>
      <InlineEditControl>
        <InlineEditTime />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditTime', () => {
  it('renders the time input with the shared input testId slot', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('registers the blur submit mode', () => {
    function ModeProbe() {
      const { submitMode } = useInlineEdit();
      return <span data-testid='mode'>{submitMode}</span>;
    }
    render(
      <InlineEdit defaultValue={new Time(14, 30)} defaultEdit submitMode='both' data-testid='ie'>
        <InlineEditControl>
          <InlineEditTime />
          <ModeProbe />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('blur');
  });
});
