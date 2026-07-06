import { useRef, useState } from 'react';
import type { TimeValue } from '@react-aria/datepicker';
import { format } from 'date-fns';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Calendar, ChevronDown, Clock } from '../../icons';
import type { DateValue } from '../../index';
import { CalendarDate, CalendarDateTime, Time } from '../../index';
import { Button } from '../Button';
import { DateFormatProvider } from '../DateFormatProvider';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogFooterControls,
  DialogHeader,
  DialogTitle,
} from '../Dialog';
import { Input } from '../Input';
import type { SelectDataItem } from '../Select';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { InlineEdit } from './InlineEdit';
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
  title: 'Data Display/InlineEdit',
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
          'The root manages the commit/cancel lifecycle, async commit with loading, saved, ' +
          'and error status, and submit-mode handling (enter, blur, both, or none).' +
          ' An optional `onBeforeValueCommit` guard intercepts every commit — return `false` ' +
          '(or a promise resolving to `false`) to keep the field in edit mode, e.g. after a ' +
          'declined confirmation dialog.',
      },
    },
  },
} satisfies Meta<typeof InlineEdit>;

export default meta;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-2'>
      <Text size='sm' color='secondary'>
        {label}
      </Text>
      {children}
    </div>
  );
}

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

/** `InlineEditInput` in isolation — the default text editor. */
export const TextEditor: StoryFn = () => {
  const [text, setText] = useState('Checkout API');
  return (
    <div className='w-[320px]'>
      <Row label='Name'>
        <InlineEdit value={text} onValueCommit={v => setText(v as string)} data-testid='text'>
          <InlineEditPreview data-analytics-id='inline-edit-name'>{text}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput data-analytics-id='inline-edit-name-input' aria-label='Name' />
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditNumber` in isolation. */
export const NumberEditor: StoryFn = () => {
  const [port, setPort] = useState('8443');
  return (
    <div className='w-[320px]'>
      <Row label='Port'>
        <InlineEdit value={port} onValueCommit={v => setPort(v as string)} data-testid='number'>
          <InlineEditPreview>{port}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditNumber />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditTextarea` in isolation, with `lineClamp` on the preview. */
export const TextareaEditor: StoryFn = () => {
  const [about, setAbout] = useState(
    'Displays a labeled value for a single object attribute. Used in detail panels, drawers and forms to present structured information.',
  );
  return (
    <div className='w-[320px]'>
      <Row label='About'>
        <InlineEdit value={about} onValueCommit={v => setAbout(v as string)} data-testid='textarea'>
          <InlineEditPreview lineClamp={3}>{about}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditTextarea minRows={2} maxRows={6} />
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditSelect` (single) in isolation. */
export const SelectEditor: StoryFn = () => {
  const [role, setRole] = useState<string[]>(['editor']);
  const roleLabel = roleItems.find(i => i.value === (role[0] ?? ''))?.label ?? '';
  return (
    <div className='w-[320px]'>
      <Row label='Role'>
        <InlineEdit value={role} onValueCommit={v => setRole(v as string[])} data-testid='select'>
          <InlineEditPreview>
            <InlineEditPreviewValue>{roleLabel}</InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
          <InlineEditControl>
            <InlineEditSelect items={roleItems} />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditSelect` (multiple) in isolation. */
export const MultiSelectEditor: StoryFn = () => {
  const [roles, setRoles] = useState<string[]>(['editor', 'viewer']);
  const rolesLabel = roles.map(v => roleItems.find(i => i.value === v)?.label ?? v).join(', ');
  return (
    <div className='w-[320px]'>
      <Row label='Roles'>
        <InlineEdit
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
            <InlineEditSelect items={roleItems} multiple />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditSelect` (multiple) rendering its value as `Tag` chips. */
export const TagsEditor: StoryFn = () => {
  const [tags, setTags] = useState<string[]>(['production', 'critical']);
  return (
    <div className='w-[320px]'>
      <Row label='Tags'>
        <InlineEdit value={tags} onValueCommit={v => setTags(v as string[])} data-testid='tags'>
          <InlineEditPreview>
            <InlineEditPreviewValue>
              <span className='flex gap-4'>
                {tags.map(v => (
                  <Tag key={v}>{v}</Tag>
                ))}
              </span>
            </InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
          <InlineEditControl>
            <InlineEditSelect items={tagItems} multiple />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditDate` in isolation. */
export const DateEditor: StoryFn = () => {
  const [date, setDate] = useState<DateValue | null>(new CalendarDate(2026, 6, 15));
  const dateLabel = date
    ? format(new Date(date.year, date.month - 1, date.day), 'd MMM, yyyy')
    : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={24}>
        <Row label='Date'>
          <InlineEdit
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
              <InlineEditDate />
            </InlineEditControl>
          </InlineEdit>
        </Row>
      </DateFormatProvider>
    </div>
  );
};

/** `InlineEditTime` in isolation. */
export const TimeEditor: StoryFn = () => {
  const [time, setTime] = useState<TimeValue | null>(new Time(14, 30));
  const timeLabel = time ? format(new Date(2000, 0, 1, time.hour, time.minute), 'h:mm a') : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={12}>
        <Row label='Time'>
          <InlineEdit
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
        </Row>
      </DateFormatProvider>
    </div>
  );
};

/** `InlineEditDateTime` in isolation. */
export const DateTimeEditor: StoryFn = () => {
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
        <Row label='Date & Time'>
          <InlineEdit
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
              <InlineEditDateTime />
            </InlineEditControl>
          </InlineEdit>
        </Row>
      </DateFormatProvider>
    </div>
  );
};

/** Async-feedback status snapshots: loading, saved, and error. */
export const States: StoryFn = () => (
  <div className='flex w-[420px] flex-col gap-12'>
    <Row label='Name'>
      <InlineEdit defaultValue='Checkout API and ABC' status='loading' data-testid='loading'>
        <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>
    </Row>

    <Row label='Name'>
      <InlineEdit defaultValue='Checkout API and ABC' status='saved' data-testid='saved'>
        <InlineEditPreview>Checkout API and ABC</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>
    </Row>

    <Row label='Name'>
      <InlineEdit
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
    </Row>
  </div>
);

export const Async: StoryFn = () => {
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
      <Row label='Name'>
        <InlineEdit value={value} onValueCommit={save} data-testid='attr'>
          <InlineEditPreview>{value}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput />
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};

export const NonEditable: StoryFn = () => (
  <div className='flex w-[320px] flex-col gap-8'>
    <Row label='Read only'>
      <InlineEdit defaultValue='Locked value' readOnly data-testid='readonly'>
        <InlineEditPreview>Locked value</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>
    </Row>
    <Row label='Disabled'>
      <InlineEdit defaultValue='Disabled value' disabled data-testid='disabled'>
        <InlineEditPreview>Disabled value</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>
    </Row>
  </div>
);

export const CustomEditor: StoryFn = () => {
  const [value, setValue] = useState('CHECKOUT API');
  return (
    <div className='w-[320px]'>
      <Row label='Custom editor (render-prop)'>
        <InlineEdit value={value} onValueCommit={v => setValue(v as string)} data-testid='custom'>
          <InlineEditPreview>{value}</InlineEditPreview>
          <InlineEditControl submitMode='both'>
            {({ value: draft, setValue: setDraft, submit, cancel }) => (
              <span className='flex items-center gap-4'>
                <Input
                  aria-label='Custom'
                  value={(draft as string) ?? ''}
                  onChange={e => setDraft(e.target.value.toUpperCase())}
                  className='h-28 px-8'
                />
                {/* preventDefault on mousedown keeps focus in the input, so
                    Safari's click-after-blur ordering cannot fire a blur
                    submit/cancel before the button's click lands. */}
                <Button
                  variant='primary'
                  color='brand'
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => submit()}
                  data-testid='custom-confirm'
                >
                  Save
                </Button>
                <Button
                  variant='ghost'
                  color='neutral'
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => cancel()}
                  data-testid='custom-cancel'
                >
                  Cancel
                </Button>
              </span>
            )}
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};

CustomEditor.parameters = {
  docs: {
    description: {
      story:
        'There are two ways to plug a custom editor into `InlineEditControl`. This story uses ' +
        'the render-prop path: pass a function as children to read `{ value, setValue }` (and ' +
        '`submit`/`cancel`) straight from the inline-edit context, and set `submitMode` on ' +
        '`InlineEditControl` itself since a plain render-prop cannot register its own mode. ' +
        'The alternative is the component path: extract the editor into its own component that ' +
        'calls `useInlineEdit()` for `{ value, setValue, submit }` and ' +
        '`useInlineEditSubmitMode(mode)` to register its commit mode — the pattern used by the ' +
        'built-in editors (`InlineEditInput`, `InlineEditSelect`, etc.) and the better fit for ' +
        'popover-style editors (like a select or calendar) that commit on their own close event ' +
        'rather than on blur or Enter.' +
        ' Custom confirm/cancel buttons should call `e.preventDefault()` in `onMouseDown`: it ' +
        'keeps focus in the input, so browsers that do not focus buttons on mousedown (Safari, ' +
        'macOS Firefox) cannot fire a blur submit/cancel before the click lands.',
    },
  },
};

export const ConfirmCommit: StoryFn = () => {
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
      <Row label='Email'>
        <InlineEdit
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
      </Row>

      <Row label='Role'>
        <InlineEdit
          value={role}
          onBeforeValueCommit={(next, prev) => {
            // The guard fires on every popover close, including no-op ones —
            // short-circuit when nothing changed (for dates use `.compare()`).
            const nextRole = (next as string[]).join();
            if (nextRole === (prev as string[]).join()) return true;
            const label = roleItems.find(i => i.value === (next as string[])[0])?.label ?? nextRole;
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
            <InlineEditSelect items={roleItems} />
          </InlineEditControl>
        </InlineEdit>
      </Row>

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
