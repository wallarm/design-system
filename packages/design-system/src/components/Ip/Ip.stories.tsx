import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { VStack } from '../Stack';
import { Ip } from './Ip';
import { IpAddress } from './IpAddress';
import { IpCountry } from './IpCountry';
import { IpList } from './IpList';
import { IpPort } from './IpPort';
import { IpProvider } from './IpProvider';

const DESCRIPTION = [
  'One IP address and what is known about it — the country it resolves to, the port, the provider owning the range — composed as a row in which the address is the identity and everything else is context.',
  '`IpList` collapses a set of them: vertical keeps the first and hides the rest behind a `+N addresses` link, horizontal fits as many as the width allows and puts the remainder in a `+N` badge.',
].join(' ');

const meta: Meta = {
  title: 'Data Display/Ip',
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
};

export default meta;

/**
 * The five compositions, from the address on its own up to an IPv6 with a provider. The
 * address truncates with a tooltip behind it, so the longest v6 still cannot widen its row.
 */
export const Basic: StoryFn = () => (
  <div className='grid grid-cols-[auto_200px] items-center gap-x-12 gap-y-8'>
    <span className='sb-annotation text-right'>basic</span>
    <Ip>
      <IpAddress>8.8.8.8</IpAddress>
    </Ip>

    <span className='sb-annotation text-right'>with country flag</span>
    <Ip>
      <IpCountry code='US' />
      <IpAddress>1.1.1.1</IpAddress>
    </Ip>

    <span className='sb-annotation text-right'>with port</span>
    <Ip>
      <IpCountry code='DE' />
      <IpAddress>77.88.8.8</IpAddress>
      <IpPort>:8080</IpPort>
    </Ip>

    <span className='sb-annotation text-right'>with provider</span>
    <Ip>
      <IpCountry code='NL' />
      <IpAddress>20.33.0.0</IpAddress>
      <IpProvider>Azure</IpProvider>
    </Ip>

    <span className='sb-annotation text-right'>IPv6</span>
    <Ip>
      <IpCountry code='JP' />
      <IpAddress>2001:0db8:85a3:0000:0000:8a2e:0370:7334</IpAddress>
      <IpProvider>GCP</IpProvider>
    </Ip>
  </div>
);

/**
 * Eight addresses in a 600px row: the ones that fit are separated by a middle dot, and the
 * rest fold into a `+N` badge that opens the full set in a popover.
 */
export const HorizontalMultiple: StoryFn = () => (
  <div style={{ width: 600 }}>
    <IpList type='horizontal' data-testid='horizontal-ips'>
      <Ip>
        <IpCountry code='ES' />
        <IpAddress>142.198.167.52</IpAddress>
        <IpProvider>Azure</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='US' />
        <IpAddress>34.74.73.20</IpAddress>
        <IpProvider>AWS</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='MY' />
        <IpAddress>34.74.73.21</IpAddress>
        <IpProvider>GCP</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='US' />
        <IpAddress>34.74.73.22</IpAddress>
        <IpProvider>AWS</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='MY' />
        <IpAddress>34.74.73.23</IpAddress>
        <IpProvider>GCP</IpProvider>
      </Ip>
      <Ip>
        <IpCountry code='DE' />
        <IpAddress>77.88.8.8</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='NL' />
        <IpAddress>20.33.0.0</IpAddress>
      </Ip>
      <Ip>
        <IpCountry code='JP' />
        <IpAddress>192.168.1.1</IpAddress>
      </Ip>
    </IpList>
  </div>
);

/**
 * Three vertical lists, each showing its first address only and holding the rest behind a
 * `+N addresses` link — the link indents to the address when the row opens with a flag.
 */
export const VerticalMultiple: StoryFn = () => (
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
