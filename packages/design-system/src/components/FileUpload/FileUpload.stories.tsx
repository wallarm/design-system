import { type FormEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Download } from '../../icons';
import { Button } from '../Button';
import { Field, FieldDescription, FieldError, FieldIndicator, FieldLabel } from '../Field';
import { FileUpload, type FileUploadProps } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';
import { formatFileSize } from './lib';

const DESCRIPTION = [
  'Attaches files to a form and checks their type, size and count before accepting them — the drop Area when attaching is the main task on the screen, the "Select file" button when space is tight.',
  'Picking never uploads: files travel with the form when it is saved, and the product marks a row `loading` while it sends one.',
].join(' ');

const MB = 1024 ** 2;
const sample = (name: string, size = 48 * 1024) => new File([new Uint8Array(size)], name);

const Rows = () => (
  <FileUploadItemGroup>
    {file => (
      <FileUploadItem file={file}>
        <FileUploadItemReplaceTrigger />
        <FileUploadItemDeleteTrigger />
      </FileUploadItem>
    )}
  </FileUploadItemGroup>
);

const meta = {
  title: 'Inputs/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  args: { maxFiles: 1, disabled: false, readOnly: false, error: false },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    onFileReject: { control: false },
    validate: { control: false },
    ref: { control: false },
    maxFiles: { control: 'number' },
    maxFileSize: { control: 'number' },
    accept: { control: 'text' },
  },
  decorators: [
    Story => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUpload>;

export default meta;

/** The drop Area: click anywhere on it or drop files onto it, and from the keyboard Tab reaches it and Enter opens the file dialog. */
export const Basic: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args}>
    <FileUploadDropzone data-analytics-id='FILE_UPLOAD_DROPZONE' />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** The same picking and checks behind a "Select file" button that hugs its label, for when a 96px Area would crowd the form. */
export const ButtonTrigger: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args}>
    <FileUploadTrigger />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** Inside `Field`: the label names the Area, and the description carries the format and the limit. */
export const InField: StoryFn<FileUploadProps> = args => (
  <Field required data-testid='field'>
    <FieldLabel>
      WASM module
      <FieldIndicator />
    </FieldLabel>
    <FieldDescription>
      Exports memory, spe_alloc, spe_free, spe_init, spe_on_phase · up to 32 MB
    </FieldDescription>
    <FileUpload data-testid='file-upload' accept='.wasm' maxFileSize={32 * MB} {...args}>
      <FileUploadDropzone>Choose a .wasm module or drop it here</FileUploadDropzone>
      <FileUploadError />
      <Rows />
    </FileUpload>
  </Field>
);

/** With `maxFiles` above one the picker stays and disables once the limit is reached, while each file stacks below it as its own row. */
export const Multiple: StoryFn<FileUploadProps> = args => (
  <FileUpload
    data-testid='file-upload'
    {...args}
    maxFiles={5}
    defaultValue={[sample('rules.lua'), sample('headers.lua')]}
  >
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** One file allowed and chosen: the file shows below the picker, and a new pick, or Replace in the row, swaps it. */
export const SingleFileChosen: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** `description` adds a second line to the row for size or status — here, that the file goes with the form. */
export const WithDescription: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem
          file={file}
          description={`${formatFileSize(file.size)} · uploads when you save`}
        >
          <FileUploadItemReplaceTrigger />
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
  </FileUpload>
);

/** A row marked `loading` dims and shows a spinner, and the picker locks until no row is loading; its X becomes "Cancel upload", and stopping the request is up to the product. */
export const Uploading: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} maxFiles={5} defaultValue={[sample('rules.lua')]}>
    <FileUploadDropzone />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem file={file}>
          <FileUploadItemReplaceTrigger />
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
    <FileUploadItemGroup>
      <FileUploadItem file={{ name: 'headers.lua' }} loading>
        <FileUploadItemDeleteTrigger />
      </FileUploadItem>
    </FileUploadItemGroup>
  </FileUpload>
);

/** Only `.so` / `.dylib` up to 32 KB: anything else is refused inline, naming the file and the rule. */
export const Validation: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} accept='.so,.dylib' maxFileSize={32 * 1024}>
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** Disabled: nothing responds, and the Area and the row actions dim. */
export const Disabled: StoryFn<FileUploadProps> = args => (
  <div className='flex flex-col gap-16'>
    <FileUpload data-testid='file-upload' {...args} disabled>
      <FileUploadDropzone />
    </FileUpload>
    <FileUpload {...args} disabled defaultValue={[sample('policy.wasm')]}>
      <Rows />
    </FileUpload>
  </div>
);

/** Read-only removes the picker, Replace and Delete, while a custom `FileUploadItemAction` such as Download stays. */
export const ReadOnly: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} readOnly defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem file={file}>
          <FileUploadItemReplaceTrigger />
          <FileUploadItemAction aria-label={`Download ${file.name}`}>
            <Download />
          </FileUploadItemAction>
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
  </FileUpload>
);

/** A file already on the server is a row too: `FileUploadItem` works outside `FileUpload` from a name and size, and its actions only run your `onClick`. */
export const StoredFile: StoryFn<FileUploadProps> = () => (
  <FileUploadItemGroup data-testid='stored'>
    <FileUploadItem file={{ name: 'policy.wasm', size: 48 * 1024 }} description='48 KB · attached'>
      <FileUploadItemAction aria-label='Download policy.wasm'>
        <Download />
      </FileUploadItemAction>
      <FileUploadItemDeleteTrigger aria-label='Detach artifact' />
    </FileUploadItem>
  </FileUploadItemGroup>
);

/** Long names truncate; hover shows the full name. */
export const LongFileName: StoryFn<FileUploadProps> = args => (
  <FileUpload
    data-testid='file-upload'
    {...args}
    defaultValue={[
      sample('flow-policy-artifact-for-the-production-edge-cluster-eu-central-1.wasm'),
    ]}
  >
    <Rows />
  </FileUpload>
);

/** Nothing uploads on pick: the file travels in the form's `FormData` under `name`, and an empty submit of a required Field shows its error. */
export const FormSubmission: StoryFn<FileUploadProps> = args => {
  const [submitted, setSubmitted] = useState<string>('');
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get('artifact');
    setSubmitted(
      file instanceof File && file.name ? `${file.name} (${formatFileSize(file.size)})` : 'nothing',
    );
  };
  return (
    <form onSubmit={onSubmit} noValidate className='flex flex-col gap-12'>
      <Field required invalid={submitted === 'nothing'}>
        <FieldLabel>
          Artifact
          <FieldIndicator />
        </FieldLabel>
        <FileUpload
          data-testid='file-upload'
          name='artifact'
          {...args}
          onValueChange={() => setSubmitted('')}
        >
          <FileUploadTrigger />
          <Rows />
        </FileUpload>
        {submitted === 'nothing' ? <FieldError>Attach a file</FieldError> : null}
      </Field>
      <Button type='submit' variant='outline' color='neutral' data-testid='submit'>
        Save
      </Button>
      {submitted && submitted !== 'nothing' ? (
        <p className='sb-annotation' data-testid='submitted'>
          Submitted: {submitted}
        </p>
      ) : null}
    </form>
  );
};
