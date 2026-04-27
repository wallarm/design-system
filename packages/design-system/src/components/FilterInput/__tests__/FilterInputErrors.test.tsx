import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FilterInputErrors } from '../FilterInputErrors/FilterInputErrors';

describe('FilterInputErrors — AS-882 hydration shape', () => {
  it('renders nothing when there are no errors', () => {
    const { container } = render(<FilterInputErrors errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a <ul> with one <li> per error', () => {
    const { container } = render(
      <FilterInputErrors errors={['First problem', 'Second problem']} />,
    );
    const ul = container.querySelector('ul');
    expect(ul).not.toBeNull();
    expect(ul!.querySelectorAll('li')).toHaveLength(2);
    expect(ul!.textContent).toContain('First problem');
    expect(ul!.textContent).toContain('Second problem');
  });

  it('does NOT nest the <ul> inside a <p> (would break hydration)', () => {
    const { container } = render(<FilterInputErrors errors={['Boom']} />);
    const ulInsideParagraph = container.querySelector('p ul');
    expect(ulInsideParagraph).toBeNull();
  });

  it('uses singular wording for one issue', () => {
    const { container } = render(<FilterInputErrors errors={['Only one']} />);
    expect(container.textContent).toContain('Filter contains 1 issue:');
  });

  it('uses plural wording for multiple issues', () => {
    const { container } = render(<FilterInputErrors errors={['One', 'Two', 'Three']} />);
    expect(container.textContent).toContain('Filter contains 3 issues:');
  });
});
