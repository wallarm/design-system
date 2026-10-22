import { describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Drawer, DrawerTrigger } from '../Drawer';
import { Chat } from './Chat';
import { ChatBody } from './ChatBody';
import { ChatFooter } from './ChatFooter';
import { ChatGreeting } from './ChatGreeting';
import { ChatHeader } from './ChatHeader';
import { ChatHeaderActions } from './ChatHeaderActions';
import { ChatHeaderTitle } from './ChatHeaderTitle';
import { ChatSuggestion } from './ChatSuggestion';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatTrigger } from './ChatTrigger';

const renderChat = () =>
  render(
    <Chat data-testid='chat'>
      <ChatHeader>
        <ChatHeaderTitle />
        <ChatHeaderActions />
      </ChatHeader>
      <ChatBody>
        <ChatGreeting title='Hi'>
          <ChatSuggestions placement='greeting'>
            <ChatSuggestion>One</ChatSuggestion>
          </ChatSuggestions>
        </ChatGreeting>
      </ChatBody>
      <ChatFooter />
    </Chat>,
  );

describe('Chat', () => {
  it('renders a section named "Wally chat" with an overridable label', () => {
    const { rerender } = render(<Chat data-testid='chat' />);
    const root = screen.getByTestId('chat');
    expect(root.tagName).toBe('SECTION');
    expect(screen.getByRole('region', { name: 'Wally chat' })).toBe(root);
    expect(root).toHaveAttribute('data-slot', 'chat');

    rerender(<Chat data-testid='chat' aria-label='Assistant' />);
    expect(screen.getByRole('region', { name: 'Assistant' })).toBeInTheDocument();
  });

  it('renders an aria-hidden chat-palette background by default', () => {
    render(<Chat data-testid='chat' />);
    const bg = screen.getByTestId('chat--background');
    expect(bg).toHaveAttribute('data-slot', 'chat-background');
    expect(bg).toHaveAttribute('aria-hidden', 'true');
    expect(bg).toHaveClass('opacity-5');
    expect(bg?.firstElementChild).toHaveAttribute('data-slot', 'blur-background');
    expect(bg?.firstElementChild).toHaveAttribute('data-palette', 'chat');
  });

  it('uses 12% opacity for strong and renders no background for none', () => {
    const { rerender } = render(<Chat data-testid='chat' background='strong' />);
    expect(screen.getByTestId('chat--background')).toHaveClass('opacity-12');

    rerender(<Chat data-testid='chat' background='none' />);
    expect(screen.queryByTestId('chat--background')).toBeNull();
  });

  it('shows "Ask Wally" when the title has no children', () => {
    render(
      <Chat data-testid='chat'>
        <ChatHeaderTitle />
      </Chat>,
    );
    expect(screen.getByTestId('chat--title')).toHaveTextContent('Ask Wally');
  });

  it('shows children after a "/" joint instead of "Ask Wally"', () => {
    render(
      <Chat data-testid='chat'>
        <ChatHeaderTitle>
          <span>Thread</span>
        </ChatHeaderTitle>
      </Chat>,
    );
    const title = screen.getByTestId('chat--title');
    expect(title).toHaveTextContent('/Thread');
    expect(title).not.toHaveTextContent('Ask');
  });

  it('replaces the default title text with label', () => {
    render(
      <Chat data-testid='chat'>
        <ChatHeaderTitle label='Спросить Wally' />
      </Chat>,
    );
    const title = screen.getByTestId('chat--title');
    expect(title).toHaveTextContent('Спросить Wally');
    expect(title).not.toHaveTextContent('Ask');
  });

  it('keeps the Variant2 joint for children even when label is set', () => {
    render(
      <Chat data-testid='chat'>
        <ChatHeaderTitle label='Ignored'>
          <span>Thread</span>
        </ChatHeaderTitle>
      </Chat>,
    );
    const title = screen.getByTestId('chat--title');
    expect(title).toHaveTextContent('/Thread');
    expect(title).not.toHaveTextContent('Ignored');
  });

  it('keeps the default title DOM unchanged', () => {
    render(<ChatHeaderTitle data-testid='title' />);
    const text = screen.getByTestId('title').lastElementChild;
    expect(text?.outerHTML).toBe(
      '<span class="ml-8 truncate text-sm text-text-primary">Ask <span class="font-mono font-medium text-text-brand">Wally</span></span>',
    );
  });

  it('exposes ChatBody as a log', () => {
    renderChat();
    expect(screen.getByRole('log', { name: 'Chat messages' })).toBe(
      screen.getByTestId('chat--body'),
    );
  });

  it('renders the greeting title as a heading', () => {
    renderChat();
    expect(screen.getByRole('heading', { level: 2, name: 'Hi' })).toBeInTheDocument();
  });

  it('labels suggestions from the visible label, or "Suggestions" without one', () => {
    const { rerender } = render(
      <Chat data-testid='chat'>
        <ChatSuggestions label='Try asking' />
      </Chat>,
    );
    expect(screen.getByRole('group', { name: 'Try asking' })).toBe(
      screen.getByTestId('chat--suggestions'),
    );

    rerender(
      <Chat data-testid='chat'>
        <ChatSuggestions />
      </Chat>,
    );
    expect(screen.getByRole('group', { name: 'Suggestions' })).toBeInTheDocument();
  });

  it('sizes pills lg in the greeting placement and md in the footer or standalone', () => {
    render(
      <>
        <ChatSuggestions placement='greeting'>
          <ChatSuggestion data-testid='lg'>A</ChatSuggestion>
        </ChatSuggestions>
        <ChatSuggestions>
          <ChatSuggestion data-testid='md'>B</ChatSuggestion>
        </ChatSuggestions>
        <ChatSuggestion data-testid='solo'>C</ChatSuggestion>
      </>,
    );
    expect(screen.getByTestId('lg')).toHaveClass('rounded-12', 'text-sm');
    expect(screen.getByTestId('md')).toHaveClass('rounded-8', 'text-xs');
    expect(screen.getByTestId('solo')).toHaveClass('rounded-8', 'text-xs');
  });

  it('renders ChatSuggestion as type=button', () => {
    render(<ChatSuggestion data-testid='s'>A</ChatSuggestion>);
    expect(screen.getByTestId('s')).toHaveAttribute('type', 'button');
  });

  it('cascades flat test ids from the root', () => {
    renderChat();
    for (const slot of [
      'header',
      'title',
      'actions',
      'body',
      'footer',
      'greeting',
      'suggestions',
      'suggestion',
    ]) {
      expect(screen.getByTestId(`chat--${slot}`)).toBeInTheDocument();
    }
  });

  it('lets a consumer data-testid win over the derived one', () => {
    render(
      <Chat data-testid='chat'>
        <ChatSuggestion data-testid='custom'>A</ChatSuggestion>
      </Chat>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByTestId('chat--suggestion')).toBeNull();
  });

  it('leaves test ids off when the root has none', () => {
    const { container } = render(
      <Chat>
        <ChatHeader />
      </Chat>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('falls back to the "Suggestions" name when label is false or empty', () => {
    const { rerender } = render(<ChatSuggestions label={false} />);
    expect(screen.getByRole('group', { name: 'Suggestions' })).toBeInTheDocument();
    rerender(<ChatSuggestions label='' />);
    expect(screen.getByRole('group', { name: 'Suggestions' })).toBeInTheDocument();
  });

  it('sets data-slot on every part', () => {
    renderChat();
    for (const [testId, slot] of [
      ['chat--header', 'chat-header'],
      ['chat--title', 'chat-header-title'],
      ['chat--actions', 'chat-header-actions'],
      ['chat--body', 'chat-body'],
      ['chat--footer', 'chat-footer'],
      ['chat--greeting', 'chat-greeting'],
      ['chat--suggestions', 'chat-suggestions'],
      ['chat--suggestion', 'chat-suggestion'],
    ] as const) {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-slot', slot);
    }
  });

  it('forwards refs to the Chat, ChatHeader and ChatBody elements', () => {
    const chatRef = { current: null as HTMLElement | null };
    const headerRef = { current: null as HTMLElement | null };
    const bodyRef = { current: null as HTMLDivElement | null };
    render(
      <Chat ref={chatRef} data-testid='chat'>
        <ChatHeader ref={headerRef} />
        <ChatBody ref={bodyRef} />
      </Chat>,
    );
    expect(chatRef.current).toBe(screen.getByTestId('chat'));
    expect(headerRef.current).toBe(screen.getByTestId('chat--header'));
    expect(bodyRef.current).toBe(screen.getByRole('log'));
  });

  it('passes aria-busy and an aria-label override to the log', () => {
    render(<ChatBody aria-busy aria-label='Conversation' />);
    const log = screen.getByRole('log', { name: 'Conversation' });
    expect(log).toHaveAttribute('aria-busy', 'true');
  });

  it('does not fire onClick on a disabled ChatSuggestion', async () => {
    const onClick = rs.fn();
    render(
      <ChatSuggestion disabled onClick={onClick}>
        A
      </ChatSuggestion>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('ChatTrigger', () => {
  it('names the button and the tooltip "Ask Wally" by default, or by label', async () => {
    const { rerender } = render(<ChatTrigger data-testid='trigger' />);
    const button = screen.getByRole('button', { name: 'Ask Wally' });
    expect(button).toHaveAttribute('data-slot', 'chat-trigger');
    expect(button).toContainElement(screen.getByTestId('trigger--icon'));

    await userEvent.hover(button);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Ask Wally');

    rerender(<ChatTrigger label='Open assistant' />);
    expect(screen.getByRole('button', { name: 'Open assistant' })).toBeInTheDocument();
  });

  it('passes aria-expanded and the consumer onClick through', async () => {
    const onClick = rs.fn();
    render(<ChatTrigger aria-expanded={false} onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Ask Wally' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps the drawer trigger id on the button under DrawerTrigger asChild', async () => {
    render(
      <Drawer>
        <DrawerTrigger asChild>
          <ChatTrigger data-testid='trigger' />
        </DrawerTrigger>
      </Drawer>,
    );
    const button = screen.getByTestId('trigger');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
  });
});
