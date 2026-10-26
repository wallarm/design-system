import { createRef } from 'react';

import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';

import { Country } from './Country';
import { CountryName } from './CountryName';

describe('CountryName', () => {
  it('forwards native props, classes and ref to the visible country name', () => {
    const ref = createRef<HTMLSpanElement>();
    const onClick = rs.fn();
    render(
      <Country code='US' data-testid='country'>
        <CountryName
          ref={ref}
          id='country-label'
          className='consumer-name'
          aria-label='Selected country'
          data-analytics-id='COUNTRY_NAME'
          onClick={onClick}
        />
      </Country>,
    );

    const label = screen.getByTestId('country--name');
    expect(label).toHaveAttribute('id', 'country-label');
    expect(label).toHaveClass('consumer-name', 'truncate');
    expect(label).toHaveAttribute('aria-label', 'Selected country');
    expect(label).toHaveAttribute('data-analytics-id', 'COUNTRY_NAME');
    expect(ref.current).toBe(label);
    expect(label.tagName).toBe('SPAN');
    fireEvent.click(label);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('allows a consumer test id to override the inherited one', () => {
    render(
      <Country code='US' data-testid='country'>
        <CountryName data-testid='chosen-country' />
      </Country>,
    );
    expect(screen.getByTestId('chosen-country')).toHaveTextContent('United States');
  });
});
