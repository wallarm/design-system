import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { CircleDashed } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import {
  CodeSnippetActions,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetRoot,
} from '../CodeSnippet';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { Input } from '../Input';
import { HStack, VStack } from '../Stack';
import { Card, type CardProps } from './Card';
import { CardContent } from './CardContent';
import { CardFooter } from './CardFooter';
import { CardHeader } from './CardHeader';
import { CardTitle } from './CardTitle';

const meta = {
  title: 'Data Display/Card',
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card component for displaying titled content blocks. ' +
          'Supports primary and secondary color variants. ' +
          'Use compound components: CardHeader, CardTitle, CardContent, CardFooter.',
      },
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
      value: 'primary',
    },
    disabled: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
    children: {
      control: false,
    },
    ref: {
      control: false,
    },
    onClick: {
      control: false,
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

export const Basic: StoryFn<CardProps> = ({ ...args }) => (
  <Card onClick={() => console.log('Card clicked')} {...args}>
    <CardHeader>
      <CardTitle>Card title</CardTitle>
      <Badge size='medium' type='solid' color='slate'>
        Badge
      </Badge>
    </CardHeader>
    <CardContent>Card description</CardContent>
    <CardFooter>
      <Button
        variant='secondary'
        size='small'
        color='neutral'
        onClick={() => console.log('Card`s button clicked')}
      >
        Button
      </Button>
    </CardFooter>
  </Card>
);

export const Variants: StoryFn<CardProps> = () => (
  <VStack gap={24} align='center'>
    <HStack gap={16} align='center'>
      <Card color='primary'>
        <CardHeader>
          <CardTitle>Primary card</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>This is a primary card variant</CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>

      <Card color='secondary'>
        <CardHeader>
          <CardTitle>Secondary card</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>This is a secondary card variant</CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>
    </HStack>

    <HStack gap={16} align='center'>
      <Card color='primary' onClick={() => console.log('Primary card clicked')}>
        <CardHeader>
          <CardTitle>Primary card</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>This is a primary card variant with onClick event</CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>

      <Card color='secondary' onClick={() => console.log('Secondary card clicked')}>
        <CardHeader>
          <CardTitle>Secondary card</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>This is a secondary card variant with onClick event</CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>
    </HStack>

    <HStack gap={16} align='center'>
      <Card color='primary' disabled onClick={() => console.log('Primary card clicked')}>
        <CardHeader>
          <CardTitle>Primary card</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>This is a disabled primary card variant</CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>

      <Card color='secondary' disabled onClick={() => console.log('Secondary card clicked')}>
        <CardHeader>
          <CardTitle>Secondary card</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>This is a disabled secondary card variant</CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>
    </HStack>
  </VStack>
);

export const VariousContent: StoryFn<CardProps> = () => (
  <HStack gap={16}>
    <VStack gap={16} align='stretch'>
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <Badge size='medium' type='solid' color='slate'>
            Badge
          </Badge>
        </CardHeader>
        <CardContent>
          Card description Very long! Even if it goes to the second line, it won't break anything.
          It works perfectly! Can you see? Amazing yeah?
        </CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeSnippetRoot code='npx wasd-new@latest add code-snippet' language='bash'>
            <CodeSnippetActions>
              <CodeSnippetCopyButton />
            </CodeSnippetActions>
            <CodeSnippetContent>
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </CardContent>
        <CardFooter>
          <Button variant='secondary' size='small' color='neutral'>
            Button
          </Button>
        </CardFooter>
      </Card>
    </VStack>

    <Card>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <Badge size='medium' type='solid' color='slate'>
          Badge
        </Badge>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel>Label</FieldLabel>
          <Input placeholder='Placeholder' />
          <FieldDescription>Input description</FieldDescription>
        </Field>
      </CardContent>
      <CardFooter>
        <Button variant='secondary' size='small' color='neutral'>
          Button
        </Button>
      </CardFooter>
    </Card>

    <VStack gap={16}>
      <Card>
        <CardHeader>
          <CardTitle icon={<CircleDashed />}>Card title</CardTitle>
        </CardHeader>
        <CardContent>Card description.</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle icon={<CircleDashed />}>Card title</CardTitle>
        </CardHeader>
      </Card>
    </VStack>
  </HStack>
);
