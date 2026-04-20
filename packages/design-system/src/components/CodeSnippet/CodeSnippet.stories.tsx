import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info, Skull, TriangleAlert } from '../../icons';
import { VStack } from '../Stack';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
import { loadHighlightJsAdapter, loadPrismAdapter, loadShikiAdapter } from './adapters';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetAdapterProvider } from './CodeSnippetAdapterProvider';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetCopyButton } from './CodeSnippetCopyButton';
import { CodeSnippetFullscreenButton } from './CodeSnippetFullscreenButton';
import { CodeSnippetHeader } from './CodeSnippetHeader';
import { CodeSnippetLineNumbers } from './CodeSnippetLineNumbers';
import { CodeSnippetRoot } from './CodeSnippetRoot';
import { CodeSnippetTab } from './CodeSnippetTab';
import { CodeSnippetTabs } from './CodeSnippetTabs';
import { CodeSnippetTitle } from './CodeSnippetTitle';
import { CodeSnippetWrapButton } from './CodeSnippetWrapButton';
import { getHttpFolds } from './lib/httpFolds';

const meta = {
  title: 'Data display/CodeSnippet/CodeSnippet',
  component: CodeSnippetRoot,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=3087-29516&m=dev',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeSnippetRoot>;

export default meta;

const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

function add(a, b) {
    return a + b;
}

export default add;`;

const bashCode = `npm install @wallarm-org/sdk
npm run build
npm run test`;

const jsonCode = `{
    "name": "@wallarm-org/sdk",
    "version": "1.0.0",
    "dependencies": {
        "react": "^19.0.0",
        "typescript": "^5.0.0"
    }
}`;

/**
 * Basic code snippet with plain text rendering.
 */
export const Default: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot code={bashCode} language='text'>
    <CodeSnippetContent>
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * Code snippet with line numbers displayed.
 */
export const WithLineNumbers: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot code={sampleCode} language='text'>
    <CodeSnippetContent>
      <CodeSnippetLineNumbers />
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * Different size variants: sm, md (default), lg.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='text-xs text-text-secondary font-medium'>sm</span>
      <CodeSnippetRoot code={bashCode} language='text' size='sm'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>

    <VStack align='start' gap={4}>
      <span className='text-xs text-text-secondary font-medium'>md (default)</span>
      <CodeSnippetRoot code={bashCode} language='text' size='md'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>

    <VStack align='start' gap={4}>
      <span className='text-xs text-text-secondary font-medium'>lg</span>
      <CodeSnippetRoot code={bashCode} language='text' size='lg'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>
  </VStack>
);

/**
 * Line annotations with different colors.
 * Each line can have a color (danger, warning, info, success, brand, ai, neutral)
 * and an optional prefix (text, icon, etc.).
 */
export const LineAnnotations: StoryFn<typeof meta> = () => {
  const httpCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
AppleWebKit/537.36
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache`;

  return (
    <CodeSnippetRoot
      code={httpCode}
      language='text'
      lines={{
        3: {
          color: 'danger',
          prefix: (
            <Tooltip>
              <TooltipTrigger>
                <Skull />
              </TooltipTrigger>
              <TooltipContent>Tooltip</TooltipContent>
            </Tooltip>
          ),
        },
        5: {
          color: 'warning',
          prefix: (
            <Tooltip>
              <TooltipTrigger>
                <TriangleAlert />
              </TooltipTrigger>
              <TooltipContent>Tooltip</TooltipContent>
            </Tooltip>
          ),
        },
        7: {
          color: 'info',
          prefix: (
            <Tooltip>
              <TooltipTrigger>
                <Info />
              </TooltipTrigger>
              <TooltipContent>Tooltip</TooltipContent>
            </Tooltip>
          ),
        },
      }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  );
};

/**
 * All available line colors.
 */
export const LineColors: StoryFn<typeof meta> = () => {
  const colorsCode = `Line 1: Default (no color)
Line 2: Danger color
Line 3: Warning color
Line 4: Info color
Line 5: Success color
Line 6: Brand color
Line 7: AI color
Line 8: Neutral color`;

  return (
    <CodeSnippetRoot
      code={colorsCode}
      language='text'
      lines={{
        2: { color: 'danger' },
        3: { color: 'warning' },
        4: { color: 'info' },
        5: { color: 'success' },
        6: { color: 'brand' },
        7: { color: 'ai' },
        8: { color: 'neutral' },
      }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  );
};

/**
 * Highlight specific character ranges within lines with colored bold text.
 * Ranges define start (inclusive) and end (exclusive) character indices.
 * When ranges are present, the whole-line text color is suppressed;
 * only the specified ranges get colored + bold text.
 * The line background/border from `color` still applies.
 */
export const LineRanges: StoryFn<typeof meta> = () => {
  const httpCode = `GET /api/v2/users HTTP/1.1
Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
X-Forwarded-For: 192.168.1.100
Cache-Control: no-cache`;

  return (
    <CodeSnippetRoot
      code={httpCode}
      language='text'
      lines={{
        4: {
          color: 'danger',
          ranges: [{ start: 8, end: 24 }],
        },
        7: {
          color: 'info',
          ranges: [{ start: 17, end: 30 }],
        },
      }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  );
};

/**
 * Text styles for lines: regular, medium, italic.
 * Each color has a default text style, but it can be overridden.
 */
export const TextStyles: StoryFn<typeof meta> = () => {
  const stylesCode = `Line 1: Default (regular)
Line 2: Medium weight
Line 3: Italic style
Line 4: Danger with italic override
Line 5: Neutral (default italic)
Line 6: Custom className
Line 7: Custom inline style`;

  return (
    <CodeSnippetRoot
      code={stylesCode}
      language='text'
      lines={{
        2: { textStyle: 'medium' },
        3: { textStyle: 'italic' },
        4: { color: 'danger', textStyle: 'italic' },
        5: { color: 'neutral' },
        6: { className: 'underline' },
        7: { style: { textDecoration: 'line-through' } },
      }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  );
};

/**
 * Lines with prefix content (text, symbols).
 */
export const LineWithPrefix: StoryFn<typeof meta> = () => {
  const diffCode = `const greeting = "Hello";
console.log("old message");
console.log("new message");
console.log("another new line");

export default greeting;`;

  return (
    <CodeSnippetRoot
      code={diffCode}
      language='text'
      lines={{
        2: { color: 'danger', prefix: '-' },
        3: { color: 'success', prefix: '+' },
        4: { color: 'success', prefix: '+' },
      }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  );
};

/**
 * Line wrapping enabled for long lines.
 * Includes examples with annotations and folds in wrap mode.
 */
export const LineWrapping: StoryFn<typeof meta> = () => {
  const longCode = `const veryLongVariableName = "This is a very long string that will demonstrate line wrapping behavior when the content exceeds the container width";
console.log(veryLongVariableName);`;

  const httpCode = `GET /api/v2/users?page=1&limit=20&filter=active&sort=name&order=asc&include=profile,settings HTTP/1.1
Host: api.wallarm.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0
Content-Type: application/json
Accept: application/json

{
  "filter": { "status": "active", "role": "admin" }
}`;

  return (
    <VStack gap={16}>
      <VStack align='start' gap={4}>
        <span className='text-xs text-text-secondary font-medium'>Without wrapping</span>
        <div style={{ maxWidth: '600px' }}>
          <CodeSnippetRoot code={longCode} language='text'>
            <CodeSnippetContent>
              <CodeSnippetLineNumbers />
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </div>
      </VStack>

      <VStack align='start' gap={4}>
        <span className='text-xs text-text-secondary font-medium'>With wrapping</span>
        <div style={{ maxWidth: '600px' }}>
          <CodeSnippetRoot code={longCode} language='text' wrapLines>
            <CodeSnippetContent>
              <CodeSnippetLineNumbers />
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='text-xs text-text-secondary font-medium'>
          Without wrapping with annotations
        </span>
        <div style={{ maxWidth: '600px' }}>
          <CodeSnippetRoot
            code={longCode}
            language='text'
            lines={{
              1: { color: 'danger', prefix: '-' },
              2: { color: 'success', prefix: '+' },
            }}
          >
            <CodeSnippetContent>
              <CodeSnippetLineNumbers />
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='text-xs text-text-secondary font-medium'>Wrapping with annotations</span>
        <div style={{ maxWidth: '600px' }}>
          <CodeSnippetRoot
            code={longCode}
            language='text'
            wrapLines
            lines={{
              1: { color: 'danger', prefix: '-' },
              2: { color: 'success', prefix: '+' },
            }}
          >
            <CodeSnippetContent>
              <CodeSnippetLineNumbers />
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='text-xs text-text-secondary font-medium'>Folds without wrapping</span>
        <div style={{ maxWidth: '600px' }}>
          <CodeSnippetRoot
            code={httpCode}
            language='text'
            folds={getHttpFolds(httpCode, { headers: { defaultCollapsed: true } })}
          >
            <CodeSnippetContent>
              <CodeSnippetLineNumbers />
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </div>
      </VStack>
      <VStack align='start' gap={4}>
        <span className='text-xs text-text-secondary font-medium'>Folds with wrapping</span>
        <div style={{ maxWidth: '600px' }}>
          <CodeSnippetRoot
            code={httpCode}
            language='text'
            wrapLines
            folds={getHttpFolds(httpCode, { headers: { defaultCollapsed: true } })}
          >
            <CodeSnippetContent>
              <CodeSnippetLineNumbers />
              <CodeSnippetCode />
            </CodeSnippetContent>
          </CodeSnippetRoot>
        </div>
      </VStack>
    </VStack>
  );
};

const longScrollCode = `// This is a code snippet that demonstrates both vertical and horizontal scrolling
const veryLongVariableName = "This is a very long string that will require horizontal scrolling to see the entire content of the line";
const anotherLongLine = { key1: "value1", key2: "value2", key3: "value3", key4: "value4", key5: "value5", key6: "value6", key7: "value7" };

function processData(input) {
    const result = [];
    for (let i = 0; i < input.length; i++) {
        result.push(input[i] * 2);
    }
    return result;
}

async function fetchUserData(userId) {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = await response.json();
    return data;
}

class DataProcessor {
    constructor(config) {
        this.config = config;
    }

    process(data) {
        return data.map(item => item * this.config.multiplier);
    }
}

const config = { multiplier: 2 };
const processor = new DataProcessor(config);

export { processData, fetchUserData, DataProcessor };`;

/**
 * Code snippet with both vertical and horizontal scrolling.
 * The container is constrained to show scrollbars.
 */
export const WithBothScrolls: StoryFn<typeof meta> = () => (
  <div style={{ maxWidth: '500px', maxHeight: '300px', background: 'white' }}>
    <CodeSnippetRoot
      code={longScrollCode}
      language='text'
      lines={{
        2: { color: 'warning', prefix: <TriangleAlert /> },
        3: { color: 'info' },
        13: { color: 'danger', prefix: <Skull /> },
        20: { color: 'success', prefix: '+' },
      }}
      style={{ height: '280px' }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </div>
);

/**
 * Custom starting line number.
 */
export const CustomStartingLine: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot code={sampleCode} language='text' startingLineNumber={97}>
    <CodeSnippetContent>
      <CodeSnippetLineNumbers />
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * JSON code with Shiki syntax highlighting.
 * Shiki provides VS Code-quality highlighting (~200KB+ with WASM).
 */
export const JSONWithShiki: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot code={jsonCode} language='json'>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const typescriptCode = `type User = {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
};

type UserRole = 'admin' | 'user' | 'guest';

/*
 *  Get user by id
 *  */
async function fetchUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    if (!response.ok) {
        throw new Error('User not found');
    }
    return response.json();
}

// Default users
const users: User[] = [];
export { fetchUser, users };`;

/**
 * Typescript code with Prism syntax highlighting.
 * Prism is lightweight (~15KB) and good for most use cases.
 */
export const TypescriptWithPrism: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
    <CodeSnippetRoot code={typescriptCode} language='typescript'>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const curlCode = `curl -X POST "https://api.wallarm.com/v2/node" \\
  -H "Authorization: Bearer $WALLARM_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my-node",
    "type": "cloud",
    "enabled": true
  }'`;

/**
 * Bash code with Prism syntax highlighting.
 * Prism is lightweight (~15KB) and good for most use cases.
 */
export const BashWithPrism: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
    <CodeSnippetRoot code={curlCode} language='bash'>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wallarm Dashboard</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header class="header">
        <nav id="main-nav">
            <a href="/" class="logo">Wallarm</a>
            <ul class="nav-links">
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/settings">Settings</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <h1>Welcome to Wallarm</h1>
        <p>Secure your APIs with advanced protection.</p>
    </main>
</body>
</html>`;

/**
 * HTML code with highlight.js syntax highlighting.
 * highlight.js is well-established (~30KB) with good language support.
 */
export const HTMLWithHighlightJs: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadHighlightJsAdapter}>
    <CodeSnippetRoot code={htmlCode} language='html'>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const httpRequestCode = `GET /api/v2/users?page=1&limit=20 HTTP/1.1
Host: api.wallarm.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Content-Type: application/json
Accept: application/json
User-Agent: WallarmSDK/2.0
Cache-Control: no-cache`;

/**
 * HTTP request with Prism syntax highlighting.
 * Highlights HTTP method, URL, version, header names and values.
 */
export const HTTPRequestWithPrism: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
    <CodeSnippetRoot code={httpRequestCode} language='http'>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const httpResponseCode = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-Id: abc-123-def-456
Cache-Control: no-store

{
    "users": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
    ],
    "total": 42
}`;

/**
 * HTTP response with Shiki syntax highlighting.
 * Highlights status line, headers, and embedded JSON body.
 */
export const HTTPResponseWithShiki: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot code={httpResponseCode} language='http'>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

/**
 * Header with a simple title.
 */
export const WithHeader: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot code={bashCode} language='text'>
    <CodeSnippetHeader>
      <CodeSnippetTitle>install.sh</CodeSnippetTitle>
    </CodeSnippetHeader>
    <CodeSnippetContent>
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

const packageManagerCodes: Record<string, string> = {
  npm: 'npx wasd-new@latest add code-snippet inline-code-snippet button',
  pnpm: 'pnpm dlx wasd-new@latest add code-snippet inline-code-snippet button',
  yarn: 'yarn dlx wasd-new@latest add code-snippet inline-code-snippet button',
  bun: 'bunx wasd-new@latest add code-snippet inline-code-snippet button',
};

/**
 * Header with tabs for switching between package managers and a copy action.
 * Matches Figma node 3099:5956.
 *
 * The tab indicator sits directly on the header's bottom border —
 * the tab list itself has **no** border of its own.
 */
export const WithTabsAndActions: StoryFn<typeof meta> = () => {
  const [tab, setTab] = useState('npm');
  const code = packageManagerCodes[tab] ?? '';

  return (
    <div style={{ width: '320px' }}>
      <CodeSnippetRoot code={code} language='text'>
        <CodeSnippetHeader>
          <CodeSnippetTabs value={tab} onValueChange={setTab}>
            <CodeSnippetTab value='npm'>npm</CodeSnippetTab>
            <CodeSnippetTab value='pnpm'>pnpm</CodeSnippetTab>
            <CodeSnippetTab value='yarn'>yarn</CodeSnippetTab>
            <CodeSnippetTab value='bun'>bun</CodeSnippetTab>
          </CodeSnippetTabs>
          <CodeSnippetActions>
            <CodeSnippetFullscreenButton />
            <CodeSnippetWrapButton />
            <CodeSnippetCopyButton />
          </CodeSnippetActions>
        </CodeSnippetHeader>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>
  );
};

/**
 * Floating actions without a header.
 * Actions are positioned absolute at the top-right corner of the code snippet.
 * Matches Figma node 3092:13248.
 */
export const WithFloatingActions: StoryFn<typeof meta> = () => (
  <div style={{ width: '320px' }}>
    <CodeSnippetRoot code={sampleCode} language='text'>
      <CodeSnippetActions>
        <CodeSnippetWrapButton />
        <CodeSnippetCopyButton />
      </CodeSnippetActions>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </div>
);

const showMoreCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache`;

/**
 * Show more / show less button to collapse long code snippets.
 * Matches Figma node 3092:19114.
 *
 * When `maxLines` is set, only the first N lines are shown.
 * The button shows the count of hidden lines and toggles expand/collapse.
 */
const showMoreThresholdCode = `Host: inventory.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Referer: https://app.example.com/dashboard
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.9
Connection: keep-alive
Cache-Control: no-cache
Authorization: Bearer token123
X-Request-ID: abc-def-ghi`;

/**
 * Show more / show less with threshold behavior.
 * First snippet (12 lines, maxLines=7) shows the button (5 hidden).
 * Second snippet (9 lines, maxLines=7) hides only 2 lines — below
 * the threshold of 3, so all lines are shown without the button.
 */
export const ShowMore: StoryFn<typeof meta> = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '500px' }}>
    <div>
      <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>
        12 lines, maxLines=7 — 5 hidden, button shown
      </p>
      <CodeSnippetRoot code={showMoreCode} language='text' maxLines={7}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>
    <div>
      <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b' }}>
        9 lines, maxLines=7 — 2 hidden, below threshold, no button
      </p>
      <CodeSnippetRoot code={showMoreThresholdCode} language='text' maxLines={7}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>
  </div>
);

// --- Folding stories ---

const foldableRequestCode = `GET /api/v2/users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9
X-Request-ID: abc-123
Content-Type: application/json
Cache-Control: no-cache

{
  "filter": {
    "status": "active",
    "role": "admin"
  },
  "pagination": {
    "page": 1,
    "limit": 50
  }
}`;

const foldableResponseCode = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Request-ID: abc-123
X-RateLimit-Remaining: 98
Cache-Control: private, max-age=0

{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "role": "admin",
      "status": "active"
    },
    {
      "id": 2,
      "name": "Bob",
      "role": "admin",
      "status": "active"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 50
  }
}`;

/**
 * HTTP Request with foldable headers and body using `getHttpFolds`.
 */
export const HTTPRequestWithFolding: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot
    code={foldableRequestCode}
    language='text'
    folds={getHttpFolds(foldableRequestCode)}
  >
    <CodeSnippetContent>
      <CodeSnippetLineNumbers />
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * HTTP Response with foldable headers and body using `getHttpFolds`.
 */
export const HTTPResponseWithFolding: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot
    code={foldableResponseCode}
    language='text'
    folds={getHttpFolds(foldableResponseCode)}
  >
    <CodeSnippetContent>
      <CodeSnippetLineNumbers />
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * Folds combined with line highlights — colors and decorations
 * on folded lines are hidden when collapsed, visible when expanded.
 */
export const WithFoldingExpanded: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot
    code={foldableRequestCode}
    language='text'
    folds={getHttpFolds(foldableRequestCode)}
    lines={{
      3: { color: 'warning' },
      4: { color: 'danger', ranges: [{ start: 14, end: 42, color: 'danger' }] },
      10: { color: 'info' },
      11: { color: 'info' },
    }}
  >
    <CodeSnippetContent>
      <CodeSnippetLineNumbers />
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * Folds combined with maxLines (ShowMore) and a custom startingLineNumber.
 * Fold line numbers are absolute — `getHttpFolds` accepts `startingLineNumber`
 * to offset them automatically.
 */
export const WithFoldingAndShowMore: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={foldableResponseCode}
      language='http'
      startingLineNumber={100}
      maxLines={6}
      folds={getHttpFolds(foldableResponseCode, { startingLineNumber: 100 })}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

// Sample with two parallel fold blocks — each fold draws its own continuous
// vertical guide at the column where its body content starts.
const foldedPython = `class Service:
    def process(payload):
        if not payload.get("enabled"):
            return None
        return compute(payload)

    def compute(payload):
        items = payload.get("items", [])
        return [transform(i) for i in items]

    def transform(item):
        return {"id": item.id, "value": item.value}`;

const foldedPythonFolds = [
  { id: 'process', startLine: 2, endLine: 5 },
  { id: 'compute', startLine: 7, endLine: 9 },
  { id: 'transform', startLine: 11, endLine: 12 },
];

/**
 * Each fold region renders a single continuous guide line at its content's
 * indent column. Guides only appear when folds are configured — without folds
 * the feature is a no-op by design.
 */
export const WithIndentGuides: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot code={foldedPython} language='python' folds={foldedPythonFolds}>
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

/**
 * Guides collapse with their fold — when a fold is collapsed, its rows are
 * replaced by a summary and the guide naturally disappears until re-expanded.
 */
export const IndentGuidesWithCollapsedFold: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={foldedPython}
      language='python'
      folds={[
        { id: 'process', startLine: 2, endLine: 5, defaultCollapsed: true },
        { id: 'compute', startLine: 7, endLine: 9 },
        { id: 'transform', startLine: 11, endLine: 12 },
      ]}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

// HTTP request with a foldable JSON body — shows the request/body boundary.
const httpRequestWithBodyCode = `POST /api/v1/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer xxx

{
  "name": "Alice",
  "email": "alice@example.com",
  "roles": ["admin", "user"]
}`;

/** HTTP request: JSON body folds under the headers block. */
export const IndentGuidesHttp: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={httpRequestWithBodyCode}
      language='http'
      folds={[{ id: 'body', startLine: 6, endLine: 10 }]}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const htmlIndentCode = `<html>
  <head>
    <title>Demo</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <main>
      <h1>Welcome</h1>
      <p>Lorem ipsum dolor sit amet.</p>
    </main>
  </body>
</html>`;

/** HTML: head + body blocks fold; nested main block gets its own guide. */
export const IndentGuidesHtml: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={htmlIndentCode}
      language='html'
      folds={[
        { id: 'head', startLine: 2, endLine: 5 },
        { id: 'body', startLine: 6, endLine: 11 },
      ]}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const jsonIndentCode = `{
  "name": "demo",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "build": "vite build",
    "test": "vitest"
  }
}`;

/** JSON: two sibling object folds (`dependencies`, `scripts`). */
export const IndentGuidesJson: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={jsonIndentCode}
      language='json'
      folds={[
        { id: 'deps', startLine: 4, endLine: 7 },
        { id: 'scripts', startLine: 8, endLine: 11 },
      ]}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

const yamlIndentCode = `version: "3.9"
services:
  api:
    image: wallarm/api:latest
    ports:
      - "8080:8080"
    environment:
      LOG_LEVEL: info
      FEATURE_FLAGS: "x,y,z"
  worker:
    image: wallarm/worker:latest
    restart: unless-stopped`;

/** YAML: compose-style block with two siblings `api` and `worker`. */
export const IndentGuidesYaml: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={yamlIndentCode}
      language='yaml'
      folds={[
        { id: 'api', startLine: 3, endLine: 9 },
        { id: 'worker', startLine: 10, endLine: 12 },
      ]}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

// Nested folds: outer `class` fold contains inner `method` folds. Each level
// renders its own guide line at its own indent column, giving a multi-layer
// structural view.
const classWithNestedFoldsCode = `class UserService:
    def get_user(self, uid):
        if not self._cache.has(uid):
            user = self._repo.fetch(uid)
            self._cache.put(uid, user)
        return self._cache.get(uid)

    def create_user(self, payload):
        validated = self._validator.check(payload)
        if validated.ok:
            return self._repo.insert(validated.data)
        raise ValueError(validated.errors)

    def _warmup(self):
        for uid in self._repo.list_ids():
            self._cache.put(uid, self._repo.fetch(uid))`;

/**
 * Nested folds: the outer `class` fold wraps three inner method folds. Inner
 * methods get their own guide column; the outer fold guide stays continuous
 * through the method headers.
 */
export const IndentGuidesNestedFolds: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={classWithNestedFoldsCode}
      language='python'
      folds={[
        { id: 'class', startLine: 1, endLine: 16 },
        { id: 'get', startLine: 2, endLine: 6 },
        { id: 'create', startLine: 8, endLine: 12 },
        { id: 'warmup', startLine: 14, endLine: 16 },
      ]}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);

/**
 * Guides compose with per-line color backgrounds — the guide sliver sits
 * inside the content span over the colored line background but under the text.
 */
export const IndentGuidesWithLineHighlights: StoryFn<typeof meta> = () => (
  <CodeSnippetAdapterProvider adapter={loadShikiAdapter}>
    <CodeSnippetRoot
      code={foldedPython}
      language='python'
      folds={foldedPythonFolds}
      lines={{
        3: { color: 'warning' },
        4: { color: 'danger' },
        8: { color: 'info' },
        9: { color: 'info' },
      }}
    >
      <CodeSnippetContent>
        <CodeSnippetLineNumbers />
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </CodeSnippetAdapterProvider>
);
