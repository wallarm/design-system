import { createListCollection } from '@ark-ui/react/collection';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Info } from '../../icons';
import { Button } from '../Button';
import {
  Checkbox,
  CheckboxDescription,
  CheckboxIndicator,
  CheckboxLabel,
} from '../Checkbox';
import { Input } from '../Input';
import { NumberInput } from '../NumberInput';
import { Radio, RadioGroup, RadioIndicator, RadioLabel } from '../Radio';
import {
  Select,
  SelectButton,
  SelectContent,
  SelectOption,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { HStack } from '../Stack';
import {
  Switch,
  SwitchControl,
  SwitchDescription,
  SwitchLabel,
} from '../Switch';
import { Textarea } from '../Textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

import { Field } from './Field';
import { FieldAction } from './FieldAction';
import { FieldDescription } from './FieldDescription';
import { FieldError } from './FieldError';
import { FieldGroup } from './FieldGroup';
import { FieldIndicator } from './FieldIndicator';
import { FieldLabel } from './FieldLabel';
import { FieldLegend } from './FieldLegend';
import { FieldSeparator } from './FieldSeparator';
import { FieldSet } from './FieldSet';

const meta = {
  title: 'Inputs/Field',
  component: Field,
  subcomponents: {
    FieldAction,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldIndicator,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Field>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => {
  const monthsCollection = createListCollection({
    items: [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ],
  });

  const yearsCollection = createListCollection({
    items: ['2025', '2026', '2027', '2028', '2029'],
  });

  return (
    <div className="min-w-320">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>

            <FieldDescription>
              All transactions are secure and encrypted
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Name on Card</FieldLabel>
                <Input placeholder="Evil Rabbit" />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  Card Number
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <FieldDescription>
                  Enter your 16-digit card number
                </FieldDescription>
              </Field>

              <HStack>
                <Field>
                  <FieldLabel>Month</FieldLabel>
                  <Select collection={monthsCollection}>
                    <SelectButton placeholder="Month" />
                    <SelectPositioner>
                      <SelectContent>
                        {monthsCollection.items.map((month) => (
                          <SelectOption key={month} item={month}>
                            <SelectOptionText>{month}</SelectOptionText>
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Year</FieldLabel>

                  <Select collection={yearsCollection}>
                    <SelectButton placeholder="Year" />

                    <SelectPositioner>
                      <SelectContent>
                        {yearsCollection.items.map((year) => (
                          <SelectOption key={year} item={year}>
                            <SelectOptionText>{year}</SelectOptionText>
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>CVV</FieldLabel>
                  <Input placeholder="123" required />
                </Field>
              </HStack>

              <Field>
                <FieldLabel>Amount</FieldLabel>
                <NumberInput defaultValue="1000" />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>

            <FieldDescription>
              The billing address associated with your payment method
            </FieldDescription>

            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox defaultChecked>
                  <CheckboxIndicator />
                  <CheckboxLabel>Same as shipping address</CheckboxLabel>
                </Checkbox>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Subscription Plan</FieldLegend>

            <FieldDescription>
              Yearly and lifetime plans offer significant savings.
            </FieldDescription>

            <Field>
              <RadioGroup defaultValue="monthly">
                <Radio value="monthly">
                  <RadioIndicator />
                  <RadioLabel>Monthly ($9.99/month)</RadioLabel>
                </Radio>
                <Radio value="yearly">
                  <RadioIndicator />
                  <RadioLabel>Yearly ($99.99/year)</RadioLabel>
                </Radio>
                <Radio value="lifetime">
                  <RadioIndicator />
                  <RadioLabel>Lifetime ($299.99)</RadioLabel>
                </Radio>
              </RadioGroup>
            </Field>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldGroup>
              <Field orientation="horizontal">
                <Switch>
                  <SwitchControl />
                  <SwitchLabel>Notice when delivered</SwitchLabel>
                </Switch>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Comments</FieldLabel>
                <Textarea placeholder="Add any additional comments" />
              </Field>
            </FieldGroup>
          </FieldSet>

          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>

            <Button variant="outline" color="neutral" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};

export const Inputs: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input type="text" placeholder="Max Leiter" />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Password</FieldLabel>
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
          <Input type="password" placeholder="********" />
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
);

export const Textareas: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel>Feedback</FieldLabel>
          <Textarea placeholder="Your feedback helps us improve..." rows={4} />
          <FieldDescription>
            Share your thoughts about our service.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
);

export const Fieldset: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>This appears on invoices and emails.</FieldDescription>

      <FieldGroup>
        <Field>
          <FieldLabel>
            Full name
            <FieldAction>Generate new</FieldAction>
          </FieldLabel>
          <Input autoComplete="off" placeholder="Evil Rabbit" />
          <FieldDescription>
            This appears on invoices and emails.
          </FieldDescription>
        </Field>
        <Field required>
          <FieldLabel>
            Username
            <FieldIndicator />
          </FieldLabel>
          <Input placeholder="@paveldurov" autoComplete="off" error />
          <FieldError>Choose another username.</FieldError>
        </Field>
        <Field>
          <FieldLabel>
            Message
            <Tooltip>
              <TooltipTrigger>
                <Info />
              </TooltipTrigger>
              <TooltipContent>Additional information</TooltipContent>
            </Tooltip>
          </FieldLabel>
          <Textarea placeholder="Your message..." />
          <FieldDescription>Enter your message.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
);

export const Switches: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldLegend>Notification Settings</FieldLegend>
      <FieldDescription>Manage your notification preferences.</FieldDescription>

      <FieldGroup>
        <Field orientation="horizontal">
          <Switch defaultChecked>
            <SwitchControl />
            <SwitchLabel>Email notifications</SwitchLabel>
            <SwitchDescription>
              Receive email alerts for important updates.
            </SwitchDescription>
          </Switch>
        </Field>

        <Field orientation="horizontal">
          <Switch>
            <SwitchControl />
            <SwitchLabel>Push notifications</SwitchLabel>
            <SwitchDescription>
              Get push notifications on your device.
            </SwitchDescription>
          </Switch>
        </Field>

        <Field orientation="horizontal">
          <Switch defaultChecked>
            <SwitchControl />
            <SwitchLabel>SMS notifications</SwitchLabel>
            <SwitchDescription>
              Receive text messages for critical alerts.
            </SwitchDescription>
          </Switch>
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
);

export const Radios: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldLegend>Delivery Method</FieldLegend>
      <FieldDescription>
        Choose how you want to receive your order.
      </FieldDescription>

      <Field>
        <RadioGroup defaultValue="standard">
          <Radio value="standard">
            <RadioIndicator />
            <RadioLabel>Standard Shipping (5-7 days)</RadioLabel>
          </Radio>
          <Radio value="express">
            <RadioIndicator />
            <RadioLabel>Express Shipping (2-3 days)</RadioLabel>
          </Radio>
          <Radio value="overnight">
            <RadioIndicator />
            <RadioLabel>Overnight Shipping (1 day)</RadioLabel>
          </Radio>
          <Radio value="pickup">
            <RadioIndicator />
            <RadioLabel>In-store Pickup</RadioLabel>
          </Radio>
        </RadioGroup>

        <FieldDescription>
          Shipping costs will be calculated at checkout.
        </FieldDescription>
      </Field>
    </FieldSet>
  </div>
);

export const Checkboxes: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldLegend>Terms and Preferences</FieldLegend>
      <FieldDescription>Select which terms you agree to.</FieldDescription>

      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox defaultChecked>
            <CheckboxIndicator />
            <CheckboxLabel>I accept the terms and conditions</CheckboxLabel>
            <CheckboxDescription>
              You must agree to our terms to continue.
            </CheckboxDescription>
          </Checkbox>
        </Field>
        <Field orientation="horizontal">
          <Checkbox>
            <CheckboxIndicator />
            <CheckboxLabel>Subscribe to newsletter</CheckboxLabel>
            <CheckboxDescription>
              Get weekly updates and exclusive offers.
            </CheckboxDescription>
          </Checkbox>
        </Field>
        <Field orientation="horizontal">
          <Checkbox defaultChecked>
            <CheckboxIndicator />
            <CheckboxLabel>Share usage data</CheckboxLabel>
            <CheckboxDescription>
              Help us improve our services.
            </CheckboxDescription>
          </Checkbox>
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
);

export const NumberInputs: StoryFn<typeof meta> = () => (
  <div className="min-w-320">
    <FieldSet>
      <FieldLegend>Product Details</FieldLegend>
      <FieldDescription>
        Configure your product quantity and pricing.
      </FieldDescription>

      <FieldGroup>
        <Field>
          <FieldLabel>Quantity</FieldLabel>
          <NumberInput defaultValue="1" min={1} max={100} />
          <FieldDescription>Choose between 1 and 100 items.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Price per unit</FieldLabel>
          <NumberInput
            defaultValue="99.99"
            step={0.01}
            formatOptions={{ style: 'currency', currency: 'USD' }}
          />
          <FieldDescription>Set the price for each unit.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Discount percentage</FieldLabel>
          <NumberInput
            defaultValue="10"
            min={0}
            max={100}
            formatOptions={{ style: 'percent' }}
          />
          <FieldDescription>Apply a discount from 0% to 100%.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  </div>
);

export const Selects: StoryFn<typeof meta> = () => {
  const countriesCollection = createListCollection({
    items: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'fr', label: 'France' },
      { value: 'de', label: 'Germany' },
      { value: 'jp', label: 'Japan' },
    ],
  });

  const languagesCollection = createListCollection({
    items: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'it', label: 'Italian' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'ru', label: 'Russian' },
      { value: 'zh', label: 'Chinese' },
      { value: 'ja', label: 'Japanese' },
    ],
  });

  const timezonesCollection = createListCollection({
    items: [
      { value: 'utc-8', label: 'Pacific Time (UTC-8)' },
      { value: 'utc-5', label: 'Eastern Time (UTC-5)' },
      { value: 'utc', label: 'UTC' },
      { value: 'utc+1', label: 'Central European Time (UTC+1)' },
      { value: 'utc+8', label: 'China Standard Time (UTC+8)' },
      { value: 'utc+9', label: 'Japan Standard Time (UTC+9)' },
    ],
  });

  return (
    <div className="min-w-320">
      <FieldSet>
        <FieldLegend>Regional Settings</FieldLegend>
        <FieldDescription>
          Configure your location and language preferences.
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel>Country</FieldLabel>
            <Select collection={countriesCollection}>
              <SelectButton placeholder="Select a country" />
              <SelectPositioner>
                <SelectContent>
                  {countriesCollection.items.map((country) => (
                    <SelectOption key={country.value} item={country}>
                      <SelectOptionText>{country.label}</SelectOptionText>
                    </SelectOption>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>
            <FieldDescription>
              Your country determines available features.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Language</FieldLabel>
            <Select collection={languagesCollection}>
              <SelectButton placeholder="Select a language" />
              <SelectPositioner>
                <SelectContent>
                  {languagesCollection.items.map((language) => (
                    <SelectOption key={language.value} item={language}>
                      <SelectOptionText>{language.label}</SelectOptionText>
                    </SelectOption>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>
            <FieldDescription>Choose your preferred language.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel>Timezone</FieldLabel>
            <Select collection={timezonesCollection}>
              <SelectButton placeholder="Select a timezone" />
              <SelectPositioner>
                <SelectContent>
                  {timezonesCollection.items.map((timezone) => (
                    <SelectOption key={timezone.value} item={timezone}>
                      <SelectOptionText>{timezone.label}</SelectOptionText>
                    </SelectOption>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>
            <FieldDescription>
              All times will be displayed in this timezone.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  );
};
