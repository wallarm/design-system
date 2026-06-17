import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Accordion } from './Accordion';
import { AccordionContent } from './AccordionContent';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the trigger <button>', () => {
    render(
      <Accordion>
        <AccordionItem value='one'>
          <AccordionTrigger data-testid='trigger' data-analytics-id='OPEN_SECTION_ONE'>
            Section one
          </AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_SECTION_ONE');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'docs', section: 'one' });

    render(
      <Accordion>
        <AccordionItem value='one'>
          <AccordionTrigger
            data-testid='trigger'
            data-analytics-id='OPEN_SECTION_ONE'
            data-analytics-props={payload}
          >
            Section one
          </AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_SECTION_ONE');
    expect(trigger).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves data-analytics-id across open / close state transitions', async () => {
    render(
      <Accordion>
        <AccordionItem value='one'>
          <AccordionTrigger data-testid='trigger' data-analytics-id='OPEN_SECTION_ONE'>
            Section one
          </AccordionTrigger>
          <AccordionContent>Body</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_SECTION_ONE');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_SECTION_ONE');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_SECTION_ONE');
  });

  it('each trigger captures its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <Accordion multiple>
        <AccordionItem value='one'>
          <AccordionTrigger data-testid='trigger-one' data-analytics-id='OPEN_ONE'>
            Section one
          </AccordionTrigger>
          <AccordionContent>Body one</AccordionContent>
        </AccordionItem>
        <AccordionItem value='two'>
          <AccordionTrigger data-testid='trigger-two' data-analytics-id='OPEN_TWO'>
            Section two
          </AccordionTrigger>
          <AccordionContent>Body two</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    await userEvent.click(screen.getByTestId('trigger-one'));
    await userEvent.click(screen.getByTestId('trigger-two'));

    expect(captured).toHaveBeenNthCalledWith(1, 'OPEN_ONE');
    expect(captured).toHaveBeenNthCalledWith(2, 'OPEN_TWO');
  });
});
