import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Breadcrumbs } from './Breadcrumbs';
import { BreadcrumbsItem } from './BreadcrumbsItem';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the link branch <a>', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbsItem
          href='/products'
          data-testid='item-link'
          data-analytics-id='NAV_PRODUCTS'
        >
          Products
        </BreadcrumbsItem>
        <BreadcrumbsItem data-testid='item-current'>Current</BreadcrumbsItem>
      </Breadcrumbs>,
    );

    const link = screen.getByTestId('item-link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/products');
    expect(link).toHaveAttribute('data-analytics-id', 'NAV_PRODUCTS');
  });

  it('forwards data-analytics-id to the button branch <button>', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbsItem
          data-testid='item-button'
          data-analytics-id='NAV_ROOT'
          onClick={vi.fn()}
        >
          Root
        </BreadcrumbsItem>
        <BreadcrumbsItem data-testid='item-current'>Current</BreadcrumbsItem>
      </Breadcrumbs>,
    );

    const btn = screen.getByTestId('item-button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('data-analytics-id', 'NAV_ROOT');
  });

  it('forwards data-analytics-id to the current item (rendered as <button>)', () => {
    render(
      <Breadcrumbs>
        <BreadcrumbsItem href='/home' data-testid='item-home'>
          Home
        </BreadcrumbsItem>
        <BreadcrumbsItem data-testid='item-current' data-analytics-id='NAV_CURRENT'>
          Current
        </BreadcrumbsItem>
      </Breadcrumbs>,
    );

    const current = screen.getByTestId('item-current');
    expect(current.tagName).toBe('BUTTON');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-analytics-id', 'NAV_CURRENT');
  });

  it('forwards data-analytics-props JSON payload verbatim on both branches', () => {
    const linkPayload = JSON.stringify({ branch: 'link' });
    const buttonPayload = JSON.stringify({ branch: 'button' });

    render(
      <Breadcrumbs>
        <BreadcrumbsItem
          href='/products'
          data-testid='item-link'
          data-analytics-id='NAV_PRODUCTS'
          data-analytics-props={linkPayload}
        >
          Products
        </BreadcrumbsItem>
        <BreadcrumbsItem
          data-testid='item-current'
          data-analytics-id='NAV_CURRENT'
          data-analytics-props={buttonPayload}
        >
          Current
        </BreadcrumbsItem>
      </Breadcrumbs>,
    );

    expect(screen.getByTestId('item-link')).toHaveAttribute('data-analytics-props', linkPayload);
    expect(screen.getByTestId('item-current')).toHaveAttribute(
      'data-analytics-props',
      buttonPayload,
    );
  });

  it('composes consumer onClick on the link branch', async () => {
    const onClick = vi.fn();

    render(
      <Breadcrumbs>
        <BreadcrumbsItem
          href='/products'
          data-testid='item-link'
          data-analytics-id='NAV_PRODUCTS'
          onClick={e => {
            e.preventDefault();
            onClick();
          }}
        >
          Products
        </BreadcrumbsItem>
        <BreadcrumbsItem data-testid='item-current'>Current</BreadcrumbsItem>
      </Breadcrumbs>,
    );

    await userEvent.click(screen.getByTestId('item-link'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('each item captures its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <Breadcrumbs>
        <BreadcrumbsItem
          href='/products'
          data-testid='item-products'
          data-analytics-id='NAV_PRODUCTS'
          onClick={e => e.preventDefault()}
        >
          Products
        </BreadcrumbsItem>
        <BreadcrumbsItem
          onClick={vi.fn()}
          data-testid='item-category'
          data-analytics-id='NAV_CATEGORY'
        >
          Category
        </BreadcrumbsItem>
        <BreadcrumbsItem data-testid='item-current' data-analytics-id='NAV_CURRENT'>
          Current
        </BreadcrumbsItem>
      </Breadcrumbs>,
    );

    await userEvent.click(screen.getByTestId('item-products'));
    await userEvent.click(screen.getByTestId('item-category'));
    await userEvent.click(screen.getByTestId('item-current'));

    expect(captured).toHaveBeenCalledWith('NAV_PRODUCTS');
    expect(captured).toHaveBeenCalledWith('NAV_CATEGORY');
    expect(captured).toHaveBeenCalledWith('NAV_CURRENT');
  });
});
