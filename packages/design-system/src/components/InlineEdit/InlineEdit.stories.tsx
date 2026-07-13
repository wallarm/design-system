import { useRef, useState } from 'react';
import type { TimeValue } from '@react-aria/datepicker';
import { format } from 'date-fns';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar, ChevronDown, Clock } from '../../icons';
import type { DateValue } from '../../index';
import { CalendarDate, CalendarDateTime, Time } from '../../index';
import { useTestId } from '../../utils/testId';
import { Attribute, AttributeLabel, AttributeValue } from '../Attribute';
import { Button } from '../Button';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarInputHeader,
  CalendarTrigger,
} from '../Calendar';
import { DateFormatProvider } from '../DateFormatProvider';
import { DateInput } from '../DateInput';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogFooterControls,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
import { OverflowList } from '../OverflowList';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import {
  SelectButton,
  SelectContent,
  type SelectDataItem,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { toCalendarDateValue, toReactAriaDateValue, withMinuteGranularity } from './dateValueCast';
import { InlineEdit } from './InlineEdit';
import { useInlineEdit } from './InlineEditContext';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';
import { InlineEditDateTime } from './InlineEditDateTime';
import { InlineEditError } from './InlineEditError';
import { InlineEditInput } from './InlineEditInput';
import { InlineEditNumber } from './InlineEditNumber';
import { InlineEditPreview } from './InlineEditPreview';
import { InlineEditPreviewIcon } from './InlineEditPreviewIcon';
import { InlineEditPreviewValue } from './InlineEditPreviewValue';
import { InlineEditSelect } from './InlineEditSelect';
import { InlineEditTextarea } from './InlineEditTextarea';
import { InlineEditTime } from './InlineEditTime';

const meta = {
  title: 'Inputs/InlineEdit',
  component: InlineEdit,
  subcomponents: {
    InlineEditPreview,
    InlineEditPreviewValue,
    InlineEditPreviewIcon,
    InlineEditControl,
    InlineEditError,
    InlineEditInput,
    InlineEditNumber,
    InlineEditTextarea,
    InlineEditSelect,
    InlineEditDate,
    InlineEditDateTime,
    InlineEditTime,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'InlineEdit is a compound inline-edit component: `InlineEditPreview` renders the ' +
          'read-mode wrapper and `InlineEditControl` the edit-mode wrapper, hosting either a ' +
          'built-in editor (`InlineEditInput`, `InlineEditNumber`, `InlineEditTextarea`, ' +
          '`InlineEditSelect`, `InlineEditDate`, `InlineEditTime`) or a custom one. ' +
          '`InlineEditSelect`/`InlineEditDate`/`InlineEditDateTime` are pure root-wrappers — ' +
          'they own only the draft/commit wiring, and `children` (required) are ordinary ' +
          '`Select`/`Calendar` compound parts, composed exactly as you would standalone. ' +
          'The root manages the commit/cancel lifecycle, async commit with loading, saved, ' +
          'and error status, and submit-mode handling (enter, blur, both, or none).' +
          ' An optional `onBeforeValueCommit` guard intercepts every commit — return `false` ' +
          '(or a promise resolving to `false`) to keep the field in edit mode, e.g. after a ' +
          'declined confirmation dialog.' +
          ' Every story below composes `InlineEdit` inside `AttributeValue` — `AttributeLabel` ' +
          'renders the label, and `AttributeValue` owns the row-height and hit-target seam that ' +
          'keeps `InlineEditPreview`/`InlineEditControl` visually identical on toggle, so this ' +
          'is the same shape real consumers use.' +
          ' The Controls panel drives the shared behavioral props (`activationMode`, ' +
          '`submitMode`, `disabled`, `readOnly`, `selectOnFocus`, `savedDuration`) live on every ' +
          'instance below; each story still hardcodes its own `value`/`status`/`readOnly`/' +
          '`disabled` where that is the point of the demo (e.g. States, Non Editable), so those ' +
          'specific controls have no visible effect there.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'loading', 'saved', 'error'],
      description: 'Async-feedback status. Uncontrolled stories drive this internally.',
    },
    activationMode: {
      control: 'select',
      options: ['click', 'focus', 'none'],
      description: 'How the preview enters edit mode.',
    },
    submitMode: {
      control: 'select',
      options: ['enter', 'blur', 'both', 'none'],
      description: 'Which interactions commit the draft.',
    },
    disabled: {
      control: 'boolean',
    },
    readOnly: {
      control: 'boolean',
    },
    defaultEdit: {
      control: 'boolean',
    },
    selectOnFocus: {
      control: 'boolean',
    },
    savedDuration: {
      control: 'number',
      description: 'Milliseconds the `saved` status is shown before reverting to `idle`.',
    },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    onValueCommit: { table: { disable: true } },
    onValueRevert: { table: { disable: true } },
    onBeforeValueCommit: { table: { disable: true } },
    edit: { table: { disable: true } },
    onEditChange: { table: { disable: true } },
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
} satisfies Meta<typeof InlineEdit>;

export default meta;

const roleItems: SelectDataItem[] = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Auditor', value: 'auditor' },
];

const tagItems: SelectDataItem[] = [
  { label: 'production', value: 'production' },
  { label: 'us-east-1', value: 'us-east-1' },
  { label: 'critical', value: 'critical' },
  { label: 'tier-1', value: 'tier-1' },
  { label: 'public', value: 'public' },
  { label: 'monitored', value: 'monitored' },
];

function renderSelectOptions(items: SelectDataItem[]) {
  return items.map(item => (
    <SelectOption key={item.value} item={item}>
      <SelectOptionText>{item.label}</SelectOptionText>
      <SelectOptionIndicator />
    </SelectOption>
  ));
}

// Same "+N in a popover" pattern as Attribute.stories.tsx's OverflowList usage.
function renderOverflowPopover(items: string[]) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Tag>+{items.length}</Tag>
      </PopoverTrigger>
      <PopoverContent minWidth='auto' minHeight='auto' maxWidth='240px'>
        <div className='flex flex-col gap-4'>
          {items.map(item => (
            <Text key={item} size='sm'>
              {item}
            </Text>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// SelectInput does not self-cascade its testid (unlike SelectButton) — derive
// it explicitly. Must be its own component: useTestId only resolves from a
// descendant of <InlineEdit>, not from the story function that renders it.
function SelectInputTrigger() {
  const testId = useTestId('input');
  return <SelectInput data-testid={testId} size='inline-edit' />;
}

// SelectButton naturally cascades to the `button` slot, but this specific
// consumer (ConfirmCommit's Role row) needs to preserve the pre-existing
// `input` slot name that InlineEdit.e2e.ts depends on — same reasoning as
// SelectInputTrigger above, just for the single-select trigger.
function SelectButtonTrigger() {
  const testId = useTestId('input');
  return <SelectButton data-testid={testId} size='inline-edit' />;
}

// `Calendar` never re-provides its own testid cascade, so this resolves
// straight from the ambient InlineEdit root — same reasoning as
// SelectInputTrigger above, just without needing a bridge.
function DateInputTrigger({ granularity }: { granularity: 'day' | 'minute' }) {
  const testId = useTestId('input');
  const { value, setValue } = useInlineEdit<DateValue | null>();
  const resolvedValue =
    granularity === 'minute' ? withMinuteGranularity(value ?? null) : (value ?? null);
  return (
    <DateInput
      data-testid={testId}
      value={toReactAriaDateValue(resolvedValue)}
      onChange={v => setValue(toCalendarDateValue(v))}
      granularity={granularity}
      size='inline-edit'
      showIcon={false}
    />
  );
}

/** `InlineEditInput` in isolation — the default text editor. */
export const TextEditor: StoryFn<typeof meta> = args => {
  const [text, setText] = useState('Checkout API');
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>Name</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={text}
            onValueCommit={v => setText(v as string)}
            data-testid='text'
          >
            <InlineEditPreview data-analytics-id='inline-edit-name'>{text}</InlineEditPreview>
            <InlineEditControl>
              <InlineEditInput data-analytics-id='inline-edit-name-input' aria-label='Name' />
            </InlineEditControl>
            <InlineEditError />
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

/** `InlineEditNumber` in isolation. */
export const NumberEditor: StoryFn<typeof meta> = args => {
  const [port, setPort] = useState('8443');
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>Port</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={port}
            onValueCommit={v => setPort(v as string)}
            data-testid='number'
          >
            <InlineEditPreview>{port}</InlineEditPreview>
            <InlineEditControl>
              <InlineEditNumber />
            </InlineEditControl>
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

/** `InlineEditTextarea` in isolation, with `lineClamp` on the preview. */
export const TextareaEditor: StoryFn<typeof meta> = args => {
  const [about, setAbout] = useState(
    'Displays a labeled value for a single object attribute. Used in detail panels, drawers and forms to present structured information.',
  );
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>About</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={about}
            onValueCommit={v => setAbout(v as string)}
            data-testid='textarea'
          >
            <InlineEditPreview lineClamp={3}>{about}</InlineEditPreview>
            <InlineEditControl>
              <InlineEditTextarea minRows={2} maxRows={6} />
            </InlineEditControl>
            <InlineEditError />
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

/** `InlineEditSelect` (single) in isolation. */
export const SelectEditor: StoryFn<typeof meta> = args => {
  const [role, setRole] = useState<string[]>(['editor']);
  const roleLabel = roleItems.find(i => i.value === (role[0] ?? ''))?.label ?? '';
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>Role</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={role}
            onValueCommit={v => setRole(v as string[])}
            data-testid='select'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>{roleLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <ChevronDown size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditSelect items={roleItems}>
                <SelectButton size='inline-edit' />
                <SelectPositioner>
                  <SelectContent>{renderSelectOptions(roleItems)}</SelectContent>
                </SelectPositioner>
              </InlineEditSelect>
            </InlineEditControl>
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

/** `InlineEditSelect` (multiple) in isolation. */
export const MultiSelectEditor: StoryFn<typeof meta> = args => {
  const [roles, setRoles] = useState<string[]>(['editor', 'viewer']);
  const rolesLabel = roles.map(v => roleItems.find(i => i.value === v)?.label ?? v).join(', ');
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>Roles</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={roles}
            onValueCommit={v => setRoles(v as string[])}
            data-testid='multi-select'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>{rolesLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <ChevronDown size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditSelect items={roleItems} multiple>
                <SelectButton size='inline-edit' />
                <SelectPositioner>
                  <SelectContent>{renderSelectOptions(roleItems)}</SelectContent>
                </SelectPositioner>
              </InlineEditSelect>
            </InlineEditControl>
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

/** `InlineEditSelect` (multiple) rendering its value as `Tag` chips. */
export const TagsEditor: StoryFn<typeof meta> = args => {
  const [tags, setTags] = useState<string[]>(['production', 'critical']);
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>Tags</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={tags}
            onValueCommit={v => setTags(v as string[])}
            data-testid='tags'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>
                <OverflowList
                  className='gap-4'
                  items={tags}
                  itemRenderer={tag => <Tag key={tag}>{tag}</Tag>}
                  overflowRenderer={renderOverflowPopover}
                />
              </InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <ChevronDown size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditSelect items={tagItems} multiple>
                <SelectInputTrigger />
                <SelectPositioner>
                  <SelectContent>{renderSelectOptions(tagItems)}</SelectContent>
                </SelectPositioner>
              </InlineEditSelect>
            </InlineEditControl>
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

/** `InlineEditDate` in isolation. */
export const DateEditor: StoryFn<typeof meta> = args => {
  const [date, setDate] = useState<DateValue | null>(new CalendarDate(2026, 6, 15));
  const dateLabel = date
    ? format(new Date(date.year, date.month - 1, date.day), 'd MMM, yyyy')
    : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={24}>
        <Attribute>
          <AttributeLabel>Date</AttributeLabel>
          <AttributeValue>
            <InlineEdit
              {...args}
              value={date}
              onValueCommit={v => setDate(v as DateValue | null)}
              data-testid='date'
            >
              <InlineEditPreview>
                <InlineEditPreviewValue>{dateLabel}</InlineEditPreviewValue>
                <InlineEditPreviewIcon>
                  <Calendar size='md' />
                </InlineEditPreviewIcon>
              </InlineEditPreview>
              <InlineEditControl>
                <InlineEditDate>
                  <CalendarTrigger>
                    <DateInputTrigger granularity='day' />
                  </CalendarTrigger>
                  <CalendarContent>
                    <CalendarBody>
                      <CalendarGrids />
                    </CalendarBody>
                  </CalendarContent>
                </InlineEditDate>
              </InlineEditControl>
            </InlineEdit>
          </AttributeValue>
        </Attribute>
      </DateFormatProvider>
    </div>
  );
};

/** `InlineEditTime` in isolation. */
export const TimeEditor: StoryFn<typeof meta> = args => {
  const [time, setTime] = useState<TimeValue | null>(new Time(14, 30));
  const timeLabel = time ? format(new Date(2000, 0, 1, time.hour, time.minute), 'h:mm a') : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={12}>
        <Attribute>
          <AttributeLabel>Time</AttributeLabel>
          <AttributeValue>
            <InlineEdit
              {...args}
              value={time}
              onValueCommit={v => setTime(v as TimeValue | null)}
              data-testid='time'
            >
              <InlineEditPreview>
                <InlineEditPreviewValue>{timeLabel}</InlineEditPreviewValue>
                <InlineEditPreviewIcon>
                  <Clock size='md' />
                </InlineEditPreviewIcon>
              </InlineEditPreview>
              <InlineEditControl>
                <InlineEditTime />
              </InlineEditControl>
            </InlineEdit>
          </AttributeValue>
        </Attribute>
      </DateFormatProvider>
    </div>
  );
};

/** `InlineEditDateTime` in isolation. */
export const DateTimeEditor: StoryFn<typeof meta> = args => {
  const [dateTime, setDateTime] = useState<CalendarDateTime | null>(
    new CalendarDateTime(2026, 6, 15, 14, 30),
  );
  const dateTimeLabel = dateTime
    ? format(
        new Date(dateTime.year, dateTime.month - 1, dateTime.day, dateTime.hour, dateTime.minute),
        'd MMM, yyyy h:mm a',
      )
    : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={12}>
        <Attribute>
          <AttributeLabel>Date &amp; Time</AttributeLabel>
          <AttributeValue>
            <InlineEdit
              {...args}
              value={dateTime}
              onValueCommit={v => setDateTime(v as CalendarDateTime | null)}
              data-testid='datetime'
            >
              <InlineEditPreview>
                <InlineEditPreviewValue>{dateTimeLabel}</InlineEditPreviewValue>
                <InlineEditPreviewIcon>
                  <Calendar size='md' />
                </InlineEditPreviewIcon>
              </InlineEditPreview>
              <InlineEditControl>
                <InlineEditDateTime>
                  <CalendarTrigger>
                    <DateInputTrigger granularity='minute' />
                  </CalendarTrigger>
                  <CalendarContent>
                    <CalendarBody>
                      <CalendarInputHeader />
                      <CalendarGrids />
                    </CalendarBody>
                  </CalendarContent>
                </InlineEditDateTime>
              </InlineEditControl>
            </InlineEdit>
          </AttributeValue>
        </Attribute>
      </DateFormatProvider>
    </div>
  );
};

/** Async-feedback status snapshots: loading, saved, and error. */
export const States: StoryFn<typeof meta> = args => (
  <div className='flex w-[420px] flex-col gap-12'>
    <Attribute>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <InlineEdit
          {...args}
          defaultValue='Checkout API and ABC'
          status='loading'
          data-testid='loading'
        >
          <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
        </InlineEdit>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <InlineEdit
          {...args}
          defaultValue='Checkout API and ABC'
          status='saved'
          data-testid='saved'
        >
          <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
        </InlineEdit>
      </AttributeValue>
    </Attribute>

    <Attribute>
      <AttributeLabel>Name</AttributeLabel>
      <AttributeValue>
        <InlineEdit
          {...args}
          defaultValue='Checkout API and ABC'
          defaultEdit
          status='error'
          data-testid='error'
        >
          <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
          <InlineEditError>An error message.</InlineEditError>
        </InlineEdit>
      </AttributeValue>
    </Attribute>
  </div>
);

export const Async: StoryFn<typeof meta> = args => {
  const [value, setValue] = useState('Checkout API');
  const save = (v: unknown) =>
    new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if ((v as string).trim().length === 0) reject(new Error('Name is required.'));
        else {
          setValue(v as string);
          resolve();
        }
      }, 1200);
    });
  return (
    <div className='w-[320px]'>
      <Attribute>
        <AttributeLabel>Name</AttributeLabel>
        <AttributeValue>
          <InlineEdit {...args} value={value} onValueCommit={save} data-testid='attr'>
            <InlineEditPreview>{value}</InlineEditPreview>
            <InlineEditControl>
              <InlineEditInput />
            </InlineEditControl>
            <InlineEditError />
          </InlineEdit>
        </AttributeValue>
      </Attribute>
    </div>
  );
};

export const NonEditable: StoryFn<typeof meta> = args => (
  <div className='flex w-[320px] flex-col gap-8'>
    <Attribute>
      <AttributeLabel>Read only</AttributeLabel>
      <AttributeValue>
        <InlineEdit {...args} defaultValue='Locked value' readOnly data-testid='readonly'>
          <InlineEditPreview>Locked value</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
        </InlineEdit>
      </AttributeValue>
    </Attribute>
    <Attribute>
      <AttributeLabel>Disabled</AttributeLabel>
      <AttributeValue>
        <InlineEdit {...args} defaultValue='Disabled value' disabled data-testid='disabled'>
          <InlineEditPreview>Disabled value</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
        </InlineEdit>
      </AttributeValue>
    </Attribute>
  </div>
);

export const ConfirmCommit: StoryFn<typeof meta> = args => {
  const [email, setEmail] = useState('dev@wallarm.com');
  const [role, setRole] = useState<string[]>(['editor']);
  const [pending, setPending] = useState<string | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  // Promise-based confirm: the guard returns this promise and the dialog
  // buttons settle it. The DS never closes the dialog — `settle` does.
  const confirmChange = (message: string) =>
    new Promise<boolean>(resolve => {
      resolverRef.current = resolve;
      setPending(message);
    });

  const settle = (ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setPending(null);
  };

  const roleLabel = roleItems.find(i => i.value === (role[0] ?? ''))?.label ?? '';

  return (
    <div className='flex w-[320px] flex-col gap-8'>
      <Attribute>
        <AttributeLabel>Email</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={email}
            onBeforeValueCommit={(next, prev) =>
              next === prev || confirmChange(`Change email to ${next as string}?`)
            }
            onValueCommit={v => setEmail(v as string)}
            data-testid='confirm-email'
          >
            <InlineEditPreview>{email}</InlineEditPreview>
            <InlineEditControl>
              <InlineEditInput type='email' aria-label='Email' />
            </InlineEditControl>
          </InlineEdit>
        </AttributeValue>
      </Attribute>

      <Attribute>
        <AttributeLabel>Role</AttributeLabel>
        <AttributeValue>
          <InlineEdit
            {...args}
            value={role}
            onBeforeValueCommit={(next, prev) => {
              // The guard fires on every popover close, including no-op ones —
              // short-circuit when nothing changed (for dates use `.compare()`).
              const nextRole = (next as string[]).join();
              if (nextRole === (prev as string[]).join()) return true;
              const label =
                roleItems.find(i => i.value === (next as string[])[0])?.label ?? nextRole;
              return confirmChange(`Change role to ${label}?`);
            }}
            onValueCommit={v => setRole(v as string[])}
            data-testid='confirm-role'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>{roleLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <ChevronDown size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditSelect items={roleItems}>
                <SelectButtonTrigger />
                <SelectPositioner>
                  <SelectContent>{renderSelectOptions(roleItems)}</SelectContent>
                </SelectPositioner>
              </InlineEditSelect>
            </InlineEditControl>
          </InlineEdit>
        </AttributeValue>
      </Attribute>

      <Dialog
        open={pending !== null}
        onOpenChange={open => {
          if (!open) settle(false);
        }}
        data-testid='confirm-dialog'
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm change</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>{pending}</Text>
          </DialogBody>
          <DialogFooter>
            <DialogFooterControls>
              <Button
                variant='ghost'
                color='neutral'
                size='large'
                onClick={() => settle(false)}
                data-testid='confirm-decline'
              >
                Cancel
              </Button>
              <Button
                variant='primary'
                color='brand'
                size='large'
                onClick={() => settle(true)}
                data-testid='confirm-accept'
              >
                Change
              </Button>
            </DialogFooterControls>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

ConfirmCommit.parameters = {
  docs: {
    description: {
      story:
        'The `onBeforeValueCommit` guard intercepts every commit before `onValueCommit` runs. ' +
        'Return a promise resolved by your own confirmation UI: `false` silently keeps the field ' +
        'in edit mode with the typed draft (no error state); any ' +
        'other result lets the commit proceed; a rejection maps to the error status. The guard ' +
        'fires for every commit path — Enter, blur, popover close — including no-op submits, so ' +
        'short-circuit on unchanged values (`next === prev`; use `.compare()` for date values ' +
        'and an item comparison for arrays). Declining a popover editor (the Role select here) ' +
        'leaves it parked in edit mode with the popover closed: reopen and re-close to be asked ' +
        'again, or press Escape inside the field to revert. The DS never closes your dialog — ' +
        'its own buttons must settle the promise and close it.',
    },
  },
};
