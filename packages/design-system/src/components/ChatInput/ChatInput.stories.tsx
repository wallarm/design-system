import { type MouseEvent, useState } from 'react';

import type { Meta, StoryFn } from 'storybook-react-rsbuild';

import { Quote } from '../../icons';
import { Badge } from '../Badge';
import {
  ChatPermissions,
  ChatPermissionsContent,
  ChatPermissionsItem,
  type ChatPermissionsItemCheckedChangeDetails,
  ChatPermissionsTrigger,
} from '../ChatPermissions';
import { TagClose } from '../Tag';
import { ChatInput, ChatInputSubmit, ChatInputTextarea } from './index';

const DESCRIPTION = [
  'The composer at the bottom of the Wally chat: a growing textarea where Enter sends and Shift+Enter adds a line, with the send button turning into Stop while a reply streams.',
  'It is controlled — the app owns the draft and the running state — and any actions such as `ChatPermissions` go between the textarea and `ChatInputSubmit`.',
].join(' ');

const meta = {
  title: 'AI/ChatInput',
  component: ChatInput,
  subcomponents: { ChatInputTextarea, ChatInputSubmit },
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
} satisfies Meta<typeof ChatInput>;

export default meta;

/**
 * Empty and ready: Send stays disabled until there is something other than whitespace to send.
 * The app owns the draft: sending starts a "response", Stop or Esc ends it.
 */
export const Default: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = () => {
    setValue('');
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        value={value}
        onValueChange={setValue}
        isRunning={isRunning}
        onSubmit={handleSubmit}
        onStop={handleStop}
      >
        <ChatInputTextarea />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
};

/** A multi-line draft — the textarea grows with its content up to eight lines, then scrolls. */
export const Typing: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState(
    'Why was 203.0.113.42 blocked yesterday?\nShow the attacks it sent\nand the rule that matched them.',
  );
  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = () => {
    setValue('');
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        value={value}
        onValueChange={setValue}
        isRunning={isRunning}
        onSubmit={handleSubmit}
        onStop={handleStop}
      >
        <ChatInputTextarea />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
};

/** While a reply streams the button becomes Stop; its tooltip mentions that Esc in the textarea does the same. */
export const Streaming: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [isRunning, setIsRunning] = useState(true);

  const handleSubmit = () => {
    setValue('');
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        value={value}
        onValueChange={setValue}
        isRunning={isRunning}
        onSubmit={handleSubmit}
        onStop={handleStop}
      >
        <ChatInputTextarea />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
};

/** Disabled as a whole, e.g. while the assistant is unavailable. */
export const Disabled: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('Draft kept');

  const handleSubmit = () => {
    setValue('');
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        disabled
        value={value}
        onValueChange={setValue}
        onSubmit={handleSubmit}
      >
        <ChatInputTextarea />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
};

/** Attached context sits in a blue bar behind the box; pass `context` only when there are chips. */
export const WithContext: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [chips, setChips] = useState(['Attacks', 'Incidents']);

  const handleContextRemove = (event: MouseEvent<HTMLButtonElement>) => {
    const chip = event.currentTarget.value;
    setChips(prev => prev.filter(item => item !== chip));
  };

  const handleSubmit = () => {
    setValue('');
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        value={value}
        onValueChange={setValue}
        onSubmit={handleSubmit}
        context={chips.map(chip => (
          <Badge key={chip} type='secondary' color='blue' data-testid={`context-${chip}`}>
            <Quote />
            {chip}
            <TagClose
              aria-label={`Remove ${chip}`}
              value={chip}
              className='rounded-4 focus-visible:ring-3 focus-visible:ring-focus-primary'
              onClick={handleContextRemove}
            />
          </Badge>
        ))}
      >
        <ChatInputTextarea />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
};

/** `ChatPermissions` goes between the textarea and the submit, on the second row. */
export const WithSettings: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');
  const [allowed, setAllowed] = useState({ search_attacks: true, propose_add_to_denylist: true });

  const handlePermissionChange = ({ checked, name }: ChatPermissionsItemCheckedChangeDetails) => {
    setAllowed(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    setValue('');
  };

  return (
    <div className='flex h-[320px] items-end'>
      <div className='w-[400px]'>
        <ChatInput
          data-testid='chat-input'
          value={value}
          onValueChange={setValue}
          onSubmit={handleSubmit}
        >
          <ChatInputTextarea />
          <ChatPermissions data-testid='permissions'>
            <ChatPermissionsTrigger />
            <ChatPermissionsContent>
              {Object.entries(allowed).map(([name, checked]) => (
                <ChatPermissionsItem
                  key={name}
                  name={name}
                  title={name}
                  checked={checked}
                  onCheckedChange={handlePermissionChange}
                />
              ))}
            </ChatPermissionsContent>
          </ChatPermissions>
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
};

/** `disclaimer={null}` drops the line under the box. */
export const NoDisclaimer: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    setValue('');
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        disclaimer={null}
        value={value}
        onValueChange={setValue}
        onSubmit={handleSubmit}
      >
        <ChatInputTextarea />
        <ChatInputSubmit />
      </ChatInput>
    </div>
  );
};

/** `data-analytics-*` goes straight on `ChatInputTextarea` and `ChatInputSubmit`, which render the real nodes. */
export const Analytics: StoryFn<typeof meta> = () => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    setValue('');
  };

  return (
    <div className='w-[400px]'>
      <ChatInput
        data-testid='chat-input'
        value={value}
        onValueChange={setValue}
        onSubmit={handleSubmit}
      >
        <ChatInputTextarea data-analytics-id='WALLY_PROMPT' />
        <ChatInputSubmit
          data-analytics-id='WALLY_SEND'
          data-analytics-props='{"surface":"wally"}'
        />
      </ChatInput>
    </div>
  );
};
