# Metrics Test Examples

Copy-ready component tests (Vitest + Testing Library) that prove the [analytics-readiness contract](./contract.md). Pick the snippet matching your component's shape. These are the canonical templates the `test` agent and `/review-pr` expect.

**Locator hygiene (applies to every snippet):** never query by the same `data-*` attribute you are asserting. Locate the element with `data-testid`, `getByRole`, or `data-slot`, then assert the analytics attribute on it.

The shared `captureAnalyticsClicks` helper mirrors how analytics SDKs resolve clicks (`closest('[data-analytics-id]')` from `event.target`) and auto-cleans up after each test:

```typescript
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
```

---

## 1. Simple — id + verbatim props on the real node

For a component whose root is the interactive element (`Button`, `Link`, `Input`).

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button — analytics pass-through', () => {
  it('forwards data-analytics-id to the real <button>', () => {
    render(<Button data-testid='save' data-analytics-id='SAVE_CHANGES'>Save</Button>);

    const button = screen.getByTestId('save'); // locate by testid, NOT by analytics-id
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'SAVE_CHANGES');
  });

  it('forwards data-analytics-props byte-for-byte', () => {
    const payload = '{"feature":"host","mode":"delete","count":3}';
    render(
      <Button data-testid='del' data-analytics-id='HOST_DELETE_SUBMIT' data-analytics-props={payload}>
        Delete
      </Button>,
    );

    expect(screen.getByTestId('del')).toHaveAttribute('data-analytics-props', payload);
  });
});
```

---

## 2. Polymorphic — `asChild` / `as` reaches the final child

Assert the attribute lands on the consumer-rendered element, not the wrapper.

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button — asChild', () => {
  it('forwards analytics attrs onto the final rendered child', () => {
    render(
      <Button asChild>
        <a href='/docs' data-analytics-id='DOCS_NAV'>Docs</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('data-analytics-id', 'DOCS_NAV');
  });
});
```

---

## 3. Label-root — click resolution via `closest()`

For `Checkbox` / `Radio` / `Switch` / `SegmentedControl`, where the clickable root is a `<label>` wrapping a hidden input. Prove that a real click resolves to the id, and that the hidden input does **not** carry it.

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Checkbox } from './Checkbox';

describe('Checkbox — analytics', () => {
  it('resolves clicks to the analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();
    render(<Checkbox data-testid='checkbox' data-analytics-id='ACCEPT_TOS'>Accept</Checkbox>);

    await userEvent.click(screen.getByTestId('checkbox'));
    expect(captured).toHaveBeenCalledWith('ACCEPT_TOS');
  });

  it('does not strand the id on the hidden input (negative)', () => {
    render(<Checkbox data-testid='checkbox' data-analytics-id='ACCEPT_TOS'>Accept</Checkbox>);

    const hiddenInput = screen.getByTestId('checkbox').querySelector('input');
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput).not.toHaveAttribute('data-analytics-id');
  });
});
```

---

## 4. Wrapper-level — deliberate, named, with negative + resolution

**Only** for components whose folder documents a wrapper-level decision (test comments or an `ANALYTICS_GAPS.md`), per [contract.md](./contract.md). The test name must say `wrapper-level`; assert the id is on the wrapper, that inner controls don't carry it, and that clicks still resolve via `closest()`.

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { NumberInput } from './NumberInput';

describe('NumberInput — attribute pass-through (wrapper-level)', () => {
  it('forwards data-analytics-id to the root <div>', () => {
    render(<NumberInput data-testid='qty' data-analytics-id='ITEMS_PER_PAGE' />);

    const root = screen.getByTestId('qty');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-analytics-id', 'ITEMS_PER_PAGE');
  });

  it('does not strand the id on inner controls (wrapper-level contract)', () => {
    render(<NumberInput data-testid='qty' data-analytics-id='ITEMS_PER_PAGE' />);

    const root = screen.getByTestId('qty');
    expect(root.querySelector('input')).not.toHaveAttribute('data-analytics-id');
    for (const btn of root.querySelectorAll('button')) {
      expect(btn).not.toHaveAttribute('data-analytics-id');
    }
  });

  it('resolves inner-control clicks to the wrapper id via closest()', async () => {
    const captured = captureAnalyticsClicks();
    render(<NumberInput data-testid='qty' data-analytics-id='ITEMS_PER_PAGE' />);

    await userEvent.click(screen.getByTestId('qty').querySelectorAll('button')[0]);
    expect(captured).toHaveBeenCalledWith('ITEMS_PER_PAGE');
  });
});
```

---

## 5. State persistence — attrs survive a state change

For stateful components, verify the analytics attribute survives at least one meaningful transition (open/close, sort toggle, controlled value change).

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionItem, AccordionTrigger } from './Accordion';

describe('AccordionTrigger — analytics persistence', () => {
  it('keeps data-analytics-id across an open/close toggle', async () => {
    render(
      <Accordion>
        <AccordionItem value='one'>
          <AccordionTrigger data-testid='trigger' data-analytics-id='FAQ_ONE'>Q1</AccordionTrigger>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-analytics-id', 'FAQ_ONE');

    await userEvent.click(trigger); // open
    await userEvent.click(trigger); // close
    expect(trigger).toHaveAttribute('data-analytics-id', 'FAQ_ONE');
  });
});
```

---

## 6. Event composition — consumer handler still fires

When an internal handler exists, prove the consumer's handler runs too (and, where applicable, that `preventDefault()` short-circuits the internal one).

```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DialogTrigger } from './Dialog';

describe('DialogTrigger — handler composition', () => {
  it('fires the consumer onClick alongside the internal open behavior', async () => {
    const onClick = vi.fn();
    render(<DialogTrigger data-testid='trigger' onClick={onClick}>Open</DialogTrigger>);

    await userEvent.click(screen.getByTestId('trigger'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```
