import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Avatar, AvatarFallback, AvatarImage, AvatarOverlay } from '../../components/Avatar';
import { Breadcrumbs, BreadcrumbsItem } from '../../components/Breadcrumbs';
import { Button } from '../../components/Button';
import { Field, FieldError, FieldLabel } from '../../components/Field';
import { FileUpload, FileUploadTrigger, useFilePreviewUrl } from '../../components/FileUpload';
import { Heading } from '../../components/Heading';
import { Input } from '../../components/Input';
import { Page, PageContent, PageHeader, PageHeaderGroup, PageTitle } from '../../components/Page';
import {
  Radio,
  RadioDescription,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
} from '../../components/Radio';
import { SegmentedControl, SegmentedControlItem } from '../../components/SegmentedControl';
import {
  createListCollection,
  Select,
  SelectContent,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../components/Select';
import { Separator } from '../../components/Separator';
import { Switch, SwitchControl } from '../../components/Switch';
import { Text } from '../../components/Text';
import { useToast } from '../../components/Toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/Tooltip';
import { Lock } from '../../icons';

interface Profile {
  name: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  sidebarStyle: string;
  theme: string;
  weeklyReport: boolean;
}

const PROFILE: Profile = {
  name: 'Maria Lopez',
  timezone: 'Europe/Madrid',
  dateFormat: 'iso',
  timeFormat: '24h',
  sidebarStyle: 'neutral',
  theme: 'light',
  weeklyReport: true,
};

const EMAIL = 'maria.lopez@acme-bank.com';

const TIMEZONES = [
  { label: '(UTC−08:00) Los Angeles', value: 'America/Los_Angeles' },
  { label: '(UTC−05:00) New York', value: 'America/New_York' },
  { label: '(UTC+00:00) London', value: 'Europe/London' },
  { label: '(UTC+01:00) Madrid', value: 'Europe/Madrid' },
  { label: '(UTC+04:00) Dubai', value: 'Asia/Dubai' },
  { label: '(UTC+08:00) Singapore', value: 'Asia/Singapore' },
];

// Your app builds these labels from the current date; fixed here for stable screenshots.
const DATE_FORMATS = [
  { label: '2026-11-05', value: 'iso' },
  { label: '05/11/2026', value: 'dmy' },
  { label: '11/05/2026', value: 'mdy' },
  { label: '5 Nov 2026', value: 'medium' },
];

const onSaveProfile = fn().mockName('onSaveProfile');
const onEditEmail = fn().mockName('onEditEmail');
const onChangePassword = fn().mockName('onChangePassword');
const onDeleteAccount = fn().mockName('onDeleteAccount');

const handleEmailKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') onEditEmail();
};

const meta = {
  title: 'Patterns/Settings page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a page of independent settings (profile, preferences, appearance) where each value saves on its own and a toast confirms it.',
      },
    },
  },
  // The host shell gives a page its height; 640px stands in for it.
  decorators: [
    Story => (
      <div className='h-640'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

/**
 * Settings › Profile: About, Preferences, Appearance, Security and the danger zone in one
 * left-aligned 640px column. Text saves on blur, choices on change, and every save shows a
 * "<Label> updated" toast. Email and password open dialogs; two-factor is locked by the org.
 */
export const Default: StoryFn = () => {
  const toast = useToast();
  const [profile, setProfile] = useState(PROFILE);
  const [name, setName] = useState(PROFILE.name);
  const [nameError, setNameError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const photo = useFilePreviewUrl(photos[0]);

  const timezones = createListCollection({ items: TIMEZONES });
  const dateFormats = createListCollection({ items: DATE_FORMATS });

  const save = async (patch: Partial<Profile>, label: string) => {
    setProfile({ ...profile, ...patch });
    try {
      await onSaveProfile(patch);
      toast.create({ title: `${label} updated`, type: 'success' });
    } catch {
      toast.create({ title: `${label} update failed`, type: 'error' });
    }
  };

  const handlePhotoChange = (files: File[]) => {
    setPhotos(files);
    toast.create({ title: 'Photo updated', type: 'success' });
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError('');
  };

  const handleNameBlur = () => {
    const value = name.trim();
    if (!value) {
      setNameError('Enter your name');
      return;
    }
    if (value !== profile.name) save({ name: value }, 'Name');
  };

  const handleTimezoneChange = ({ value }: { value: string[] }) =>
    save({ timezone: value[0] }, 'Timezone');
  const handleDateFormatChange = ({ value }: { value: string[] }) =>
    save({ dateFormat: value[0] }, 'Date format');
  const handleTimeFormatChange = (value: string) => save({ timeFormat: value }, 'Time format');
  const handleWeeklyReportChange = ({ checked }: { checked: boolean }) =>
    save({ weeklyReport: checked }, 'Weekly report');
  const handleSidebarStyleChange = (value: string) =>
    save({ sidebarStyle: value }, 'Sidebar style');
  const handleThemeChange = ({ value }: { value: string | null }) => {
    if (value) save({ theme: value }, 'Theme');
  };

  return (
    <Page name='settings-profile' fullSize fixedHeight data-testid='profile-page'>
      <PageHeader className='flex-wrap gap-y-6'>
        <Breadcrumbs className='basis-full -ml-4'>
          <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
          <BreadcrumbsItem>Profile</BreadcrumbsItem>
        </Breadcrumbs>
        <PageHeaderGroup>
          <PageTitle>Profile</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <div className='flex max-w-[640px] flex-col gap-16'>
          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              About
            </Heading>
            <div className='flex flex-col'>
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Photo
                </Text>
                <FileUpload
                  accept='image/png,image/jpeg,image/webp'
                  maxFileSize={512 * 1024}
                  value={photos}
                  onValueChange={handlePhotoChange}
                  className='w-auto'
                  data-testid='profile-photo'
                >
                  <FileUploadTrigger asChild>
                    <Avatar as='button' aria-label='Change photo'>
                      <AvatarImage src={photo} />
                      <AvatarFallback name={profile.name} />
                      <AvatarOverlay />
                    </Avatar>
                  </FileUploadTrigger>
                </FileUpload>
              </div>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Name</FieldLabel>
                <div className='flex w-[320px] shrink-0 flex-col gap-4'>
                  <Input
                    value={name}
                    error={!!nameError}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    data-testid='profile-name'
                  />
                  {nameError && <FieldError>{nameError}</FieldError>}
                </div>
              </Field>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Email</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Input
                    readOnly
                    value={EMAIL}
                    onClick={onEditEmail}
                    onKeyDown={handleEmailKeyDown}
                    data-testid='profile-email'
                  />
                </div>
              </Field>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Preferences
            </Heading>
            <div className='flex flex-col'>
              <Field orientation='horizontal'>
                <FieldLabel>Timezone</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Select
                    collection={timezones}
                    value={[profile.timezone]}
                    onValueChange={handleTimezoneChange}
                    data-testid='profile-timezone'
                  >
                    <SelectInput className='w-full' />
                    <SelectPositioner>
                      <SelectContent>
                        {timezones.items.map(item => (
                          <SelectOption key={item.value} item={item}>
                            <SelectOptionText>{item.label}</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </div>
              </Field>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Date format</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Select
                    collection={dateFormats}
                    value={[profile.dateFormat]}
                    onValueChange={handleDateFormatChange}
                    data-testid='profile-date-format'
                  >
                    <SelectInput className='w-full' />
                    <SelectPositioner>
                      <SelectContent>
                        {dateFormats.items.map(item => (
                          <SelectOption key={item.value} item={item}>
                            <SelectOptionText>{item.label}</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </div>
              </Field>
              <Separator spacing={16} />
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Time format
                </Text>
                <SegmentedControl
                  aria-label='Time format'
                  value={profile.timeFormat}
                  onChange={handleTimeFormatChange}
                  data-testid='profile-time-format'
                >
                  <SegmentedControlItem value='12h'>12-hour</SegmentedControlItem>
                  <SegmentedControlItem value='24h'>24-hour</SegmentedControlItem>
                </SegmentedControl>
              </div>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Weekly attack summary email</FieldLabel>
                <Switch
                  checked={profile.weeklyReport}
                  onCheckedChange={handleWeeklyReportChange}
                  data-testid='profile-weekly-report'
                >
                  <SwitchControl />
                </Switch>
              </Field>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading id='appearance-heading' as='h2' size='xl' weight='medium' color='primary'>
              Appearance
            </Heading>
            <div className='flex flex-col'>
              <RadioGroup
                variant='card'
                name='theme'
                aria-labelledby='appearance-heading'
                value={profile.theme}
                onValueChange={handleThemeChange}
              >
                <div className='grid grid-cols-3 gap-8' data-testid='profile-theme'>
                  <Radio value='light'>
                    <RadioIndicator />
                    <RadioLabel>Light</RadioLabel>
                    <RadioDescription>Bright surfaces for daytime work</RadioDescription>
                  </Radio>
                  <Radio value='dark'>
                    <RadioIndicator />
                    <RadioLabel>Dark</RadioLabel>
                    <RadioDescription>Dim surfaces for a SOC at night</RadioDescription>
                  </Radio>
                  <Radio value='system'>
                    <RadioIndicator />
                    <RadioLabel>System</RadioLabel>
                    <RadioDescription>Follows your operating system</RadioDescription>
                  </Radio>
                </div>
              </RadioGroup>
              <Separator spacing={16} />
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Sidebar style
                </Text>
                <SegmentedControl
                  aria-label='Sidebar style'
                  value={profile.sidebarStyle}
                  onChange={handleSidebarStyleChange}
                  data-testid='profile-sidebar-style'
                >
                  <SegmentedControlItem value='neutral'>Neutral</SegmentedControlItem>
                  <SegmentedControlItem value='branded'>Branded</SegmentedControlItem>
                </SegmentedControl>
              </div>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Security
            </Heading>
            <div className='flex flex-col'>
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Password
                </Text>
                <Button
                  variant='outline'
                  color='neutral'
                  onClick={onChangePassword}
                  data-testid='profile-change-password'
                >
                  Change password
                </Button>
              </div>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Two-factor authentication</FieldLabel>
                <div className='flex items-center gap-8'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock aria-label='Locked' />
                    </TooltipTrigger>
                    <TooltipContent>Enabled by your organization</TooltipContent>
                  </Tooltip>
                  <Switch checked disabled data-testid='profile-two-factor'>
                    <SwitchControl />
                  </Switch>
                </div>
              </Field>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Danger zone
            </Heading>
            <div className='flex flex-col'>
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <div className='max-w-[320px]'>
                  <Text size='sm' color='secondary'>
                    Deletes your account and signs you out. Your organization's data stays.
                  </Text>
                </div>
                <Button
                  color='destructive'
                  onClick={onDeleteAccount}
                  data-testid='profile-delete-account'
                >
                  Delete account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PageContent>
    </Page>
  );
};

/**
 * An invalid value: the message sits inside the 320px wrapper under the input, nothing saves and
 * no toast fires. The typed value stays until the user fixes it.
 */
export const InvalidValue: StoryFn = () => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('Enter your name');

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setNameError('');
  };

  const handleNameBlur = () => {
    if (!name.trim()) setNameError('Enter your name');
  };

  return (
    <Page name='settings-profile' fullSize fixedHeight data-testid='profile-page'>
      <PageHeader className='flex-wrap gap-y-6'>
        <Breadcrumbs className='basis-full -ml-4'>
          <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
          <BreadcrumbsItem>Profile</BreadcrumbsItem>
        </Breadcrumbs>
        <PageHeaderGroup>
          <PageTitle>Profile</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <div className='flex max-w-[640px] flex-col gap-16'>
          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              About
            </Heading>
            <div className='flex flex-col'>
              <Field orientation='horizontal'>
                <FieldLabel>Name</FieldLabel>
                <div className='flex w-[320px] shrink-0 flex-col gap-4'>
                  <Input
                    value={name}
                    error={!!nameError}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    data-testid='profile-name'
                  />
                  {nameError && <FieldError>{nameError}</FieldError>}
                </div>
              </Field>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Email</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Input
                    readOnly
                    value={EMAIL}
                    onClick={onEditEmail}
                    onKeyDown={handleEmailKeyDown}
                    data-testid='profile-email'
                  />
                </div>
              </Field>
            </div>
          </section>
        </div>
      </PageContent>
    </Page>
  );
};

/**
 * Saving: a select and a switch stay disabled until the request ends, and a button action shows
 * its loading state. The rest of the page stays usable.
 */
export const Saving: StoryFn = () => {
  const timezones = createListCollection({ items: TIMEZONES });

  return (
    <Page name='settings-profile' fullSize fixedHeight data-testid='profile-page'>
      <PageHeader className='flex-wrap gap-y-6'>
        <Breadcrumbs className='basis-full -ml-4'>
          <BreadcrumbsItem href='/settings'>Settings</BreadcrumbsItem>
          <BreadcrumbsItem>Profile</BreadcrumbsItem>
        </Breadcrumbs>
        <PageHeaderGroup>
          <PageTitle>Profile</PageTitle>
        </PageHeaderGroup>
      </PageHeader>

      <PageContent>
        <div className='flex max-w-[640px] flex-col gap-16'>
          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Preferences
            </Heading>
            <div className='flex flex-col'>
              <Field orientation='horizontal'>
                <FieldLabel>Timezone</FieldLabel>
                <div className='w-[320px] shrink-0'>
                  <Select
                    collection={timezones}
                    defaultValue={['Asia/Singapore']}
                    disabled
                    data-testid='profile-timezone'
                  >
                    <SelectInput className='w-full' />
                    <SelectPositioner>
                      <SelectContent>
                        {timezones.items.map(item => (
                          <SelectOption key={item.value} item={item}>
                            <SelectOptionText>{item.label}</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                </div>
              </Field>
              <Separator spacing={16} />
              <Field orientation='horizontal'>
                <FieldLabel>Weekly attack summary email</FieldLabel>
                <Switch checked disabled data-testid='profile-weekly-report'>
                  <SwitchControl />
                </Switch>
              </Field>
              <Separator spacing={16} />
            </div>
          </section>

          <section className='flex flex-col gap-16'>
            <Heading as='h2' size='xl' weight='medium' color='primary'>
              Security
            </Heading>
            <div className='flex flex-col'>
              <div className='flex min-h-36 items-center justify-between gap-16'>
                <Text size='sm' weight='medium' color='primary'>
                  Active sessions
                </Text>
                <Button
                  variant='outline'
                  color='neutral'
                  loading
                  data-testid='profile-sign-out-sessions'
                >
                  Sign out of all sessions
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PageContent>
    </Page>
  );
};
