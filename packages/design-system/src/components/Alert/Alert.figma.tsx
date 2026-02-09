import figma from '@figma/code-connect';
import { Button } from '../Button';
import { Alert } from './Alert';
import { AlertClose } from './AlertClose';
import { AlertContent } from './AlertContent';
import { AlertControls } from './AlertControls';
import { AlertDescription } from './AlertDescription';
import { AlertIcon } from './AlertIcon';
import { AlertTitle } from './AlertTitle';

const figmaNodeUrl =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=1584-1798';

// Primary variant
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    Type: 'Primary',
  },
  example: () => (
    <Alert color='primary'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
    </Alert>
  ),
});

// Destructive variant
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    Type: 'Destructive',
  },
  example: () => (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
    </Alert>
  ),
});

// Info variant
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    Type: 'Info',
  },
  example: () => (
    <Alert color='info'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
    </Alert>
  ),
});

// Warning variant
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    Type: 'Warning',
  },
  example: () => (
    <Alert color='warning'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
    </Alert>
  ),
});

// Success variant
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    Type: 'Success',
  },
  example: () => (
    <Alert color='success'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
    </Alert>
  ),
});

// With closable
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    Closable: true,
  },
  example: () => (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
      <AlertClose />
    </Alert>
  ),
});

// With top actions
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    'Top Actions': true,
  },
  example: () => (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
      </AlertContent>
      <AlertControls>
        <Button variant='secondary' color='destructive' size='small'>
          Button
        </Button>
        <Button variant='secondary' color='destructive' size='small'>
          Button
        </Button>
      </AlertControls>
    </Alert>
  ),
});

// With bottom actions
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    'Bottom Actions': true,
  },
  example: () => (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
        <AlertControls>
          <Button variant='secondary' color='destructive' size='small'>
            Button
          </Button>
          <Button variant='secondary' color='destructive' size='small'>
            Button
          </Button>
        </AlertControls>
      </AlertContent>
    </Alert>
  ),
});

// With code output
figma.connect(Alert, figmaNodeUrl, {
  variant: {
    'Code TBD': true,
  },
  example: () => (
    <Alert color='destructive'>
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Message goes here</AlertTitle>
        <AlertDescription>Description goes here</AlertDescription>
        <div className='pt-8'>
          <span className='font-mono font-medium text-xs leading-xs text-text-danger'>
            Optional code output
          </span>
        </div>
      </AlertContent>
    </Alert>
  ),
});
