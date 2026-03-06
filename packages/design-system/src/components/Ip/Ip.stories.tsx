import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Text } from '../Text';
import { Ip } from './Ip';
import { IpAddress } from './IpAddress';
import { IpCountry } from './IpCountry';
import { IpList } from './IpList';
import { IpPort } from './IpPort';
import { IpProvider } from './IpProvider';

const meta: Meta = {
  title: 'Data Display/Ip',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Basic: StoryFn = () => (
  <div className='flex items-center gap-12'>
    <VStack gap={8} align='end'>
      <Text size='sm'>Basic:</Text>
      <Text size='sm'>With country flag:</Text>
      <Text size='sm'>With port:</Text>
      <Text size='sm'>With provider:</Text>
      <Text size='sm'>IPv6:</Text>
    </VStack>
    <VStack gap={8} align='start' style={{ maxWidth: '200px' }}>
      <Ip>
        <IpAddress>8.8.8.8</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='US' />
        <IpAddress>1.1.1.1</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='DE' />
        <IpAddress>77.88.8.8</IpAddress>
        <IpPort>:8080</IpPort>
      </Ip>
      <Ip>
        <IpCountry code='NL' />
        <IpAddress>20.33.0.0</IpAddress>
        <IpProvider>Azure</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='JP' />
        <IpAddress>2001:0db8:85a3:0000:0000:8a2e:0370:7334</IpAddress>
        <IpProvider>GCP</IpProvider>
      </Ip>
    </VStack>
  </div>
);

export const MultipleAddresses: StoryFn = () => (
  <VStack gap={12}>
    <IpList>
      <Ip>
        <IpCountry code='US' />
        <IpAddress>8.8.8.8</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='AU' />
        <IpAddress>1.1.1.1</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='DE' />
        <IpAddress>77.88.8.8</IpAddress>
      </Ip>
    </IpList>
    <IpList>
      <Ip>
        <IpCountry code='NL' />
        <IpAddress>52.94.76.0</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='NL' />
        <IpAddress>20.33.0.0</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='AZ' />
        <IpAddress>35.190.0.0</IpAddress>
        <IpProvider>GCP</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='US' />
        <IpAddress>169.55.0.0</IpAddress>
        <IpProvider>IBM Cloud</IpProvider>
      </Ip>
      <Ip>
        <IpAddress>88.198.0.0</IpAddress>
        <IpPort>:8080</IpPort>
      </Ip>
    </IpList>
    <IpList>
      <Ip>
        <IpAddress>10.0.0.1</IpAddress>
        <IpPort>:8080</IpPort>
        <IpProvider>Tor</IpProvider>
      </Ip>
      <Ip>
        <IpAddress>10.0.0.2</IpAddress>
        <IpPort>:443</IpPort>
        <IpProvider>VPN</IpProvider>
      </Ip>
    </IpList>
  </VStack>
);
