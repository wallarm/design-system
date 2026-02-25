export const datacenters = {
  alibaba: 'Alibaba Cloud',
  aws: 'AWS',
  azure: 'Azure',
  docean: 'Digital Ocean',
  gce: 'GCP',
  hetzner: 'Hetzner',
  huawei: 'Huawei Cloud',
  ibm: 'IBM Cloud',
  linode: 'Linode',
  oracle: 'Oracle Cloud',
  ovh: 'OVHcloud',
  plusserver: 'PlusServer',
  rackspace: 'Rackspace',
  tencent: 'Tencent',
} as const;

export const proxyTypes = {
  TOR: 'Tor',
  VPN: 'VPN',
  DCH: 'DC',
  SES: 'Search engine spiders',
  MIP: 'Malicious IPs',
  WEB: 'Web proxy',
  PUB: 'Public proxy',
} as const;

export type DatacenterKey = keyof typeof datacenters;
export type ProxyTypeKey = keyof typeof proxyTypes;
export type SourceKey = DatacenterKey | ProxyTypeKey;

export const sourceLabels: Record<SourceKey, string> = {
  ...datacenters,
  ...proxyTypes,
};
