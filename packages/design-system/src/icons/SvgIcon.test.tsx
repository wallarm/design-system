import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SvgIcon } from './SvgIcon';

describe('SvgIcon', () => {
  describe('Decorative mode (no title)', () => {
    it('renders with aria-hidden="true" when no title is provided', () => {
      render(
        <SvgIcon data-testid='decorative-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('decorative-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('does not have role="img" when no title is provided', () => {
      render(
        <SvgIcon data-testid='decorative-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('decorative-icon');
      expect(icon).not.toHaveAttribute('role', 'img');
    });

    it('does not render a title element when no title prop is provided', () => {
      render(
        <SvgIcon data-testid='decorative-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('decorative-icon');
      const titleElement = icon.querySelector('title');
      expect(titleElement).toBeNull();
    });
  });

  describe('Accessible mode (with title)', () => {
    it('renders with role="img" when title is provided', () => {
      render(
        <SvgIcon title='Activity Icon' data-testid='accessible-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('accessible-icon');
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('renders a title element with the provided title text', () => {
      render(
        <SvgIcon title='Activity Icon' data-testid='accessible-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('accessible-icon');
      const titleElement = icon.querySelector('title');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent('Activity Icon');
    });

    it('does not have aria-hidden when title is provided', () => {
      render(
        <SvgIcon title='Activity Icon' data-testid='accessible-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('accessible-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('Size variants', () => {
    it('applies the inherit size class by default', () => {
      render(
        <SvgIcon data-testid='icon-default'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-default');
      expect(icon).toHaveClass('icon-inherit');
    });

    it('applies the xs size class when size="xs"', () => {
      render(
        <SvgIcon size='xs' data-testid='icon-xs'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-xs');
      expect(icon).toHaveClass('icon-xs');
    });

    it('applies the sm size class when size="sm"', () => {
      render(
        <SvgIcon size='sm' data-testid='icon-sm'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-sm');
      expect(icon).toHaveClass('icon-sm');
    });

    it('applies the md size class when size="md"', () => {
      render(
        <SvgIcon size='md' data-testid='icon-md'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-md');
      expect(icon).toHaveClass('icon-md');
    });

    it('applies the lg size class when size="lg"', () => {
      render(
        <SvgIcon size='lg' data-testid='icon-lg'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-lg');
      expect(icon).toHaveClass('icon-lg');
    });

    it('applies the xl size class when size="xl"', () => {
      render(
        <SvgIcon size='xl' data-testid='icon-xl'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-xl');
      expect(icon).toHaveClass('icon-xl');
    });

    it('applies the 2xl size class when size="2xl"', () => {
      render(
        <SvgIcon size='2xl' data-testid='icon-2xl'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-2xl');
      expect(icon).toHaveClass('icon-2xl');
    });
  });

  describe('Attribute pass-through', () => {
    it('passes through data-* attributes to the svg element', () => {
      render(
        <SvgIcon data-testid='icon-with-data' data-custom='custom-value'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-with-data');
      expect(icon).toHaveAttribute('data-custom', 'custom-value');
    });

    it('passes through multiple data-* attributes', () => {
      render(
        <SvgIcon
          data-testid='icon-multi-data'
          data-analytics-id='ICON_ACTIVITY'
          data-custom-prop='test-value'
        >
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-multi-data');
      expect(icon).toHaveAttribute('data-analytics-id', 'ICON_ACTIVITY');
      expect(icon).toHaveAttribute('data-custom-prop', 'test-value');
    });

    it('passes through aria-* attributes to the svg element', () => {
      render(
        <SvgIcon data-testid='icon-with-aria' aria-label='Custom label'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-with-aria');
      expect(icon).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('Core SVG behavior', () => {
    it('renders as an svg element with correct namespace', () => {
      render(
        <SvgIcon data-testid='svg-element'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('svg-element');
      expect(icon.tagName).toBe('svg');
      expect(icon).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('renders with focusable="false"', () => {
      render(
        <SvgIcon data-testid='unfocusable-icon'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('unfocusable-icon');
      expect(icon).toHaveAttribute('focusable', 'false');
    });

    it('accepts and renders children elements', () => {
      render(
        <SvgIcon data-testid='icon-with-children'>
          <circle cx='12' cy='12' r='10' />
          <rect x='5' y='5' width='14' height='14' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-with-children');
      expect(icon.querySelector('circle')).toBeInTheDocument();
      expect(icon.querySelector('rect')).toBeInTheDocument();
    });

    it('supports custom className that merges with size classes', () => {
      render(
        <SvgIcon size='md' className='custom-class' data-testid='icon-custom-class'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      const icon = screen.getByTestId('icon-custom-class');
      expect(icon).toHaveClass('icon-md', 'custom-class');
    });
  });

  describe('Ref forwarding', () => {
    it('forwards ref to the svg element', () => {
      const ref = { current: null as SVGSVGElement | null };

      render(
        <SvgIcon ref={ref} data-testid='icon-with-ref'>
          <circle cx='12' cy='12' r='10' />
        </SvgIcon>,
      );

      expect(ref.current).toBeInstanceOf(SVGSVGElement);
      expect(ref.current).toHaveAttribute('data-testid', 'icon-with-ref');
    });
  });
});
