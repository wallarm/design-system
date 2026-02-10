import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info, Skull, TriangleAlert } from '../../icons';
import { VStack } from '../Stack';
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
  <VStack spacing={16}>
    <VStack align='start' spacing={4}>
      <span className='text-xs text-text-secondary font-medium'>sm</span>
      <CodeSnippetRoot code={bashCode} language='text' size='sm'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>

    <VStack align='start' spacing={4}>
      <span className='text-xs text-text-secondary font-medium'>md (default)</span>
      <CodeSnippetRoot code={bashCode} language='text' size='md'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>

    <VStack align='start' spacing={4}>
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
        3: { color: 'danger', prefix: <Skull /> },
        5: { color: 'warning', prefix: <TriangleAlert /> },
        7: { color: 'info', prefix: <Info /> },
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
 */
export const LineWrapping: StoryFn<typeof meta> = () => {
  const longCode = `const veryLongVariableName = "This is a very long string that will demonstrate line wrapping behavior when the content exceeds the container width";
console.log(veryLongVariableName);`;

  return (
    <VStack spacing={16}>
      <VStack align='start' spacing={4}>
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

      <VStack align='start' spacing={4}>
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
      <VStack align='start' spacing={4}>
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
      <VStack align='start' spacing={4}>
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
export const ShowMore: StoryFn<typeof meta> = () => (
  <div style={{ width: '500px' }}>
    <CodeSnippetRoot code={showMoreCode} language='text' maxLines={7}>
      <CodeSnippetContent>
        <CodeSnippetCode />
      </CodeSnippetContent>
    </CodeSnippetRoot>
  </div>
);
