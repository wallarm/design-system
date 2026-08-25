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
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { CodeSnippetTab } from './CodeSnippetTab';
import { CodeSnippetTabs } from './CodeSnippetTabs';
import { CodeSnippetTitle } from './CodeSnippetTitle';
import { CodeSnippetWrapButton } from './CodeSnippetWrapButton';
import { getHttpFolds } from './lib/httpFolds';

const DESCRIPTION = [
  'A block of code to be read and copied, never edited — reach for `InlineCodeSnippet` when the code belongs inside a sentence, and a real editor when the value is meant to change.',
  'Everything beyond the code is composed: a `CodeSnippetHeader` carrying a title or tabs, `CodeSnippetActions` for copy, wrap and fullscreen, `CodeSnippetLineNumbers`, and per-line colour, prefixes and folds — and highlighting happens only inside a `CodeSnippetAdapterProvider`.',
].join(' ');

const meta = {
  title: 'Data display/CodeSnippet/CodeSnippet',
  component: CodeSnippetRoot,
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
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
 * The block with no adapter in scope — mono type on a tinted surface, and the plain
 * fallback rather than an absence of highlighting to fix.
 */
export const Default: StoryFn<typeof meta> = () => (
  <CodeSnippetRoot code={bashCode} language='text'>
    <CodeSnippetContent>
      <CodeSnippetCode />
    </CodeSnippetContent>
  </CodeSnippetRoot>
);

/**
 * `CodeSnippetLineNumbers` is a sibling of the code inside `CodeSnippetContent`, so the
 * gutter is something you compose in rather than a prop you switch on.
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
 * The three sizes. `sm` is the default at 12px; `md` and `lg` step the code to 14 and
 * 16px for a block meant to be read from further away.
 */
export const Sizes: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <VStack align='start' gap={4}>
      <span className='sb-annotation'>sm (default)</span>
      <CodeSnippetRoot code={bashCode} language='text' size='sm'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>

    <VStack align='start' gap={4}>
      <span className='sb-annotation'>md</span>
      <CodeSnippetRoot code={bashCode} language='text' size='md'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>

    <VStack align='start' gap={4}>
      <span className='sb-annotation'>lg</span>
      <CodeSnippetRoot code={bashCode} language='text' size='lg'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </VStack>
  </VStack>
);

/**
 * `lines`, keyed by line number, tints a line and hangs a prefix off it — here a
 * tooltipped icon on each of the three headers worth calling out.
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
 * The seven line colours are semantic, so choose by what the line means — `danger` for
 * the attack, `info` for the aside — not by which tint reads best.
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
 * `ranges` narrows the emphasis to character offsets inside the line — start inclusive,
 * end exclusive — and once a line has them only the range is coloured, though the
 * line's own background stays.
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
 * `textStyle` overrides the weight or slant a colour would have chosen, with `className`
 * and `style` left for the cases the three named styles do not cover.
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
 * A `+` and `-` prefix over `success` and `danger` lines gives you a diff without a diff
 * component.
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
 * `wrapLines` against the same code unwrapped, in three pairs — what to check is that
 * prefixes, colour sticks and fold toggles stay on the first visual row of a wrapped line.
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
        <span className='sb-annotation'>Without wrapping</span>
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
        <span className='sb-annotation'>With wrapping</span>
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
        <span className='sb-annotation'>Without wrapping, with annotations</span>
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
        <span className='sb-annotation'>Wrapping with annotations</span>
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
        <span className='sb-annotation'>Folds without wrapping</span>
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
        <span className='sb-annotation'>Folds with wrapping</span>
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
 * Given a fixed height inside a narrow column, the block scrolls in both directions
 * rather than pushing its container around.
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
 * `startingLineNumber` renumbers the gutter, for a fragment lifted out of a longer file.
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
 * Shiki, supplied through `CodeSnippetAdapterProvider` — VS Code's own grammars, and the
 * heaviest of the three adapters at roughly 200KB plus WASM.
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
 * Prism, at roughly 15KB, is the one to reach for unless something forces otherwise;
 * this is TypeScript under it.
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
 * A multi-line `curl` under Prism, where the continuation backslashes and the quoted JSON
 * body are the parts a highlighter usually gets wrong.
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
 * highlight.js sits between the other two at roughly 30KB, with the longest language list
 * of the three.
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
 * `language='http'` is a grammar in its own right — method, path and version on the first
 * line, then header names told apart from their values.
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
 * The response side, where the JSON body after the headers is highlighted as JSON rather
 * than as more header text.
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
 * `CodeSnippetHeader` with a `CodeSnippetTitle` names the file the code came from, as a
 * bar above the block rather than a caption on it.
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
 * Tabs in the header swap the `code` the block is given, which is how one command per
 * package manager is built; the actions sit at the far end of the same bar.
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
 * With no header to hold them, `CodeSnippetActions` floats over the top-right of the code
 * — the shape for a block whose only affordance is copy.
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
 * When `maxLines` is set, only the first N lines are shown and
 * CodeSnippetRoot auto-renders the default button. Render
 * CodeSnippetShowMoreButton yourself only when props must reach the real
 * button, for example analytics attributes or an onClick handler.
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
 * `maxLines` clips the block and adds the control itself — but only when it would hide at
 * least three lines, so the middle snippet stays open; the third passes props to the real
 * button by rendering `CodeSnippetShowMoreButton` in place of the automatic one.
 */
export const ShowMore: StoryFn<typeof meta> = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '500px' }}>
    <div>
      <p className='sb-annotation mb-8'>12 lines, clipped at 7 — 5 hidden</p>
      <CodeSnippetRoot code={showMoreCode} language='text' maxLines={7}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>
    <div>
      <p className='sb-annotation mb-8'>9 lines, clipped at 7 — 2 hidden, no button</p>
      <CodeSnippetRoot code={showMoreThresholdCode} language='text' maxLines={7}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>
    <div>
      <p className='sb-annotation mb-8'>the button rendered by hand</p>
      <CodeSnippetRoot code={showMoreCode} language='text' maxLines={7}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
        <CodeSnippetShowMoreButton data-analytics-id='CODE_SHOW_MORE' />
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
 * `getHttpFolds` reads an HTTP message and returns its fold regions, so the reader opens
 * the headers or the body rather than scrolling past both.
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
 * The same helper on a response, where the body is usually the half worth folding away.
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
 * Folds over coloured lines: a collapsed fold takes its colours and prefixes with it, and
 * hands them back on expand.
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
 * Folds, `maxLines` and `startingLineNumber` together — fold line numbers are absolute, so
 * `getHttpFolds` has to be given the same offset the gutter uses.
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
