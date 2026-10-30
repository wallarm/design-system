import { useRef, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  type ConditionType,
  ENCODINGS,
  FORMATS,
  headerSeg,
  keySeg,
  nativeSeg,
  type Segment as ProtonSegment,
  type RuleContext,
  seg,
} from '@wallarm-org/rules-lib';
import { Button } from '../../Button';
import { SegmentedControl } from '../../SegmentedControl';
import { SegmentedControlItem } from '../../SegmentedControl/SegmentedControlItem';
import { Text } from '../../Text';
import { PointSelector } from './PointSelector';
import type { PointSelectorValue } from './types';

const meta = {
  title: 'Rules/PointSelector',
  component: PointSelector,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PointSelector>;

export default meta;

const EMPTY: PointSelectorValue = {
  segments: [] as any,
  condition: null,
  value: '',
  ignoreCase: false,
  canonical: null,
  canonicalVersion: null,
};

// Example points using segments (matching rules-frontend usage)
const POINT_EXAMPLES = [
  {
    id: 'header',
    label: 'Header X-Api-Version',
    value: {
      segments: [nativeSeg('header', 'Header'), headerSeg('x-api-version')] as any,
      condition: 'equal' as ConditionType,
      value: '1',
      ignoreCase: false,
      canonical: null,
      canonicalVersion: null,
    },
  },
  {
    id: 'jwt-claim',
    label: 'JWT claim "sub"',
    value: {
      segments: [
        nativeSeg('header', 'Header'),
        headerSeg('authorization'),
        FORMATS.auth,
        keySeg('bearer'),
        FORMATS.jwt,
        keySeg('payload'),
        ENCODINGS.base64,
        seg('[format:json]', 'format', 'JSON', { name: 'json', claims: true }),
        keySeg('sub'),
      ] as any,
      condition: 'exists' as ConditionType,
      value: '',
      ignoreCase: false,
      canonical: null,
      canonicalVersion: null,
    },
  },
  {
    id: 'json-body',
    label: 'Body JSON key "email"',
    value: {
      segments: [nativeSeg('body', 'Body'), FORMATS.json, keySeg('email')] as any,
      condition: 'contains' as ConditionType,
      value: '@example.com',
      ignoreCase: false,
      canonical: null,
      canonicalVersion: null,
    },
  },
  {
    id: 'wildcard',
    label: 'Body key *username* (wildcard)',
    value: {
      segments: [
        nativeSeg('body', 'Body'),
        FORMATS.json,
        seg('[arr|key:**]', 'wild', 'every nested value', {
          kind: 'wild',
          name: 'arr|key',
          fuzzy: true,
        }),
        seg('[key:/.*username.*/]', 'key', "key '*username*'", {
          name: '.*username.*',
          fuzzy: true,
          reserved: true,
        }),
      ] as any,
      condition: 'equal' as ConditionType,
      value: '*admin*',
      ignoreCase: true,
      canonical: null,
      canonicalVersion: null,
    },
  },
];

// Build from scratch - empty state
export const BuildFromScratch: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='w-[600px]'>
      <div className='mb-12 rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <Text size='sm' color='secondary'>
          Start typing or press a number to select an option. Try: 3 → type "auth" → select
          "authorization"
        </Text>
      </div>
      <PointSelector context='http_request' value={value} onChange={setValue} />
      <div className='mt-12 rounded-12 border border-border-primary bg-bg-secondary p-12'>
        <div className='mb-4 text-sm text-text-tertiary'>Canonical point:</div>
        <div className='font-mono text-xs'>
          {value.canonical || value.segments.length > 0 ? (
            <div className='text-text-primary'>
              {value.canonical || `(${value.segments.length} segments)`}
            </div>
          ) : (
            <span className='text-text-tertiary'>Nothing chosen yet</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const HttpRequest: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='w-[600px]'>
      <PointSelector
        data-testid='point-selector'
        context='http_request'
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const HttpResponse: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_response' value={value} onChange={setValue} />
    </div>
  );
};

// Two-stage flow demonstration (Where → Match)
export const TwoStageFlow: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            This story demonstrates the complete two-stage flow:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>Step 1: Choose where the value is (build the point)</li>
          <li>Step 2: Set how it should match (condition + value)</li>
        </ul>
      </div>
      <PointSelector context='http_request' value={value} onChange={setValue} />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Segments: {value.segments.map(s => s.text).join('') || '—'}
          </Text>
        </div>
        {value.condition && (
          <Text size='xs' color='secondary'>
            Condition: {value.condition} "{value.value}"
          </Text>
        )}
      </div>
    </div>
  );
};

// Context switcher (Request/Response toggle)
export const WithContextSwitcher: StoryFn = () => {
  const [context, setContext] = useState<RuleContext>('http_request');
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [mount, setMount] = useState(0);

  const handleContextChange = (next: string) => {
    setContext(next === 'http_response' ? 'http_response' : 'http_request');
    setValue(EMPTY);
    setMount(n => n + 1);
  };

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <SegmentedControl value={context} onChange={handleContextChange}>
        <SegmentedControlItem value='http_request'>Request</SegmentedControlItem>
        <SegmentedControlItem value='http_response'>Response</SegmentedControlItem>
      </SegmentedControl>
      <PointSelector key={mount} context={context} value={value} onChange={setValue} />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <Text size='xs' color='secondary'>
          Segments: {value.segments.map(s => s.text).join('') || '—'}
        </Text>
      </div>
    </div>
  );
};

// Complete demo with loadable examples
export const CompleteDemo: StoryFn = () => {
  const [context, setContext] = useState<RuleContext>('http_request');
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [mount, setMount] = useState(0);

  const handleContextChange = (next: string) => {
    setContext(next === 'http_response' ? 'http_response' : 'http_request');
    setValue(EMPTY);
    setMount(n => n + 1);
  };

  const handleExample = (example: PointSelectorValue) => {
    setContext('http_request');
    setValue(example);
    setMount(n => n + 1);
  };

  return (
    <div className='flex w-[800px] flex-col gap-16'>
      <div className='flex flex-wrap items-center justify-between gap-12'>
        <SegmentedControl value={context} onChange={handleContextChange}>
          <SegmentedControlItem value='http_request'>Request</SegmentedControlItem>
          <SegmentedControlItem value='http_response'>Response</SegmentedControlItem>
        </SegmentedControl>
        <div className='flex flex-wrap gap-6'>
          {POINT_EXAMPLES.map(example => (
            <Button
              key={example.id}
              variant='outline'
              color='neutral'
              size='small'
              onClick={() => handleExample(example.value)}
            >
              {example.label}
            </Button>
          ))}
        </div>
      </div>
      <PointSelector key={mount} context={context} value={value} onChange={setValue} />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Segments: {value.segments.map(s => s.text).join('') || '—'}
          </Text>
        </div>
        {value.condition && (
          <Text size='xs' color='secondary'>
            Condition: {value.condition} "{value.value}"
          </Text>
        )}
      </div>
    </div>
  );
};

// Different condition types examples
export const ConditionEqual: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('x-api-version')] as any,
    condition: 'equal',
    value: '2.0',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <Text size='xs' color='secondary'>
          Segments: {value.segments.map(s => s.text).join('')}
        </Text>
      </div>
    </div>
  );
};

export const ConditionContains: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('body', 'Body'), FORMATS.json, keySeg('email')] as any,
    condition: 'contains',
    value: '@example.com',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <Text size='xs' color='secondary'>
          Segments: {value.segments.map(s => s.text).join('')}
        </Text>
      </div>
    </div>
  );
};

export const ConditionStartsWith: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('path', 'Path')] as any,
    condition: 'startswith',
    value: '/api/v2',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const ConditionEndsWith: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('path', 'Path')] as any,
    condition: 'endswith',
    value: '.json',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const ConditionRegexp: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('user-agent')] as any,
    condition: 'regexp',
    value: '^Mozilla.*Firefox',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const ConditionNotEqual: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('method', 'Method')] as any,
    condition: 'nequal',
    value: 'GET',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const ConditionNotRegexp: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('content-type')] as any,
    condition: 'nregexp',
    value: 'text/.*',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const ConditionExists: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('authorization')] as any,
    condition: 'exists',
    value: '',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const ConditionAbsent: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('x-debug-mode')] as any,
    condition: 'absent',
    value: '',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

// Reference scenarios
export const JWTClaims: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('header', 'Header'),
      headerSeg('authorization'),
      FORMATS.auth,
      keySeg('bearer'),
      FORMATS.jwt,
      keySeg('payload'),
      ENCODINGS.base64,
      seg('[format:json]', 'format', 'JSON', { name: 'json', claims: true }),
      keySeg('sub'),
    ] as any,
    condition: 'exists',
    value: '',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            JWT claim extraction example:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>Authorization header → Bearer token → JWT</li>
          <li>Payload → Base64 decode → JSON → claim</li>
          <li>Checks if the "sub" claim exists</li>
        </ul>
      </div>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const WithWildcards: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('body', 'Body'),
      FORMATS.json,
      seg('[arr|key:**]', 'wild', 'every nested value', {
        kind: 'wild',
        name: 'arr|key',
        fuzzy: true,
      }),
      seg('[key:/.*username.*/]', 'key', "key '*username*'", {
        name: '.*username.*',
        fuzzy: true,
        reserved: true,
      }),
    ] as any,
    condition: 'equal',
    value: '*admin*',
    ignoreCase: true,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            Wildcard matching example:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>* stands for any text in key names</li>
          <li>*username* matches "admin_username", "username_hash", etc.</li>
          <li>Case-insensitive matching enabled</li>
        </ul>
      </div>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

export const MultiFormatParsing: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('body', 'Body'),
      ENCODINGS.gzip,
      FORMATS.json,
      keySeg('data'),
      keySeg('user'),
      keySeg('id'),
    ] as any,
    condition: 'equal',
    value: '12345',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            Multi-stage parsing example:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>Body → gzip decompress → JSON parse</li>
          <li>Navigate nested keys: data.user.id</li>
          <li>Check if id equals "12345"</li>
        </ul>
      </div>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

// Point-only mode (for action targets)
export const PointOnlyMode: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('x-custom-header')] as any,
    condition: null,
    value: '',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <Text size='sm' color='secondary'>
          Point-only mode: used for action targets where you only need to specify WHERE, not HOW to
          match.
        </Text>
      </div>
      <PointSelector
        context='http_request'
        value={value}
        onChange={setValue}
        pointOnly={true}
        title='Where to apply the action?'
      />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Generated segments:
          </Text>
        </div>
        <div className='break-all font-mono text-sm'>
          {value.segments.map(s => s.text).join('') || '—'}
        </div>
      </div>
    </div>
  );
};

// With initial value
export const WithInitialValue: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('authorization')] as any,
    condition: 'startswith',
    value: 'Bearer ',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <PointSelector
        data-testid='point-selector'
        context='http_request'
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

// Canonical form feedback - demonstrates wildcard folding
export const CanonicalFormFeedback: StoryFn = () => {
  // Start with a point that will be canonicalized: [key:*][key:**] → [key:+]
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('body', 'Body'),
      FORMATS.json,
      // Two adjacent wildcards that will fold: [key:*][key:**] → [key:+]
      { kind: 'wildcard', kinds: ['key'], quant: 'one', text: '[key:*]', label: 'one key' },
      {
        kind: 'wildcard',
        kinds: ['key'],
        quant: 'zero_or_more',
        text: '[key:**]',
        label: 'zero or more keys',
      },
    ] as any,
    condition: 'exists',
    value: '',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            This story demonstrates canonical form feedback. The point uses adjacent wildcards{' '}
            <code className='rounded-4 bg-bg-surface-3 px-4 py-2 font-mono text-xs'>
              [key:*][key:**]
            </code>{' '}
            which the SDK canonicalizes to{' '}
            <code className='rounded-4 bg-bg-surface-3 px-4 py-2 font-mono text-xs'>[key:+]</code>.
          </Text>
        </div>
        <Text size='sm' color='secondary'>
          This is an educational feature, not an error. It helps users understand how the system
          normalizes their points for consistency and duplicate detection.
        </Text>
      </div>
      <PointSelector
        data-testid='point-selector'
        context='http_request'
        value={value}
        onChange={setValue}
      />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Canonical form (stored):
          </Text>
        </div>
        <div className='break-all font-mono text-sm'>{value.canonical || '—'}</div>
      </div>
    </div>
  );
};

/**
 * Reference Ruleset Coverage
 *
 * Tests point construction for ALL major constructs from reference-ruleset.json.
 * Each example represents a unique grammar/tree-shape feature that must be buildable
 * step-by-step in the selector.
 *
 * Coverage categories:
 * 1. Native points (all 10 HTTP natives + 4 SSE natives)
 * 2. Key kinds (element, array, attribute, byte-exact, roles)
 * 3. Content markers (all parsers + encoders)
 * 4. Wildcards (all quantifiers: *, **, ?, +)
 * 5. Alternations (element, attribute, format sets)
 * 6. Duplicate selectors ([dup:0], [dup:-1], [dup:all], [dup:any])
 * 7. Special constructs (caseless keys, joined groups, MCP alias)
 */
export const ReferenceRulesetCoverage: StoryFn = () => {
  const [selectedExample, setSelectedExample] = useState(0);
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  // Reference ruleset point examples - all major constructs
  const REFERENCE_EXAMPLES = [
    // === NATIVE POINTS ===
    {
      category: 'HTTP Natives',
      label: '[http:method]',
      canonical: '[http:method]',
      desc: 'HTTP method (GET, POST, etc.)',
    },
    {
      category: 'HTTP Natives',
      label: '[http:proto]',
      canonical: '[http:proto]',
      desc: 'Protocol version (HTTP/1.1, HTTP/2.0)',
    },
    {
      category: 'HTTP Natives',
      label: '[http:url]',
      canonical: '[http:url]',
      desc: 'Full request URL',
    },
    {
      category: 'HTTP Natives',
      label: '[http:path]',
      canonical: '[http:path]',
      desc: 'URL path with numbered segments',
    },
    {
      category: 'HTTP Natives',
      label: '[http:path][1]',
      canonical: '[http:path][1]',
      desc: 'Second path segment (0-indexed)',
    },
    {
      category: 'HTTP Natives',
      label: '[http:query]',
      canonical: '[http:query]',
      desc: 'Query string (auto-parsed as form)',
    },
    {
      category: 'HTTP Natives',
      label: '[http:header]',
      canonical: '[http:header]',
      desc: 'Header container',
    },
    {
      category: 'HTTP Natives',
      label: '[http:body]',
      canonical: '[http:body]',
      desc: 'Request/response body',
    },
    {
      category: 'HTTP Natives',
      label: '[http:status]',
      canonical: '[http:status]',
      desc: 'Response status code (response context only)',
    },

    // === KEY KINDS ===
    {
      category: 'Key Kinds',
      label: "['users']",
      canonical: "[http:body][format:json]['users']",
      desc: 'Element key (JSON/form/multipart)',
    },
    {
      category: 'Key Kinds',
      label: '[4]',
      canonical: "[http:body][format:json]['users'][4]",
      desc: 'Array position (u32)',
    },
    {
      category: 'Key Kinds',
      label: "[attr:'@id']",
      canonical: "[http:body][format:xml]['root'][attr:'@id']",
      desc: 'XML attribute',
    },
    {
      category: 'Key Kinds',
      label: "[bytes:'%09tab']",
      canonical: "[http:body][format:json][bytes:'%09tab']",
      desc: 'Byte-exact key (tab character)',
    },
    {
      category: 'Key Kinds',
      label: '[role:name]',
      canonical: "[http:body][format:json]['name'][role:name]",
      desc: "Key's own text (scanned like a value)",
    },
    {
      category: 'Key Kinds',
      label: '[role:value]',
      canonical: '[http:body][format:xml][attr:*][role:value]',
      desc: 'Narrows wildcard to value entries only',
    },
    {
      category: 'Key Kinds',
      label: "[dup,joined:', ']",
      canonical: "[http:header]['cookie'][dup,joined:', ']",
      desc: 'Joined duplicate group',
    },

    // === CONTENT MARKERS (PARSERS) ===
    {
      category: 'Parsers',
      label: '[format:json]',
      canonical: '[http:body][format:json]',
      desc: 'JSON parser',
    },
    {
      category: 'Parsers',
      label: '[format:xml]',
      canonical: '[http:body][format:xml]',
      desc: 'XML parser',
    },
    {
      category: 'Parsers',
      label: '[format:form]',
      canonical: '[http:query][format:form]',
      desc: 'Form-urlencoded parser',
    },
    {
      category: 'Parsers',
      label: '[format:multipart]',
      canonical: '[http:body][format:multipart]',
      desc: 'Multipart parser',
    },
    {
      category: 'Parsers',
      label: '[format:cookie]',
      canonical: "[http:header]['cookie'][format:cookie]",
      desc: 'Cookie parser',
    },
    {
      category: 'Parsers',
      label: '[format:auth]',
      canonical: "[http:header]['authorization'][format:auth]",
      desc: 'Authorization parser',
    },
    {
      category: 'Parsers',
      label: '[format:jwt]',
      canonical: "[http:header]['authorization'][format:auth]['bearer'][format:jwt]",
      desc: 'JWT parser',
    },
    {
      category: 'Parsers',
      label: '[format:protobuf]',
      canonical: '[http:body][format:protobuf]',
      desc: 'Protobuf parser (no schema)',
    },
    {
      category: 'Parsers',
      label: '[format:mcp]',
      canonical: '[http:body][format:mcp]',
      desc: 'MCP alias (JSON-RPC methods)',
    },

    // === ENCODERS ===
    {
      category: 'Encoders',
      label: '[encoding:base64]',
      canonical: '[http:body][encoding:base64]',
      desc: 'Base64 decoder',
    },
    {
      category: 'Encoders',
      label: '[encoding:percent]',
      canonical: '[http:body][encoding:percent]',
      desc: 'Percent-encoding decoder',
    },
    {
      category: 'Encoders',
      label: '[encoding:gzip]',
      canonical: '[http:body][encoding:gzip]',
      desc: 'Gzip decompressor',
    },
    {
      category: 'Encoders',
      label: '[encoding:deflate]',
      canonical: '[http:body][encoding:deflate]',
      desc: 'Deflate decompressor',
    },
    {
      category: 'Encoders',
      label: '[encoding:brotli]',
      canonical: '[http:body][encoding:brotli]',
      desc: 'Brotli decompressor',
    },

    // === WILDCARDS ===
    {
      category: 'Wildcards',
      label: '[key:*]',
      canonical: "[http:body][format:json][key:*]['id']",
      desc: 'Exactly one key (never array positions)',
    },
    {
      category: 'Wildcards',
      label: '[arr|key:*]',
      canonical: "[http:body][format:json]['users'][arr|key:*]['id']",
      desc: 'One key OR array position',
    },
    {
      category: 'Wildcards',
      label: '[key:**]',
      canonical: '[http:body][format:json][key:**]',
      desc: 'Zero or more keys (recursive)',
    },
    {
      category: 'Wildcards',
      label: '[arr|key:**]',
      canonical: '[http:body][format:json][arr|key:**]',
      desc: 'All descendants (keys + positions)',
    },
    {
      category: 'Wildcards',
      label: '[key:?]',
      canonical: "[http:body][format:json]['a'][key:?]['b']",
      desc: 'At most one key (0 or 1)',
    },
    {
      category: 'Wildcards',
      label: '[encoding|format:+]',
      canonical: '[http:body][encoding|format:+]',
      desc: 'At least one marker (any parser/encoder)',
    },
    {
      category: 'Wildcards',
      label: '[**]',
      canonical: '[**]',
      desc: 'Any kind, any depth (all 7 kinds)',
    },
    {
      category: 'Wildcards',
      label: '[http:*]',
      canonical: '[http:*]',
      desc: 'Any HTTP native point',
    },

    // === ALTERNATIONS ===
    {
      category: 'Alternations',
      label: "['a'|'b']",
      canonical: "[http:body][format:json]['a'|'b']",
      desc: 'Element alternation (a OR b)',
    },
    {
      category: 'Alternations',
      label: "[i:'foo']",
      canonical: "[http:header][i:'authorization']",
      desc: 'Caseless key (ASCII case-insensitive)',
    },
    {
      category: 'Alternations',
      label: "['bar'|i:'foo']",
      canonical: "[http:body][format:json]['bar'|i:'foo']",
      desc: 'Mixed case sensitivity (per member)',
    },
    {
      category: 'Alternations',
      label: "[attr:'@id'|'@lang']",
      canonical: "[http:body][format:xml]['root'][attr:'@id'|i:'@lang']",
      desc: 'Attribute alternation',
    },
    {
      category: 'Alternations',
      label: '[format:json|xml]',
      canonical: '[http:body][format:json|xml]',
      desc: 'Format alternation (JSON OR XML)',
    },

    // === DUPLICATE SELECTORS ===
    {
      category: 'Duplicates',
      label: '[dup:0]',
      canonical: "[http:header]['cookie'][format:cookie]['session'][dup:0]",
      desc: 'First duplicate (0-indexed)',
    },
    {
      category: 'Duplicates',
      label: '[dup:1]',
      canonical: "[http:header]['set-cookie'][dup:1]",
      desc: 'Second duplicate',
    },
    {
      category: 'Duplicates',
      label: '[dup:-1]',
      canonical: "[http:header]['x-forwarded-for'][dup:-1]",
      desc: 'Last duplicate (resolved at end of stream)',
    },
    {
      category: 'Duplicates',
      label: '[dup:all]',
      canonical: "[http:body][format:json][arr|key:**]['token'][dup:all]",
      desc: 'Universal quantifier (every duplicate must satisfy)',
    },
    {
      category: 'Duplicates',
      label: '[dup:any]',
      canonical: "[http:header]['cache-control'][dup:any]",
      desc: 'Existential (condition-only, default)',
    },

    // === MCP ALIAS (special) ===
    {
      category: 'MCP Alias',
      label: "[method:'tools/call']",
      canonical: "[http:body][format:mcp][method:'tools/call']",
      desc: 'MCP method name',
    },
    {
      category: 'MCP Alias',
      label: '[method:*]',
      canonical: '[http:body][format:mcp][method:*]',
      desc: 'Any MCP method',
    },
    {
      category: 'MCP Alias',
      label: '[method]',
      canonical: '[http:body][format:mcp][method]',
      desc: 'MCP method value (bare)',
    },
    {
      category: 'MCP Alias',
      label: "['params'][dup:0]",
      canonical: "[http:body][format:mcp]['params'][dup:0]['name']",
      desc: 'MCP params with duplicate selector',
    },

    // === COMPLEX PATHS ===
    {
      category: 'Complex',
      label: 'JWT claim',
      canonical:
        "[http:header]['authorization'][format:auth]['bearer'][format:jwt]['payload'][encoding:base64][format:json]['sub']",
      desc: 'JWT → base64 → JSON → claim',
    },
    {
      category: 'Complex',
      label: 'Nested wildcard',
      canonical: "[http:body][format:json]['fields']['description'][**]",
      desc: 'Specific path then recursive wildcard',
    },
    {
      category: 'Complex',
      label: 'Multi-level array',
      canonical: "[http:body][format:json]['users'][4]['emails'][0]",
      desc: 'Array positions at multiple levels',
    },
    {
      category: 'Complex',
      label: 'Cross-kind wildcard',
      canonical: '[http:*][arr|key:**]',
      desc: 'Any native → all descendants',
    },
  ];

  const currentExample = REFERENCE_EXAMPLES[selectedExample];
  const categories = [...new Set(REFERENCE_EXAMPLES.map(e => e.category))];

  return (
    <div className='flex w-[900px] flex-col gap-16'>
      {/* Category tabs */}
      <div className='flex flex-wrap gap-4'>
        {categories.map(cat => {
          const categoryExamples = REFERENCE_EXAMPLES.filter(e => e.category === cat);
          const isActive = categoryExamples.some(
            (_, i) => REFERENCE_EXAMPLES.indexOf(_) === selectedExample,
          );
          return (
            <Button
              key={cat}
              variant={isActive ? 'primary' : 'outline'}
              color={isActive ? 'brand' : 'neutral'}
              size='small'
              onClick={() => {
                const firstInCategory = REFERENCE_EXAMPLES.findIndex(e => e.category === cat);
                setSelectedExample(firstInCategory);
              }}
            >
              {cat}
            </Button>
          );
        })}
      </div>

      {/* Example selector */}
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-1 p-12'>
        <div className='mb-8 flex items-center justify-between'>
          <Text size='sm' weight='medium'>
            {currentExample?.category} Examples
          </Text>
          <Text size='xs' color='secondary'>
            {selectedExample + 1} / {REFERENCE_EXAMPLES.length}
          </Text>
        </div>
        <div className='mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
          {REFERENCE_EXAMPLES.filter(e => e.category === currentExample?.category).map(
            (example, i) => {
              const globalIndex = REFERENCE_EXAMPLES.indexOf(example);
              return (
                <Button
                  key={globalIndex}
                  variant={globalIndex === selectedExample ? 'primary' : 'outline'}
                  color={globalIndex === selectedExample ? 'brand' : 'neutral'}
                  size='small'
                  onClick={() => setSelectedExample(globalIndex)}
                  className='justify-start font-mono text-xs'
                >
                  {example.label}
                </Button>
              );
            },
          )}
        </div>
        <div className='rounded-8 bg-bg-surface-2 p-12'>
          <div className='mb-4'>
            <Text size='xs' color='secondary'>
              Canonical form:
            </Text>
          </div>
          <div className='mb-8 break-all font-mono text-sm'>{currentExample?.canonical}</div>
          <Text size='xs' color='secondary'>
            {currentExample?.desc}
          </Text>
        </div>
      </div>

      {/* Point Selector */}
      <PointSelector
        data-testid='reference-coverage-selector'
        context='http_request'
        value={value}
        onChange={setValue}
      />

      {/* Built point display */}
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' weight='medium' color='secondary'>
            Your point:
          </Text>
        </div>
        <div className='mb-8 break-all font-mono text-sm'>{value.canonical || '(empty)'}</div>
        {value.canonical && currentExample && value.canonical === currentExample.canonical && (
          <div className='flex items-center gap-6 text-text-success'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-16 w-16'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
            <div className='text-text-success'>
              <Text size='sm' weight='medium'>
                ✓ Matches reference point!
              </Text>
            </div>
          </div>
        )}
        {value.canonical && value.canonical !== currentExample?.canonical && (
          <div className='text-text-warning'>
            <Text size='xs' weight='medium'>
              ⚠ Does not match reference (try another example or reset)
            </Text>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className='rounded-12 border border-border-info-light bg-bg-info-surface p-12'>
        <Text size='sm'>
          <strong>Instructions:</strong> Select an example from the buttons above, then try to build
          that exact point step-by-step in the selector. The "✓ Matches" indicator will appear when
          your point matches the canonical form.
        </Text>
      </div>
    </div>
  );
};

/**
 * Profile Selector
 *
 * Demonstrates the profile selector UI for switching between validation profiles:
 * - 'tree' (default): What can exist in traffic
 * - 'value': Single readable value (for session rules)
 * - 'grammar': Pure syntax check
 *
 * The profile selector only appears when onProfileChange callback is provided.
 */
export const WithProfileSelector: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [profile, setProfile] = useState<'tree' | 'value' | 'grammar'>('tree');

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            Profile selector demonstrates different validation modes:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>
            <strong>Tree</strong>: Validates against traffic structure (default)
          </li>
          <li>
            <strong>Value</strong>: Requires single readable value (no wildcards/containers)
          </li>
          <li>
            <strong>Grammar</strong>: Pure syntax validation only
          </li>
        </ul>
      </div>
      <PointSelector
        data-testid='point-selector-with-profile'
        context='http_request'
        value={value}
        onChange={setValue}
        profile={profile}
        onProfileChange={setProfile}
      />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Current profile: <strong>{profile}</strong>
          </Text>
        </div>
        <Text size='xs' color='secondary'>
          Point: {value.canonical || '(empty)'}
        </Text>
      </div>
    </div>
  );
};

/**
 * Async Keys Provider
 *
 * Demonstrates async keys provider with simulated network delay.
 * Shows loading state and debounced requests.
 */
export const AsyncKeys: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [requestLog, setRequestLog] = useState<string[]>([]);

  // Simulate network delay and track requests
  const keysProvider = async (parent: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRequestLog(prev => [...prev, `${timestamp}: Fetching keys for ${parent}`]);

    // Simulate 500ms network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return different keys based on parent
    if (parent === '[http:header]') {
      return ['authorization', 'content-type', 'cookie', 'x-api-key', 'x-request-id'];
    }
    if (parent.includes('[format:json]')) {
      return ['user', 'email', 'sessionId', 'accountId', 'metadata'];
    }
    if (parent.includes('[format:xml]')) {
      return ['root', 'data', 'record', 'item'];
    }
    return [];
  };

  return (
    <div className='flex w-[800px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            Async keys provider demonstration:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>Select Header (3) to see async loading for header names</li>
          <li>Requests are debounced by 300ms (configurable)</li>
          <li>Watch the request log below to see when fetches occur</li>
          <li>Duplicate requests are automatically deduplicated</li>
        </ul>
      </div>

      <PointSelector
        data-testid='async-keys-selector'
        context='http_request'
        value={value}
        onChange={setValue}
        keys={keysProvider}
        keysDebounceMs={300}
      />

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' weight='medium' color='secondary'>
            Request Log:
          </Text>
        </div>
        {requestLog.length === 0 ? (
          <Text size='xs' color='secondary'>
            No requests yet. Start building a point to trigger key fetches.
          </Text>
        ) : (
          <div className='space-y-2 font-mono text-xs'>
            {requestLog.map((log, i) => (
              <div key={i} className='text-text-secondary'>
                {log}
              </div>
            ))}
          </div>
        )}
        {requestLog.length > 0 && (
          <div className='mt-8'>
            <Button
              variant='outline'
              color='neutral'
              size='small'
              onClick={() => setRequestLog([])}
            >
              Clear log
            </Button>
          </div>
        )}
      </div>

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Current point: {value.canonical || '(empty)'}
          </Text>
        </div>
        <Text size='xs' color='secondary'>
          Segments: {value.segments.map(s => s.text).join('') || '—'}
        </Text>
      </div>
    </div>
  );
};

/**
 * Async Keys with Caching
 *
 * Demonstrates the recommended caching pattern for async keys.
 * Cached keys return instantly (no loading state), uncached keys show loading.
 */
export const AsyncKeysWithCaching: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [requestLog, setRequestLog] = useState<string[]>([]);
  const cacheRef = useRef(new Map<string, string[]>());

  const keysProvider = async (parent: string) => {
    // Return cached if available (sync path)
    if (cacheRef.current.has(parent)) {
      const timestamp = new Date().toLocaleTimeString();
      setRequestLog(prev => [...prev, `${timestamp}: Cache hit for ${parent}`]);
      return cacheRef.current.get(parent)!;
    }

    // Fetch from "backend"
    const timestamp = new Date().toLocaleTimeString();
    setRequestLog(prev => [...prev, `${timestamp}: Fetching keys for ${parent}`]);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    let keys: string[] = [];
    if (parent === '[http:header]') {
      keys = ['authorization', 'content-type', 'cookie', 'accept', 'user-agent'];
    } else if (parent.includes('[format:json]')) {
      keys = ['id', 'name', 'email', 'createdAt', 'updatedAt'];
    }

    // Cache for future use
    cacheRef.current.set(parent, keys);

    return keys;
  };

  return (
    <div className='flex w-[800px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            Caching pattern demonstration:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>First request: shows loading state (~400ms delay)</li>
          <li>Subsequent requests: instant (returned from cache)</li>
          <li>Try backtracking and re-entering a step to see cache hits</li>
        </ul>
      </div>

      <PointSelector
        data-testid='cached-async-keys-selector'
        context='http_request'
        value={value}
        onChange={setValue}
        keys={keysProvider}
      />

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6 flex items-center justify-between'>
          <Text size='xs' weight='medium' color='secondary'>
            Request Log ({requestLog.length} events):
          </Text>
          {requestLog.length > 0 && (
            <Button
              variant='outline'
              color='neutral'
              size='small'
              onClick={() => {
                setRequestLog([]);
                cacheRef.current.clear();
              }}
            >
              Clear cache & log
            </Button>
          )}
        </div>
        {requestLog.length === 0 ? (
          <Text size='xs' color='secondary'>
            No requests yet. Build a point to trigger fetches.
          </Text>
        ) : (
          <div className='max-h-[200px] space-y-2 overflow-y-auto font-mono text-xs'>
            {requestLog.map((log, i) => (
              <div
                key={i}
                className={log.includes('Cache hit') ? 'text-text-success' : 'text-text-secondary'}
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Cache size: {cacheRef.current.size} parent(s)
          </Text>
        </div>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Current point: {value.canonical || '(empty)'}
          </Text>
        </div>
      </div>
    </div>
  );
};

/**
 * Async Keys with Custom Debounce
 *
 * Demonstrates configurable debounce delay via keysDebounceMs prop.
 */
export const AsyncKeysCustomDebounce: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [debounceMs, setDebounceMs] = useState(300);
  const [requestLog, setRequestLog] = useState<string[]>([]);

  const keysProvider = async (parent: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRequestLog(prev => [
      ...prev,
      `${timestamp}: Request for ${parent} (debounce: ${debounceMs}ms)`,
    ]);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (parent === '[http:header]') {
      return ['authorization', 'cookie', 'x-custom-header'];
    }
    return [];
  };

  return (
    <div className='flex w-[800px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            Custom debounce demonstration:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>Adjust debounce delay with the slider below</li>
          <li>Lower values: more responsive, but more requests</li>
          <li>Higher values: fewer requests, but slower UX</li>
          <li>Watch request timestamps in the log</li>
        </ul>
      </div>

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-8 flex items-center gap-12'>
          <Text size='sm' weight='medium'>
            Debounce delay: {debounceMs}ms
          </Text>
        </div>
        <input
          type='range'
          min='0'
          max='1000'
          step='50'
          value={debounceMs}
          onChange={e => setDebounceMs(Number(e.target.value))}
          className='w-full'
        />
        <div className='mt-4 flex justify-between text-xs text-text-secondary'>
          <span>0ms (instant)</span>
          <span>500ms</span>
          <span>1000ms</span>
        </div>
      </div>

      <PointSelector
        key={debounceMs} // Remount on debounce change
        data-testid='custom-debounce-selector'
        context='http_request'
        value={value}
        onChange={setValue}
        keys={keysProvider}
        keysDebounceMs={debounceMs}
      />

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6 flex items-center justify-between'>
          <Text size='xs' weight='medium' color='secondary'>
            Request Log:
          </Text>
          {requestLog.length > 0 && (
            <Button
              variant='outline'
              color='neutral'
              size='small'
              onClick={() => setRequestLog([])}
            >
              Clear log
            </Button>
          )}
        </div>
        {requestLog.length === 0 ? (
          <Text size='xs' color='secondary'>
            No requests yet.
          </Text>
        ) : (
          <div className='max-h-[150px] space-y-2 overflow-y-auto font-mono text-xs'>
            {requestLog.map((log, i) => (
              <div key={i} className='text-text-secondary'>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Profile Changes Re-validate Point
 *
 * Demonstrates that changing the profile re-validates the current point.
 * Try building a wildcard point (e.g., [http:header]['*']) and switching
 * from 'tree' to 'value' profile - it should show a validation error.
 */
export const ProfileRevalidation: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    // Start with a wildcard point that's valid in 'tree' but invalid in 'value'
    segments: [
      nativeSeg('header', 'Header'),
      { kind: 'key', value: '*', text: "['*']", label: "key '*'" },
    ] as any,
    condition: null,
    value: '',
    ignoreCase: false,
    canonical: null,
    canonicalVersion: null,
  });
  const [profile, setProfile] = useState<'tree' | 'value' | 'grammar'>('tree');

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            This story shows how profile changes trigger re-validation:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>
            <code className='rounded-4 bg-bg-surface-3 px-4 py-2 font-mono text-xs'>
              [http:header]['*']
            </code>{' '}
            is valid in <strong>tree</strong> profile (wildcard allowed)
          </li>
          <li>
            But invalid in <strong>value</strong> profile (must be single readable value)
          </li>
          <li>Switch profiles to see validation errors appear/disappear</li>
        </ul>
      </div>
      <PointSelector
        data-testid='point-selector-revalidation'
        context='http_request'
        value={value}
        onChange={setValue}
        profile={profile}
        onProfileChange={setProfile}
        pointOnly={true}
        title='Point with wildcard'
      />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Current profile: <strong>{profile}</strong>
          </Text>
        </div>
        <Text size='xs' color='secondary'>
          Point: {value.canonical || '(empty)'}
        </Text>
        <div className='mt-8'>
          {profile === 'tree' && (
            <div className='text-text-success'>
              <Text size='xs'>✓ Valid in tree profile (wildcards allowed)</Text>
            </div>
          )}
          {profile === 'value' && (
            <div className='text-text-warning'>
              <Text size='xs'>⚠ Will show error in value profile (wildcard not allowed)</Text>
            </div>
          )}
          {profile === 'grammar' && (
            <div className='text-text-success'>
              <Text size='xs'>✓ Valid in grammar profile (syntax only)</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Parser Vocabulary Demonstration
 *
 * Shows how parser-planted keys appear in completions automatically.
 * These are structural keys added by parsers, not from wire data.
 *
 * Try typing these to see parser vocabulary:
 * - [http:body][format:jwt] → offers 'header', 'payload', 'signature', 'prefix'
 * - [http:header]['authorization'][format:auth] → offers 'bearer', 'basic', 'digest'
 * - [http:header]['authorization'][format:auth]['basic'] → offers 'user', 'pass'
 * - [http:body][format:protobuf][3][format:protobuf][1] → offers 'varint', 'i32', 'i64'
 *
 * Reference: packages/docs/parsers/*.md
 */
export const ParserVocabulary: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='flex w-[600px] flex-col gap-16'>
      <div>
        <div className='mb-8'>
          <Text size='sm' weight='medium'>
            Parser Vocabulary Examples
          </Text>
        </div>
        <ul className='list-disc space-y-4 pl-20 text-sm text-text-secondary'>
          <li>
            <strong>JWT parser:</strong> After <code>[format:jwt]</code>, completion offers{' '}
            <code>['header']</code>, <code>['payload']</code>, <code>['signature']</code>
          </li>
          <li>
            <strong>Auth parser:</strong> After <code>[format:auth]</code>, offers{' '}
            <code>['bearer']</code>, <code>['basic']</code>, <code>['digest']</code>
          </li>
          <li>
            <strong>Basic auth:</strong> After <code>['basic']</code>, offers <code>['user']</code>,{' '}
            <code>['pass']</code>
          </li>
          <li>
            <strong>Protobuf:</strong> After field numbers, offers <code>['varint']</code>,{' '}
            <code>['i32']</code>, <code>['i64']</code>
          </li>
        </ul>
        <div className='mt-12 rounded-8 bg-bg-surface-3 p-12'>
          <div className='mb-6'>
            <Text size='xs' color='secondary'>
              Note: These keys are <strong>parser-planted</strong>, not from wire data. They appear
              even when no backend keys provider is configured.
            </Text>
          </div>
          <Text size='xs' color='secondary'>
            Source:{' '}
            <code className='rounded-4 bg-bg-surface-1 px-4 py-2'>
              @wallarm-org/rules-lib/staticKeysProvider
            </code>
          </Text>
        </div>
      </div>
      <PointSelector
        data-testid='point-selector-parser-vocab'
        context='http_request'
        value={value}
        onChange={setValue}
        title='Try typing parser-specific points'
      />
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Current point:
          </Text>
        </div>
        <code className='block rounded-4 bg-bg-surface-3 p-8 font-mono text-xs'>
          {value.canonical || '(empty)'}
        </code>
        {value.segments.length > 0 && (
          <div className='mt-8'>
            <Text size='xs' color='secondary'>
              Segments: {value.segments.length}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SDK Error Fixes (Quick Actions)
 *
 * Demonstrates SDK error fixes UI with clickable suggestions.
 * The SDK returns error.fixes array with quick actions to fix validation errors.
 *
 * Example: Typing `[http:body]['user']` shows error with fix: "Insert [format:json]" at position 12.
 */
export const ErrorFixes: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='flex w-[700px] flex-col gap-16'>
      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-16'>
        <div className='mb-8'>
          <Text size='sm' color='secondary'>
            SDK Error Fixes demonstration:
          </Text>
        </div>
        <ul className='list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>Build a point like: Body &gt; type "user" (without format:json)</li>
          <li>SDK will show error: "Point cannot reach under [http:body]"</li>
          <li>Quick fix button appears: "Insert [format:json]"</li>
          <li>Click the fix button (or press Ctrl+1) to apply it</li>
          <li>Point becomes: [http:body][format:json]['user']</li>
        </ul>
      </div>

      <PointSelector
        data-testid='point-selector-error-fixes'
        context='http_request'
        value={value}
        onChange={setValue}
        title='Try building an invalid point'
      />

      <div className='rounded-12 border border-border-info-light bg-bg-info-surface p-12'>
        <Text size='sm'>
          <strong>Try these to see error fixes:</strong>
        </Text>
        <ul className='mt-8 list-disc space-y-2 pl-20 text-sm text-text-secondary'>
          <li>
            <code className='rounded-4 bg-bg-surface-1 px-4 py-2 font-mono text-xs'>
              [http:body]['user']
            </code>{' '}
            → suggests adding [format:json]
          </li>
          <li>
            Type an invalid native (e.g., <code className='font-mono'>metho</code> instead of{' '}
            <code className='font-mono'>method</code>) → suggests corrections
          </li>
          <li>
            Keyboard shortcut:{' '}
            <kbd className='rounded-4 bg-bg-surface-1 px-4 py-2 font-mono text-xs'>Ctrl+1</kbd>{' '}
            applies the first fix,{' '}
            <kbd className='rounded-4 bg-bg-surface-1 px-4 py-2 font-mono text-xs'>Ctrl+2</kbd>{' '}
            applies the second, etc.
          </li>
        </ul>
      </div>

      <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
        <div className='mb-6'>
          <Text size='xs' color='secondary'>
            Current point:
          </Text>
        </div>
        <code className='block rounded-4 bg-bg-surface-3 p-8 font-mono text-xs'>
          {value.canonical || '(empty)'}
        </code>
        {value.segments.length > 0 && (
          <div className='mt-8'>
            <Text size='xs' color='secondary'>
              Segments: {value.segments.length}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};
