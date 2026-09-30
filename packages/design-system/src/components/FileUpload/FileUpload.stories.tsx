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
  'Attaches files to a form: drop them on an Area or pick them with a button, and the type and size are checked before anything is sent.',
  'Picking never uploads — files are held until the form is saved, and the product marks a row `loading` while it sends it. Reach for `Input` instead when the value is a path or URL, not a file.',
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

/** The drop Area — the picker to use when attaching a file is the main task. Click anywhere or drop. */
export const Basic: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args}>
    <FileUploadDropzone data-analytics-id='FILE_UPLOAD_DROPZONE' />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** The compact picker for tight spaces — the same behaviour behind a "Select file" button. */
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

/** With `maxFiles` above one the picker stays, and each file stacks below it. */
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

/** One file allowed and chosen: the picker hides, and Replace in the row swaps the file. */
export const SingleFileChosen: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** A second line on the row for size and status — here, that the file goes with the form. */
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

/** A row marked `loading` dims and spins, and the picker locks until it finishes; X cancels. */
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

/** Read-only: the picker, Replace and Delete go away; a Download action stays. */
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

/** A file already on the server is a row too — described by name and size, with Download and Detach. */
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

/** Nothing uploads on pick: the file travels with the form's `FormData` under `name` when it is submitted. */
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
    <form onSubmit={onSubmit} className='flex flex-col gap-12'>
      <Field required>
        <FieldLabel>
          Artifact
          <FieldIndicator />
        </FieldLabel>
        <FileUpload data-testid='file-upload' name='artifact' {...args}>
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
