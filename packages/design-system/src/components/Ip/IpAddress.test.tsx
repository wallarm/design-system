import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { Ip } from './Ip';
import { IpAddress } from './IpAddress';

describe('IpAddress', () => {
  it('merges consumer classes onto the visible address', () => {
    render(
      <Ip data-testid='ip'>
        <IpAddress className='consumer-address'>192.0.2.1</IpAddress>
      </Ip>,
    );
    expect(screen.getByTestId('ip--address')).toHaveClass('consumer-address', 'truncate');
  });
});
