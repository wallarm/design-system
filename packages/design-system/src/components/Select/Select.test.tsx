import { useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Select } from './Select';
import { SelectButton } from './SelectButton';
import { SelectClearTrigger } from './SelectClearTrigger';
import { SelectContent } from './SelectContent';
import { SelectFooter } from './SelectFooter';
import { SelectGroup } from './SelectGroup';
import { SelectGroupLabel } from './SelectGroupLabel';
import { SelectHeader } from './SelectHeader';
import { SelectInput } from './SelectInput';
import { SelectOption } from './SelectOption';
import { SelectOptionHint } from './SelectOptionHint';
import { SelectOptionText } from './SelectOptionText';
import { SelectPositioner } from './SelectPositioner';
import { SelectSearchInput } from './SelectSearchInput';

// Select is a compound API; analytics seams live on the exported
// sub-components (`SelectButton`, `SelectOption`, `SelectClearTrigger`,
// `SelectSearchInput`, `SelectInput`), NOT on the `<Select>` root. The Ark UI
// `Select.Root` is a logic-only context wrapper without its own DOM, so
// wrapper-level placement isn't a valid contract here. See
// docs/metrics/contract.md.

const items = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
];

const renderSelect = (extra?: { multiple?: boolean }) => {
  const collection = createListCollection({ items });
  return render(
    <Select collection={collection} multiple={extra?.multiple ?? false} data-testid='select'>
      <SelectButton data-testid='trigger' data-analytics-id='FRAMEWORK_TRIGGER' />
      <SelectPositioner>
        <SelectContent>
          <SelectSearchInput
            value=''
            onChange={() => undefined}
            data-testid='search'
            data-analytics-id='FRAMEWORK_SEARCH'
          />
          {items.map(item => (
            <SelectOption
              key={item.value}
              item={item}
              data-testid={`option-${item.value}`}
              data-analytics-id={`FRAMEWORK_${item.value.toUpperCase()}`}
            >
              <SelectOptionText>{item.label}</SelectOptionText>
            </SelectOption>
          ))}
          <SelectClearTrigger data-testid='clear' data-analytics-id='FRAMEWORK_CLEAR'>
            Clear
          </SelectClearTrigger>
        </SelectContent>
      </SelectPositioner>
    </Select>,
  );
};

describe('Attribute pass-through (compound seams)', () => {
  it('forwards data-analytics-id to the SelectButton <button>', () => {
    renderSelect();
    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'FRAMEWORK_TRIGGER');
  });

  it('forwards data-analytics-props verbatim on the SelectButton', () => {
    const payload = '{"feature":"framework-picker"}';
    const collection = createListCollection({ items });
    render(
      <Select collection={collection}>
        <SelectButton
          data-testid='trigger'
          data-analytics-id='FRAMEWORK_TRIGGER'
          data-analytics-props={payload}
        />
      </Select>,
    );
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-props', payload);
  });

  it('forwards data-analytics-id to each SelectOption', async () => {
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));

    const reactOption = await screen.findByTestId('option-react');
    expect(reactOption).toHaveAttribute('data-analytics-id', 'FRAMEWORK_REACT');

    const vueOption = screen.getByTestId('option-vue');
    expect(vueOption).toHaveAttribute('data-analytics-id', 'FRAMEWORK_VUE');
  });

  it('forwards data-analytics-id to the SelectClearTrigger <button>', async () => {
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));

    const clear = await screen.findByTestId('clear');
    expect(clear.tagName).toBe('BUTTON');
    expect(clear).toHaveAttribute('data-analytics-id', 'FRAMEWORK_CLEAR');
  });

  it('forwards data-analytics-id to the SelectSearchInput input', async () => {
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));

    const searchContainer = await screen.findByTestId('search');
    const input = searchContainer.querySelector('input');
    expect(input).toHaveAttribute('data-analytics-id', 'FRAMEWORK_SEARCH');
  });
});

describe('Click resolution', () => {
  it('resolves clicks on a SelectOption to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));
    const reactOption = await screen.findByTestId('option-react');
    await userEvent.click(reactOption);
    expect(captured).toHaveBeenCalledWith('FRAMEWORK_REACT');
  });

  it('resolves clicks on the SelectButton to its analytics-id', async () => {
    const captured = captureAnalyticsClicks();
    renderSelect();
    await userEvent.click(screen.getByTestId('trigger'));
    expect(captured).toHaveBeenCalledWith('FRAMEWORK_TRIGGER');
  });
});

describe('State persistence', () => {
  it('keeps analytics-id on the trigger after open → close cycle', async () => {
    renderSelect();
    const trigger = screen.getByTestId('trigger');

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-id', 'FRAMEWORK_TRIGGER');
  });

  it('keeps analytics-id on a SelectOption after value change', async () => {
    renderSelect({ multiple: true });
    await userEvent.click(screen.getByTestId('trigger'));

    const reactOption = await screen.findByTestId('option-react');
    await userEvent.click(reactOption);

    // Ark UI's Select machine defaults closeOnSelect to `!multiple`, so a
    // multi-select list stays open after picking a value — no
    // close/reopen cycle happens here. Query the still-open list directly;
    // an extra trigger click would toggle it *closed* instead of
    // "reopening" it, since it was never closed to begin with.
    const reactOptionAfter = await screen.findByTestId('option-react');
    expect(reactOptionAfter).toHaveAttribute('data-analytics-id', 'FRAMEWORK_REACT');
  });
});

describe('Size variants', () => {
  const collection = createListCollection({ items });

  it('SelectButton defaults to the default (36px) height with no size prop', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-36');
  });

  it('SelectButton renders the medium (32px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='medium' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-32');
  });

  it('SelectButton renders the small (24px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='small' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-24');
  });

  it('SelectButton renders the inline-edit (28px) height', () => {
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-28');
  });

  it('SelectInput defaults to the default (36px) height with no size prop', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-36');
  });

  it('SelectInput renders the medium (32px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='medium' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-32');
  });

  it('SelectInput renders the small (24px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='small' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-24');
  });

  it('SelectInput scales its item Tags to medium at small size (large would leave no vertical margin in a 24px row)', () => {
    render(
      <Select collection={collection} multiple defaultValue={['react']} data-testid='select'>
        <SelectInput data-testid='trigger' size='small' />
      </Select>,
    );
    const tag = document.querySelector('[data-slot="tag"]');
    expect(tag?.className).toContain('h-20');
  });

  it('SelectInput keeps its item Tags at large for medium/default sizes', () => {
    render(
      <Select collection={collection} multiple defaultValue={['react']} data-testid='select'>
        <SelectInput data-testid='trigger' size='medium' />
      </Select>,
    );
    const tag = document.querySelector('[data-slot="tag"]');
    expect(tag?.className).toContain('h-24');
  });

  it('SelectInput renders the inline-edit (28px) height', () => {
    render(
      <Select collection={collection} multiple data-testid='select'>
        <SelectInput data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    expect(screen.getByTestId('trigger').className).toContain('h-28');
  });

  it('SelectInput keeps its item Tags at large for inline-edit size', () => {
    render(
      <Select collection={collection} multiple defaultValue={['react']} data-testid='select'>
        <SelectInput data-testid='trigger' size='inline-edit' />
      </Select>,
    );
    const tag = document.querySelector('[data-slot="tag"]');
    expect(tag?.className).toContain('h-24');
  });
});

describe('SelectSearchInput keyboard', () => {
  const SearchableSelect = ({ onKeyDown }: { onKeyDown?: () => void }) => {
    const [query, setQuery] = useState('');
    const collection = createListCollection({ items });
    return (
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
        <SelectPositioner>
          <SelectHeader>
            <SelectSearchInput
              value={query}
              onChange={setQuery}
              onKeyDown={onKeyDown}
              data-testid='search'
            />
          </SelectHeader>
          <SelectContent>
            {items.map(item => (
              <SelectOption key={item.value} item={item} data-testid={`option-${item.value}`}>
                <SelectOptionText>{item.label}</SelectOptionText>
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>
    );
  };

  it('types a space instead of picking the highlighted option, and composes onKeyDown', async () => {
    const onKeyDown = rs.fn();
    render(<SearchableSelect onKeyDown={onKeyDown} />);
    await userEvent.click(screen.getByTestId('trigger'));
    const input = within(await screen.findByTestId('search')).getByRole('textbox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.type(input, 'a b');

    expect(input).toHaveValue('a b');
    expect(screen.getByTestId('option-react')).toHaveAttribute('aria-selected', 'false');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('regression: a space typed while an option is highlighted is inserted and picks nothing', async () => {
    const onValueChange = rs.fn();
    const Wrapped = () => {
      const [query, setQuery] = useState('');
      const collection = createListCollection({ items });
      return (
        <Select collection={collection} onValueChange={onValueChange} data-testid='select'>
          <SelectButton data-testid='trigger' />
          <SelectPositioner>
            <SelectHeader>
              <SelectSearchInput value={query} onChange={setQuery} data-testid='search' />
            </SelectHeader>
            <SelectContent>
              {items.map(item => (
                <SelectOption key={item.value} item={item} data-testid={`option-${item.value}`}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </Select>
      );
    };
    render(<Wrapped />);
    await userEvent.click(screen.getByTestId('trigger'));
    const input = within(await screen.findByTestId('search')).getByRole('textbox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByTestId('option-react')).toHaveAttribute('data-highlighted', ''),
    );

    await userEvent.keyboard(' ');
    expect(input).toHaveValue(' ');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('option-react')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('trigger')).toHaveAttribute('aria-expanded', 'true');
  });

  it('Home and End stay in the input and do not move the highlight', async () => {
    render(<SearchableSelect />);
    await userEvent.click(screen.getByTestId('trigger'));
    const input = within(await screen.findByTestId('search')).getByRole('textbox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByTestId('option-react')).toHaveAttribute('data-highlighted', ''),
    );

    await userEvent.keyboard('{End}');
    expect(screen.getByTestId('option-angular')).not.toHaveAttribute('data-highlighted');
    await userEvent.keyboard('{Home}');
    expect(screen.getByTestId('option-react')).toHaveAttribute('data-highlighted', '');
  });

  it('still lets arrows and Enter reach the list from the input', async () => {
    const onValueChange = rs.fn();
    const collection = createListCollection({ items });
    render(
      <Select collection={collection} onValueChange={onValueChange} data-testid='select'>
        <SelectButton data-testid='trigger' />
        <SelectPositioner>
          <SelectHeader>
            <SelectSearchInput value='' onChange={rs.fn()} data-testid='search' />
          </SelectHeader>
          <SelectContent>
            {items.map(item => (
              <SelectOption key={item.value} item={item} data-testid={`option-${item.value}`}>
                <SelectOptionText>{item.label}</SelectOptionText>
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>,
    );
    await userEvent.click(screen.getByTestId('trigger'));
    const input = within(await screen.findByTestId('search')).getByRole('textbox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByTestId('option-vue')).toHaveAttribute('data-highlighted', ''),
    );
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ['vue'] }));
  });
});

describe('SelectPositioner contentProps and size override', () => {
  const renderPositioner = (props: Parameters<typeof SelectPositioner>[0]) => {
    const collection = createListCollection({ items });
    return render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
        <SelectPositioner {...props}>
          <SelectContent>
            {items.map(item => (
              <SelectOption key={item.value} item={item}>
                <SelectOptionText>{item.label}</SelectOptionText>
              </SelectOption>
            ))}
          </SelectContent>
        </SelectPositioner>
      </Select>,
    );
  };

  it('forwards ref, style and data-* to the listbox content element', async () => {
    const ref = { current: null as HTMLDivElement | null };
    renderPositioner({
      contentProps: {
        ref,
        style: { width: 200 },
        'data-testid': 'panel',
        'data-analytics-id': 'PANEL',
      },
    });
    await userEvent.click(screen.getByTestId('trigger'));
    const panel = await screen.findByTestId('panel');
    expect(panel).toHaveAttribute('role', 'listbox');
    expect(panel).toHaveAttribute('data-analytics-id', 'PANEL');
    expect(panel.style.width).toBe('200px');
    expect(ref.current).toBe(panel);
  });

  it('lets className replace the default min/max width via tailwind-merge', async () => {
    renderPositioner({
      className: 'min-w-128 max-w-360',
      contentProps: { 'data-testid': 'panel' },
    });
    await userEvent.click(screen.getByTestId('trigger'));
    const panel = await screen.findByTestId('panel');
    expect(panel.className).toContain('min-w-128');
    expect(panel.className).toContain('max-w-360');
    expect(panel.className).not.toContain('min-w-240');
    expect(panel.className).not.toContain('max-w-320');
  });

  it('keeps the default sizes without a className', async () => {
    renderPositioner({ contentProps: { 'data-testid': 'panel' } });
    await userEvent.click(screen.getByTestId('trigger'));
    const panel = await screen.findByTestId('panel');
    expect(panel.className).toContain('min-w-240');
    expect(panel.className).toContain('max-w-320');
  });
});

describe('SelectFooter variants', () => {
  it('default variant keeps the original classes', () => {
    render(<SelectFooter data-testid='footer'>x</SelectFooter>);
    const footer = screen.getByTestId('footer');
    for (const cls of ['bg-component-outline-button-bg', 'py-8', 'px-16', 'border-t']) {
      expect(footer.className).toContain(cls);
    }
    expect(footer.className).not.toContain('justify-end');
  });

  it('actions variant right-aligns inside the 8px inset', () => {
    render(
      <SelectFooter variant='actions' data-testid='footer'>
        x
      </SelectFooter>,
    );
    const footer = screen.getByTestId('footer');
    for (const cls of ['justify-end', 'p-8', 'border-t', 'border-border-primary-light']) {
      expect(footer.className).toContain(cls);
    }
    expect(footer.className).not.toContain('px-16');
  });
});

describe('Consumer data-testid on Select parts', () => {
  it('accepts a consumer data-testid on content, group, group label and footer', async () => {
    const collection = createListCollection({ items });
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
        <SelectPositioner>
          <SelectContent data-testid='my-list'>
            <SelectGroup data-testid='my-group' data-slot='custom-group'>
              <SelectGroupLabel data-testid='my-label'>Frameworks</SelectGroupLabel>
              <SelectOption item={items[0]}>
                <SelectOptionText>React</SelectOptionText>
              </SelectOption>
            </SelectGroup>
          </SelectContent>
          <SelectFooter data-testid='my-footer'>footer</SelectFooter>
        </SelectPositioner>
      </Select>,
    );
    await userEvent.click(screen.getByTestId('trigger'));
    expect(await screen.findByTestId('my-list')).toBeInTheDocument();
    expect(screen.getByTestId('my-group')).toHaveAttribute('data-slot', 'custom-group');
    expect(screen.getByTestId('my-label')).toHaveTextContent('Frameworks');
    expect(screen.getByTestId('my-footer')).toHaveTextContent('footer');
  });

  it('falls back to the cascaded ids without a consumer data-testid', async () => {
    const collection = createListCollection({ items });
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton />
        <SelectPositioner>
          <SelectContent>
            <SelectGroup>
              <SelectGroupLabel>Frameworks</SelectGroupLabel>
            </SelectGroup>
          </SelectContent>
        </SelectPositioner>
      </Select>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByTestId('select--content')).toBeInTheDocument();
  });
});

describe('SelectOptionHint', () => {
  it('renders right-side text and keeps the option row on one line', async () => {
    const collection = createListCollection({ items });
    render(
      <Select collection={collection} data-testid='select'>
        <SelectButton data-testid='trigger' />
        <SelectPositioner>
          <SelectContent>
            <SelectOption item={items[0]} data-testid='option'>
              <SelectOptionText>React</SelectOptionText>
              <SelectOptionHint data-testid='hint'>12</SelectOptionHint>
            </SelectOption>
          </SelectContent>
        </SelectPositioner>
      </Select>,
    );
    await userEvent.click(screen.getByTestId('trigger'));
    expect(await screen.findByTestId('hint')).toHaveTextContent('12');
    expect(screen.getByTestId('hint')).toHaveAttribute('data-slot', 'select-option-hint');
    expect(screen.getByTestId('option').className).toContain(
      'has-[>[data-slot=select-option-hint]]:flex-nowrap',
    );
  });
});
