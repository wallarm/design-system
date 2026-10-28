import { expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NavPanel } from './NavPanel';

it('names the navigation resize control and changes its width from the keyboard within bounds', async () => {
  const user = userEvent.setup();
  render(<NavPanel resizable />);
  const handle = screen.getByRole('separator', { name: 'Resize navigation panel' });
  const panel = screen.getByRole('complementary', { name: 'Product navigation' });

  await user.tab();
  expect(handle).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(panel).toHaveStyle({ width: '226px' });
  expect(handle).toHaveAttribute('aria-valuenow', '226');
  await user.keyboard('{ArrowLeft}');
  expect(panel).toHaveStyle({ width: '216px' });
  await user.keyboard('{Home}{ArrowLeft}');
  expect(panel).toHaveStyle({ width: '164px' });
  await user.keyboard('{End}{ArrowRight}');
  expect(panel).toHaveStyle({ width: '256px' });
});
