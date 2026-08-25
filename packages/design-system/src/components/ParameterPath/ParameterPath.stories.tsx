import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import type { HttpMethodName } from '../HttpMethod';
import { VStack } from '../Stack';
import { ParameterPath } from './ParameterPath';

const DESCRIPTION = [
  'Shows where in a request a parameter lives — the method, then each container down to the parameter itself, with the last segment highlighted and carrying a bolt when `attack` marks it as the one that was hit.',
  'Copying a path yields a `FilterInput` query rather than the text on screen — `method = "POST" AND parameter = "JSON.nginx_config"` — so a finding can be pasted straight into a search.',
].join(' ');

const meta = {
  title: 'Data Display/ParameterPath',
  component: ParameterPath,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    method: {
      control: 'select',
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', undefined],
    },
    attack: { control: 'boolean' },
    expandable: { control: 'boolean' },
    defaultExpanded: { control: 'boolean' },
  },
} satisfies Meta<typeof ParameterPath>;

export default meta;

/**
 * Every part at once: a method, two segments, an encoding, and the `attack` bolt on the
 * parameter that was hit.
 */
export const FullPath: StoryFn<typeof meta> = () => (
  <ParameterPath method='POST' segments={['JSON', 'nginx_config']} encoding='BASE64' attack />
);

/**
 * With no `encoding` the trailing chip simply goes, and the path ends on the parameter.
 */
export const NoEncoding: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['query', 'filter']} attack />
);

/**
 * A numeric segment: `path › 2` is the second element of the URL path, which is how a BOLA
 * finding points at a resource id rather than a named field.
 */
export const PathIndexBola: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['path', '2']} attack />
);

/**
 * The container need not be a body — here the parameter is a request header, and the first
 * segment is what says so.
 */
export const Header: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['header', 'X-Forwarded-For']} attack />
);

/**
 * The same shape for a cookie: first segment names where the value came from, last names
 * the value.
 */
export const Cookie: StoryFn<typeof meta> = () => (
  <ParameterPath method='POST' segments={['cookie', 'session_id']} attack />
);

/**
 * Seven segments in 280px: the middle collapses to an ellipsis and the full path moves into
 * a tooltip. The truncation is measured, not a CSS clip, so it reacts to the real width.
 */
export const DeepNestedTruncated: StoryFn<typeof meta> = () => (
  <div style={{ width: 280 }}>
    <ParameterPath
      method='POST'
      segments={['multipart', 'json_abc', 'json_doc', 'qwerty_doc', 'hash', 'formData', 'get']}
      attack
    />
  </div>
);

/**
 * `method` is optional — leave it out where the row around the path already says which
 * request this belongs to.
 */
export const NoMethod: StoryFn<typeof meta> = () => (
  <ParameterPath segments={['cookie', 'session_id']} attack />
);

// 600px keeps a wide margin below the path's natural width (~720px), so
// truncation survives font-metric differences between environments.
/**
 * `expandable` makes a truncated path clickable and focusable: it opens inline to show every
 * segment, and the tooltip stands down while it is open.
 */
export const ExpandableTruncated: StoryFn<typeof meta> = () => (
  <div style={{ width: 600 }}>
    {/* The root is w-full (it must span the available space to measure it),
        so centering happens inside the component, not on the container. */}
    <ParameterPath
      className='justify-center'
      method='POST'
      segments={[
        'multipart',
        'json_abc',
        'json_doc',
        'qwerty_doc',
        'hash',
        'formData',
        'session_token',
        'nested_payload',
        'get',
      ]}
      attack
      expandable
    />
  </div>
);

// The same expandable path in a container the full path fits into — the
// expand affordance stays inert (no ellipsis, not clickable).
/**
 * The same path given room to fit. `expandable` leaves no affordance behind when there is
 * nothing to expand — no ellipsis, no cursor, no focus stop.
 */
export const ExpandableFitsInline: StoryFn<typeof meta> = () => (
  <div style={{ width: 720, display: 'flex', justifyContent: 'center' }}>
    <ParameterPath
      method='POST'
      segments={['multipart', 'json_abc', 'json_doc', 'qwerty_doc', 'hash', 'formData', 'get']}
      attack
      expandable
    />
  </div>
);

/**
 * The props on controls, for trying a segment list or a method the stories above skip.
 */
export const Playground: StoryFn<typeof meta> = args => <ParameterPath {...args} />;
Playground.args = {
  method: 'POST' satisfies HttpMethodName,
  segments: ['JSON', 'nginx_config'],
  encoding: 'BASE64',
  attack: true,
};

/**
 * The shapes together, as they would read down a column of findings — with a narrow cell at
 * the bottom to show what happens when the column is the constraint.
 */
export const Gallery: StoryFn<typeof meta> = () => (
  <VStack gap={16}>
    <ParameterPath method='POST' segments={['JSON', 'nginx_config']} encoding='BASE64' attack />
    <ParameterPath method='GET' segments={['query', 'filter']} attack />
    <ParameterPath method='GET' segments={['path', '2']} attack />
    <ParameterPath method='GET' segments={['header', 'X-Forwarded-For']} attack />
    <ParameterPath method='POST' segments={['cookie', 'session_id']} attack />
    <div style={{ width: 280 }}>
      <ParameterPath method='POST' segments={['multipart', 'a', 'b', 'c', 'd', 'get']} attack />
    </div>
  </VStack>
);
