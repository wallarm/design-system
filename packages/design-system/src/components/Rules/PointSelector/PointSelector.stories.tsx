import { useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  type ConditionType,
  ENCODINGS,
  FORMATS,
  headerSeg,
  keySeg,
  nativeSeg,
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

// Example points matching rules-frontend usage
const POINT_EXAMPLES = [
  {
    id: 'header',
    label: 'Header X-Api-Version',
    value: {
      segments: [nativeSeg('header', 'Header'), headerSeg('x-api-version')] as any,
      condition: 'equal' as ConditionType,
      value: '1',
      ignoreCase: false,
      canonical: "[http:header]['x-api-version']",
      canonicalVersion: null,
    },
  },
  {
    id: 'jwt-in-body',
    label: 'JWT claim in body JSON',
    value: {
      segments: [
        nativeSeg('body', 'Body'),
        ENCODINGS.gzip,
        FORMATS.json,
        keySeg('token'),
        FORMATS.jwt,
        seg("['payload']", 'key', 'payload', { name: 'payload' }),
        ENCODINGS.base64,
        FORMATS.json,
        keySeg('sub'),
      ] as any,
      condition: 'exists' as ConditionType,
      value: '',
      ignoreCase: false,
      canonical:
        "[http:body][encoding:gzip][format:json]['token'][format:jwt]['payload'][encoding:base64][format:json]['sub']",
      canonicalVersion: null,
    },
  },
  {
    id: 'bearer',
    label: 'Bearer token claim',
    value: {
      segments: [
        nativeSeg('header', 'Header'),
        headerSeg('authorization'),
        FORMATS.auth,
        seg("['bearer']", 'key', 'bearer', { name: 'bearer' }),
        FORMATS.jwt,
        seg("['payload']", 'key', 'payload', { name: 'payload' }),
        ENCODINGS.base64,
        FORMATS.json,
        keySeg('sub'),
      ] as any,
      condition: 'exists' as ConditionType,
      value: '',
      ignoreCase: false,
      canonical:
        "[http:header]['authorization'][format:auth]['bearer'][format:jwt]['payload'][encoding:base64][format:json]['sub']",
      canonicalVersion: null,
    },
  },
  {
    id: 'wildcard',
    label: 'Wildcard key search',
    value: {
      segments: [
        nativeSeg('body', 'Body'),
        FORMATS.json,
        seg('[**]', 'wild', 'any depth', { kinds: ['arr', 'key'], quant: '**' }),
        seg('[key:*username*]', 'key', '*username*', { name: '*username*', fuzzy: true }),
      ] as any,
      condition: 'equal' as ConditionType,
      value: '*admin*',
      ignoreCase: true,
      canonical: '[http:body][format:json][**][key:*username*]',
      canonicalVersion: null,
    },
  },
];

/**
 * Build from scratch
 *
 * Empty selector - start building a point from scratch.
 */
export const BuildFromScratch: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

/**
 * With examples
 *
 * Interactive selector with loadable examples (matches rules-frontend demo page).
 */
export const WithExamples: StoryFn = () => {
  const [context, setContext] = useState<RuleContext>('http_request');
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);
  const [mount, setMount] = useState(0);

  const handleContextChange = (next: string) => {
    setContext(next === 'http_response' ? 'http_response' : 'http_request');
    setValue(EMPTY);
    setMount(n => n + 1);
  };

  const handleExample = (exampleValue: PointSelectorValue) => {
    setContext('http_request');
    setValue(exampleValue);
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
      {value.canonical && (
        <div className='rounded-12 border border-border-primary-light bg-bg-surface-2 p-12'>
          <Text size='xs' color='secondary'>
            Point: {value.canonical}
          </Text>
        </div>
      )}
    </div>
  );
};

/**
 * HTTP Request context
 *
 * Selector configured for HTTP request context.
 */
export const HttpRequest: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

/**
 * HTTP Response context
 *
 * Selector configured for HTTP response context.
 */
export const HttpResponse: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>(EMPTY);

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_response' value={value} onChange={setValue} />
    </div>
  );
};

/**
 * With initial value
 *
 * Pre-populated selector with an initial point value.
 */
export const WithInitialValue: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [nativeSeg('header', 'Header'), headerSeg('x-api-version')] as any,
    condition: 'equal',
    value: '2.0',
    ignoreCase: false,
    canonical: "[http:header]['x-api-version']",
    canonicalVersion: null,
  });

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

/**
 * JWT claims
 *
 * Complex example showing JWT token parsing with nested formats and encodings.
 */
export const JWTClaims: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('header', 'Header'),
      headerSeg('authorization'),
      FORMATS.auth,
      seg("['bearer']", 'key', 'bearer', { name: 'bearer' }),
      FORMATS.jwt,
      seg("['payload']", 'key', 'payload', { name: 'payload' }),
      ENCODINGS.base64,
      FORMATS.json,
      keySeg('sub'),
    ] as any,
    condition: 'exists',
    value: '',
    ignoreCase: false,
    canonical:
      "[http:header]['authorization'][format:auth]['bearer'][format:jwt]['payload'][encoding:base64][format:json]['sub']",
    canonicalVersion: null,
  });

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

/**
 * With wildcards
 *
 * Example using wildcard segments for flexible matching.
 */
export const WithWildcards: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('body', 'Body'),
      FORMATS.json,
      seg('[**]', 'wild', 'any depth', { kinds: ['arr', 'key'], quant: '**' }),
      seg('[key:*username*]', 'key', '*username*', { name: '*username*', fuzzy: true }),
    ] as any,
    condition: 'equal',
    value: '*admin*',
    ignoreCase: true,
    canonical: '[http:body][format:json][**][key:*username*]',
    canonicalVersion: null,
  });

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};

/**
 * Multi-format parsing
 *
 * Example with multiple nested formats and encodings (gzip → JSON → JWT).
 */
export const MultiFormatParsing: StoryFn = () => {
  const [value, setValue] = useState<PointSelectorValue>({
    segments: [
      nativeSeg('body', 'Body'),
      ENCODINGS.gzip,
      FORMATS.json,
      keySeg('token'),
      FORMATS.jwt,
      seg("['payload']", 'key', 'payload', { name: 'payload' }),
      ENCODINGS.base64,
      FORMATS.json,
      keySeg('sub'),
    ] as any,
    condition: 'exists',
    value: '',
    ignoreCase: false,
    canonical:
      "[http:body][encoding:gzip][format:json]['token'][format:jwt]['payload'][encoding:base64][format:json]['sub']",
    canonicalVersion: null,
  });

  return (
    <div className='w-[600px]'>
      <PointSelector context='http_request' value={value} onChange={setValue} />
    </div>
  );
};
