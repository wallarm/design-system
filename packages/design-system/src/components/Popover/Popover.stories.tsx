import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Alert,
  AlertContent,
  AlertControls,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../Alert';
import { Button } from '../Button';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Popover } from './Popover';
import { PopoverContent } from './PopoverContent';
import { PopoverTrigger } from './PopoverTrigger';

const meta = {
  title: 'Overlay/Popover',
  component: Popover,
  subcomponents: { PopoverContent, PopoverTrigger },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Popover>;

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant='outline' color='neutral'>
        Click me
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      <VStack spacing={12}>
        <Text size='sm'>This action will remove all and every bit!</Text>

        <Alert color='warning'>
          <AlertIcon />
          <AlertContent>
            <AlertTitle>Message goes here</AlertTitle>
            <AlertDescription>
              {'Description goes here \nDescription goes here \nDescription goes here'}
            </AlertDescription>
            <AlertControls>
              <Button variant='secondary' color='neutral' size='small'>
                Button
              </Button>
              <Button variant='secondary' color='neutral' size='small'>
                Button
              </Button>
            </AlertControls>
          </AlertContent>
        </Alert>
      </VStack>
    </PopoverContent>
  </Popover>
);

export const MinMaxWidth: StoryFn<typeof meta> = () => (
  <VStack spacing={32}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Min Width
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Text size='xs' weight='medium'>
          Lorem Ipsum
        </Text>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Max Width
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Text size='xs' weight='medium'>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting, remaining essentially
          unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with desktop publishing software like Aldus
          PageMaker including versions of Lorem Ipsum. Why do we use it? It is a long established
          fact that a reader will be distracted by the readable content of a page when looking at
          its layout.
        </Text>
      </PopoverContent>
    </Popover>
  </VStack>
);

export const MinMaxHeight: StoryFn<typeof meta> = () => (
  <VStack spacing={32}>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Min Height
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Text size='xs' weight='medium'>
          Lorem Ipsum
        </Text>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' color='neutral'>
          Max Height
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <VStack spacing={12}>
          <Text size='xs' weight='medium'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type specimen book. It has
            survived not only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s with the release of
            Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
            publishing software like Aldus PageMaker including versions of Lorem Ipsum. Why do we
            use it? It is a long established fact that a reader will be distracted by the readable
            content of a page when looking at its layout. The point of using Lorem Ipsum is that it
            has a more-or-less normal distribution of letters, as opposed to using 'Content here,
            content here', making it look like readable English. Many desktop publishing packages
            and web page editors now use Lorem Ipsum as their default model text, and a search for
            'lorem ipsum' will uncover many web sites still in their infancy. Various versions have
            evolved over the years, sometimes by accident, sometimes on purpose (injected humour and
            the like). Where does it come from? Contrary to popular belief, Lorem Ipsum is not
            simply random text. It has roots in a piece of classical Latin literature from 45 BC,
            making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney
            College in Virginia, looked up one of the more obscure Latin words, consectetur, from a
            Lorem Ipsum passage, and going through the cites of the word in classical literature,
            discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33
            of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in
            45 BC. This book is a treatise on the theory of ethics, very popular during the
            Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a
            line in section 1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is
            reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus
            Bonorum et Malorum" by Cicero are also reproduced in their exact original form,
            accompanied by English versions from the 1914 translation by H. Rackham.
          </Text>

          <Text size='xs' weight='medium'>
            Where does it come from? Contrary to popular belief, Lorem Ipsum is not simply random
            text. It has roots in a piece of classical Latin literature from 45 BC, making it over
            2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in
            Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum
            passage, and going through the cites of the word in classical literature, discovered the
            undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus
            Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This
            book is a treatise on the theory of ethics, very popular during the Renaissance. The
            first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section
            1.10.32. The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for
            those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by
            Cicero are also reproduced in their exact original form, accompanied by English versions
            from the 1914 translation by H. Rackham.
          </Text>
        </VStack>
      </PopoverContent>
    </Popover>
  </VStack>
);
