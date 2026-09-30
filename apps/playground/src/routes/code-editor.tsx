import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@wallarm-org/design-system/Button';
import {
  CodeEditorContent,
  CodeEditorRoot,
  type JsonSchema,
} from '@wallarm-org/design-system/CodeEditor';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCopyButton,
  CodeSnippetFullscreenButton,
  CodeSnippetHeader,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  loadPrismAdapter,
} from '@wallarm-org/design-system/CodeSnippet';
import { Heading } from '@wallarm-org/design-system/Heading';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';

export const Route = createFileRoute('/code-editor')({
  component: CodeEditorPage,
});

const HTTP_REQUEST = [
  'POST /api/v1/users HTTP/1.1',
  'Host: api.example.com',
  'Content-Type: application/json',
  'Authorization: Bearer <token>',
  '',
  '{',
  '  "name": "Jane Doe",',
  '  "email": "jane@example.com",',
  '  "roles": ["admin"]',
  '}',
].join('\n');

const USER_JSON = [
  '{',
  '  "name": "Jane Doe",',
  '  "email": "jane@example.com",',
  '  "roles": ["admin", "owner"]',
  '}',
].join('\n');

const USER_SCHEMA: JsonSchema = {
  type: 'object',
  required: ['name', 'email'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', description: 'Display name' },
    email: { type: 'string', format: 'email', description: 'Login e-mail' },
    roles: {
      type: 'array',
      items: { type: 'string', enum: ['admin', 'viewer'] },
    },
  },
};

function CodeEditorPage() {
  // The JSON editor starts without a schema, so json-schema-library's chunk is
  // requested only after the button is pressed (watch the Network tab).
  const [withSchema, setWithSchema] = useState(false);

  return (
    <div className='flex flex-col w-screen min-h-screen p-32'>
      <VStack gap={16}>
        <Heading color='primary'>CodeEditor</Heading>
        <Text color='secondary'>
          Bundle-measurement route: the editor engine loads lazily on first mount (split into a
          few chunks); json-schema-library is loaded only when a schema is attached, and
          JS/TS/Python parsers only for those languages.
        </Text>

        <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
          <CodeEditorRoot
            language='http'
            defaultValue={HTTP_REQUEST}
            data-testid='playground-code-editor-http'
          >
            <CodeSnippetHeader>
              <CodeSnippetTitle>Request</CodeSnippetTitle>
              <CodeSnippetActions>
                <CodeSnippetCopyButton />
                <CodeSnippetWrapButton />
                <CodeSnippetFullscreenButton />
              </CodeSnippetActions>
            </CodeSnippetHeader>
            <CodeEditorContent lineNumbers aria-label='HTTP request' />
          </CodeEditorRoot>

          <Button
            variant='outline'
            color='neutral'
            onClick={() => setWithSchema(current => !current)}
          >
            {withSchema ? 'Detach JSON Schema' : 'Attach JSON Schema'}
          </Button>

          <CodeEditorRoot
            language='json'
            defaultValue={USER_JSON}
            schema={withSchema ? USER_SCHEMA : undefined}
            data-testid='playground-code-editor-json'
          >
            <CodeSnippetHeader>
              <CodeSnippetTitle>User (JSON)</CodeSnippetTitle>
              <CodeSnippetActions>
                <CodeSnippetCopyButton />
              </CodeSnippetActions>
            </CodeSnippetHeader>
            <CodeEditorContent lineNumbers aria-label='User JSON' />
          </CodeEditorRoot>
        </CodeSnippetAdapterProvider>
      </VStack>
    </div>
  );
}
