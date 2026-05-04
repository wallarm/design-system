import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { ParameterPath } from './ParameterPath';
import type { HttpMethod } from './types';

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

export const Playground: StoryFn<typeof meta> = args => <ParameterPath {...args} />;
Playground.args = {
  method: 'POST' satisfies HttpMethod,
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
