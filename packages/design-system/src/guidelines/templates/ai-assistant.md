---
title: AI assistant
description: Use when building an AI security assistant screen: a full-page Wally conversation with reasoning and approvals, or Wally docked beside a product page.
components: [AppShell, AppShellHeader, AppShellRail, AppShellRemote, AppShellAside, TopHeader, NavRail, Chat, ChatHeader, ChatHeaderTitle, ChatHeaderActions, ChatFooter, ChatSuggestions, ChatSuggestion, ChatTrigger, Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton, UserMessage, UserMessageBubble, AssistantMessage, AssistantMessageContent, AssistantMessageMarkdown, ChainOfThought, ChainOfThoughtStep, MessageActions, MessageAction, MessageTimestamp, ApprovalCard, ApprovalCardContent, ApprovalCardActions, ChatInput, ChatInputTextarea, ChatInputSubmit, ChatPermissions, ChatPermissionsTrigger, ChatPermissionsContent, ChatPermissionsItem, Select, Copyable, InlineCodeSnippet, NotificationCenter, RemoteShell, Page, Table, DropdownMenu, Badge, Ip, HttpMethod, FormatDateTime]
keywords: [ai, assistant, wally, copilot, chat, conversation, agent, llm, reasoning, chain of thought, approval, human in the loop, streaming, prompts, suggestions, side panel, docked chat]
order: 60
---

# AI assistant

Wally, the security assistant, as a full page in the console and as a panel docked beside a product page. The AI parts are dumb: the app feeds them messages, steps, approvals and run state from its own agent runtime, and the screen composes them inside the console frame.

## What it shows

- The console frame from [Application layout](../patterns/app-layout.md): `AppShell` with a top header and rail, the chat filling `AppShellRemote`, or docked in `AppShellAside` and toggled by `ChatTrigger`.
- A turn: `UserMessage`, then `AssistantMessage` with a `ChainOfThought` of tool steps and metrics, a markdown answer with a table, and a visible `MessageActions` row.
- Human in the loop: a pending `ApprovalCard` docked above the composer; Allow or Reject resolves it in place, and the confirmation follows.
- Stick-to-bottom: `Conversation` and `ConversationScrollButton` keep the latest message in view; on a wide page the message column and footer are centered to a reading width.
- Run state: `aria-busy` on the log, a shimmering running step, a streaming markdown tail, and Stop in place of Send.
- The composer: `ChatInput` with `ChatPermissions` for tool access and a context chip for the record the analyst picked.
- The docked variant keeps a full [Resource list page](../patterns/resource-list-page.md) next to the chat: toolbar search and status tabs, and an [Entity table](../patterns/entity-table.md) whose master-cell row menu has "Ask Wally" to attach the row to the chat.
- The empty landing: `ConversationEmptyState` with the live Wally character and suggested prompts that fill the composer.

## Examples

The full-page investigation: reasoning, a summary and a denylist change waiting for approval.

```story
Default
```

Wally docked beside the Attacks page, with the picked attack attached as context.

```story
DockedPanel
```

A reply in flight: the running step, a streaming answer and Stop.

```story
Streaming
```

The landing state before the first message, with suggested prompts.

```story
Empty
```

## Related

- [Application layout](../patterns/app-layout.md)
- [Resource list page](../patterns/resource-list-page.md)
- [Entity table](../patterns/entity-table.md)
- [Filtering](../patterns/filtering.md)
- [Empty states](../patterns/empty-states.md)
