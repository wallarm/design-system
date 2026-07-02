import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import type { HttpMethodName } from '../HttpMethod';
import { VStack } from '../Stack';
import { ParameterPath } from './ParameterPath';

const meta = {
  title: 'Data Display/ParameterPath',
  component: ParameterPath,
  parameters: { layout: 'centered' },
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

export const FullPath: StoryFn<typeof meta> = () => (
  <ParameterPath method='POST' segments={['JSON', 'nginx_config']} encoding='BASE64' attack />
);

export const NoEncoding: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['query', 'filter']} attack />
);

export const PathIndexBola: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['path', '2']} attack />
);

export const Header: StoryFn<typeof meta> = () => (
  <ParameterPath method='GET' segments={['header', 'X-Forwarded-For']} attack />
);

export const Cookie: StoryFn<typeof meta> = () => (
  <ParameterPath method='POST' segments={['cookie', 'session_id']} attack />
);

export const DeepNestedTruncated: StoryFn<typeof meta> = () => (
  <div style={{ width: 280 }}>
    <ParameterPath
      method='POST'
      segments={['multipart', 'json_abc', 'json_doc', 'qwerty_doc', 'hash', 'formData', 'get']}
      attack
    />
  </div>
);

export const NoMethod: StoryFn<typeof meta> = () => (
  <ParameterPath segments={['cookie', 'session_id']} attack />
);

export const ExpandableTruncated: StoryFn<typeof meta> = () => (
  <div style={{ width: 720 }}>
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

export const Playground: StoryFn<typeof meta> = args => <ParameterPath {...args} />;
Playground.args = {
  method: 'POST' satisfies HttpMethodName,
  segments: ['JSON', 'nginx_config'],
  encoding: 'BASE64',
  attack: true,
};

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
