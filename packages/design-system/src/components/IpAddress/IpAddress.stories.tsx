import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { IpAddress } from './IpAddress';

const meta: Meta<typeof IpAddress> = {
  title: 'Data Display/IpAddress',
  component: IpAddress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Displays one or more IP addresses with optional country flag, port, and source badges.',
          'When multiple addresses are passed, the first is shown inline and the rest are available via a "+N addresses" popover.',
          '',
          '```ts',
          'interface IpAddressEntry {',
          '  ip: string;          // IPv4 or IPv6 address',
          '  port?: number;       // Optional port number',
          '  country?: string;    // ISO 3166-1 alpha-2 country code',
          '  sources?: SourceKey[]; // Datacenter or proxy type keys',
          '}',
          '',
          'type SourceKey = DatacenterKey | ProxyTypeKey;',
          '',
          "type DatacenterKey = 'alibaba' | 'aws' | 'azure' | 'docean' | 'gce' | 'hetzner' | 'huawei' | 'ibm' | 'linode' | 'oracle' | 'ovh' | 'plusserver' | 'rackspace' | 'tencent';",
          "type ProxyTypeKey = 'TOR' | 'VPN' | 'DCH' | 'SES' | 'MIP' | 'WEB' | 'PUB';",
          '```',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    addresses: {
      description: 'Array of IP address entries to display',
    },
  },
};

export default meta;

export const Basic: StoryFn<typeof meta> = () => (
  <div className='flex items-center gap-12'>
    <VStack spacing={8} align='end'>
      <Text size='sm'>Basic:</Text>
      <Text size='sm'>With country flag:</Text>
      <Text size='sm'>With port:</Text>
      <Text size='sm'>With sources:</Text>
      <Text size='sm'>IPv6:</Text>
    </VStack>
    <VStack spacing={8} align='start' style={{ maxWidth: '200px' }}>
      <IpAddress addresses={[{ ip: '8.8.8.8' }]} />
      <IpAddress addresses={[{ ip: '1.1.1.1', country: 'US' }]} />
      <IpAddress addresses={[{ ip: '77.88.8.8', port: 8080, country: 'DE' }]} />
      <IpAddress addresses={[{ ip: '20.33.0.0', country: 'NL', sources: ['azure'] }]} />
      <IpAddress
        addresses={[
          { ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334', country: 'JP', sources: ['gce'] },
        ]}
      />
    </VStack>
  </div>
);

export const MultipleAddresses: StoryFn<typeof meta> = () => (
  <VStack spacing={12}>
    <IpAddress
      addresses={[
        { ip: '8.8.8.8', country: 'US' },
        { ip: '1.1.1.1', country: 'AU' },
        { ip: '77.88.8.8', country: 'DE' },
      ]}
    />
    <IpAddress
      addresses={[
        { ip: '52.94.76.0', country: 'NL' },
        { ip: '20.33.0.0', country: 'NL' },
        { ip: '35.190.0.0', country: 'AZ', sources: ['gce'] },
        { ip: '169.55.0.0', country: 'US', sources: ['ibm'] },
        { ip: '88.198.0.0', port: 8080 },
      ]}
    />
    <IpAddress
      addresses={[
        { ip: '10.0.0.1', port: 8080, sources: ['TOR'] },
        { ip: '10.0.0.2', port: 443, sources: ['VPN'] },
      ]}
    />
  </VStack>
);
