import figma from '@figma/code-connect';
import { Download } from '../../icons';
import { Field, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';

// WADS Components → File upload page.
const FILE_UPLOAD_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12403-10372';
const AREA_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12400-8762';
const ITEM_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12403-10197';

figma.connect(FileUpload, FILE_UPLOAD_URL, {
  variant: { Type: 'Area' },
  example: () => (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <FileUpload>
        <FileUploadDropzone />
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>
    </Field>
  ),
});

figma.connect(FileUpload, FILE_UPLOAD_URL, {
  variant: { Type: 'Button' },
  example: () => (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <FileUpload>
        <FileUploadTrigger />
      </FileUpload>
    </Field>
  ),
});

figma.connect(FileUploadDropzone, AREA_URL, {
  example: () => <FileUploadDropzone />,
});

figma.connect(FileUploadItem, ITEM_URL, {
  props: {
    loading: figma.enum('State', { Loading: true, Default: false }),
    description: figma.boolean('Description', { true: 'description', false: undefined }),
  },
  example: ({ loading, description }) => (
    <FileUploadItem file={{ name: 'file-name.format' }} loading={loading} description={description}>
      <FileUploadItemAction aria-label='Download file-name.format'>
        <Download />
      </FileUploadItemAction>
      <FileUploadItemDeleteTrigger />
    </FileUploadItem>
  ),
});
