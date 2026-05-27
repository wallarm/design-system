import { CircleDashed, Filter, Plus } from '../../../icons';
import type { NavConfig } from '../../ProductNav';

export const edgeNavConfig: NavConfig = {
  productLabel: 'Edge',
  headerActions: [
    { icon: Filter, label: 'Filter', onClick: () => alert('Filter clicked') },
    { icon: Plus, label: 'Add', onClick: () => alert('Add clicked') },
  ],
  items: [
    { type: 'link', id: 'overview', label: 'Overview', path: 'overview', icon: CircleDashed },
    {
      type: 'drill',
      id: 'data-planes',
      label: 'Data planes',
      path: 'data-planes',
      icon: CircleDashed,
      param: 'dataPlaneId',
      entities: [
        { id: 'production', label: 'Production', description: 'Main production environment' },
        { id: 'staging', label: 'Staging', description: 'Pre-production testing' },
        { id: 'edge-eu', label: 'Edge EU', description: 'European edge nodes' },
        { id: 'edge-us', label: 'Edge US', description: 'US edge nodes' },
      ],
      children: [
        {
          type: 'link',
          id: 'dp-overview',
          label: 'Overview',
          path: 'overview',
          icon: CircleDashed,
        },
        {
          type: 'drill',
          id: 'dp-nodes',
          label: 'Nodes',
          path: 'nodes',
          icon: CircleDashed,
          param: 'nodeId',
          entities: [
            { id: 'node-1', label: 'Node 1', description: 'Primary node' },
            { id: 'node-2', label: 'Node 2', description: 'Secondary node' },
            { id: 'node-3', label: 'Node 3', description: 'Tertiary node' },
          ],
          children: [
            {
              type: 'link',
              id: 'node-overview',
              label: 'Overview',
              path: 'overview',
              icon: CircleDashed,
            },
            {
              type: 'link',
              id: 'node-metrics',
              label: 'Metrics',
              path: 'metrics',
              icon: CircleDashed,
            },
            { type: 'link', id: 'node-logs', label: 'Logs', path: 'logs', icon: CircleDashed },
            {
              type: 'link',
              id: 'node-config',
              label: 'Configuration',
              path: 'config',
              icon: CircleDashed,
            },
          ],
        },
        {
          type: 'link',
          id: 'dp-services',
          label: 'Services',
          path: 'services',
          icon: CircleDashed,
          dividerAfter: true,
        },
        { type: 'link', id: 'dp-govern', label: 'Govern', path: 'govern', icon: CircleDashed },
        {
          type: 'group',
          id: 'dp-operations',
          label: 'Operations',
          icon: CircleDashed,
          children: [
            {
              type: 'link',
              id: 'dp-routing-rules',
              label: 'Routing rules',
              path: 'routing-rules',
            },
            { type: 'link', id: 'dp-settings', label: 'Settings', path: 'settings' },
          ],
        },
      ],
    },
    {
      type: 'link',
      id: 'dashboards',
      label: 'Dashboards',
      path: 'dashboards',
      icon: CircleDashed,
      dividerAfter: true,
    },
    { type: 'section-header', id: 'section-detect', label: 'Detect & Respond' },
    {
      type: 'group',
      id: 'events',
      label: 'Events',
      icon: CircleDashed,
      defaultExpanded: true,
      children: [
        { type: 'link', id: 'attacks', label: 'Attacks', path: 'attacks' },
        { type: 'link', id: 'incidents', label: 'Incidents', path: 'incidents' },
        { type: 'link', id: 'security-issues', label: 'Security Issues', path: 'security-issues' },
        { type: 'link', id: 'api-sessions', label: 'API Sessions', path: 'api-sessions' },
      ],
    },
    {
      type: 'group',
      id: 'api-security',
      label: 'API Security',
      icon: CircleDashed,
      children: [
        {
          type: 'link',
          id: 'api-attack-surface',
          label: 'API Attack Surface',
          path: 'api-attack-surface',
        },
        { type: 'link', id: 'api-discovery', label: 'API Discovery', path: 'api-discovery' },
        {
          type: 'link',
          id: 'api-abuse-prevention',
          label: 'API Abuse Prevention',
          path: 'api-abuse-prevention',
        },
        {
          type: 'link',
          id: 'api-specifications',
          label: 'API Specifications',
          path: 'api-specifications',
        },
      ],
    },
    {
      type: 'group',
      id: 'security-controls',
      label: 'Security controls',
      icon: CircleDashed,
      children: [
        {
          type: 'link',
          id: 'ip-session-lists',
          label: 'IP & Session Lists',
          path: 'ip-session-lists',
        },
        { type: 'link', id: 'triggers', label: 'Triggers', path: 'triggers' },
        { type: 'link', id: 'rules', label: 'Rules', path: 'rules' },
        {
          type: 'link',
          id: 'mitigation-controls',
          label: 'Mitigation Controls',
          path: 'mitigation-controls',
        },
        {
          type: 'link',
          id: 'credential-stuffing',
          label: 'Credential Stuffing',
          path: 'credential-stuffing',
        },
      ],
    },
    { type: 'section-header', id: 'section-protect', label: 'Protect' },
    {
      type: 'group',
      id: 'security-testing',
      label: 'Security Testing',
      icon: CircleDashed,
      children: [
        { type: 'link', id: 'threat-replay', label: 'Threat Replay', path: 'threat-replay' },
        { type: 'link', id: 'schema-based', label: 'Schema-Based', path: 'schema-based' },
      ],
    },
    {
      type: 'group',
      id: 'configuration',
      label: 'Configuration',
      icon: CircleDashed,
      children: [
        {
          type: 'group',
          id: 'nodes',
          label: 'Nodes',
          children: [
            {
              type: 'link',
              id: 'nodes-overview',
              label: 'Overview',
              path: 'nodes-overview',
            },
            { type: 'link', id: 'nodes-pools', label: 'Pools', path: 'nodes-pools' },
            {
              type: 'link',
              id: 'nodes-health-checks',
              label: 'Health checks',
              path: 'nodes-health-checks',
            },
          ],
        },
        { type: 'link', id: 'security-edge', label: 'Security Edge', path: 'security-edge' },
        { type: 'link', id: 'integrations', label: 'Integrations', path: 'integrations' },
      ],
    },
  ],
};

export const aiHypervisorNavConfig: NavConfig = {
  productLabel: 'AI Hypervisor',
  items: [
    { type: 'link', id: 'heatmap', label: 'Heatmap', path: 'heatmap', icon: CircleDashed },
    { type: 'link', id: 'registry', label: 'Registry', path: 'registry', icon: CircleDashed },
    {
      type: 'group',
      id: 'topology',
      label: 'Topology',
      icon: CircleDashed,
      defaultExpanded: true,
      children: [
        {
          type: 'link',
          id: 'topology-overview',
          label: 'Overview',
          path: 'topology-overview',
        },
        {
          type: 'link',
          id: 'topology-services',
          label: 'Services',
          path: 'topology-services',
        },
        {
          type: 'group',
          id: 'graphs',
          label: 'Graphs',
          children: [
            { type: 'link', id: 'flow-graph', label: 'Flow graph', path: 'flow-graph' },
            {
              type: 'link',
              id: 'dependency-graph',
              label: 'Dependency graph',
              path: 'dependency-graph',
            },
            {
              type: 'link',
              id: 'traffic-graph',
              label: 'Traffic graph',
              path: 'traffic-graph',
            },
          ],
        },
      ],
    },
    {
      type: 'link',
      id: 'data-tracks',
      label: 'Data Tracks',
      path: 'data-tracks',
      icon: CircleDashed,
    },
    {
      type: 'link',
      id: 'user-tracks',
      label: 'User Tracks',
      path: 'user-tracks',
      icon: CircleDashed,
    },
    {
      type: 'link',
      id: 'supply-chain',
      label: 'Supply Chain',
      path: 'supply-chain',
      icon: CircleDashed,
    },
    {
      type: 'link',
      id: 'enforcement',
      label: 'Enforcement',
      path: 'enforcement',
      icon: CircleDashed,
    },
    {
      type: 'link',
      id: 'ai-integrations',
      label: 'Integrations',
      path: 'ai-integrations',
      icon: CircleDashed,
    },
    { type: 'link', id: 'red-team', label: 'Red Team', path: 'red-team', icon: CircleDashed },
    { type: 'link', id: 'debugger', label: 'Debugger', path: 'debugger', icon: CircleDashed },
  ],
};

export const infraDiscoveryNavConfig: NavConfig = {
  productLabel: 'Infra Discovery',
  headerActions: [{ icon: Filter, label: 'Filter', onClick: () => alert('Filter clicked') }],
  items: [
    { type: 'link', id: 'overview', label: 'Overview', path: 'overview', icon: CircleDashed },
    {
      type: 'group',
      id: 'inventory',
      label: 'Inventory',
      icon: CircleDashed,
      defaultExpanded: true,
      children: [
        { type: 'link', id: 'all-assets', label: 'All assets', path: 'all-assets' },
        { type: 'link', id: 'untagged', label: 'Untagged', path: 'untagged' },
        {
          type: 'group',
          id: 'by-source',
          label: 'By source',
          children: [
            {
              type: 'link',
              id: 'cloud-accounts',
              label: 'Cloud accounts',
              path: 'cloud-accounts',
            },
            { type: 'link', id: 'kubernetes', label: 'Kubernetes', path: 'kubernetes' },
            {
              type: 'link',
              id: 'source-control',
              label: 'Source control',
              path: 'source-control',
            },
          ],
        },
      ],
    },
    { type: 'link', id: 'topology', label: 'Topology', path: 'topology', icon: CircleDashed },
    { type: 'link', id: 'findings', label: 'Findings', path: 'findings', icon: CircleDashed },
    { type: 'link', id: 'risks', label: 'Risks', path: 'risks', icon: CircleDashed },
    {
      type: 'link',
      id: 'infra-integrations',
      label: 'Integrations',
      path: 'infra-integrations',
      icon: CircleDashed,
    },
    {
      type: 'link',
      id: 'infra-settings',
      label: 'Settings',
      path: 'infra-settings',
      icon: CircleDashed,
    },
  ],
};

export const securityTestingNavConfig: NavConfig = {
  productLabel: 'Security Testing',
  items: [
    { type: 'link', id: 'overview', label: 'Overview', path: 'overview', icon: CircleDashed },
    {
      type: 'link',
      id: 'test-suites',
      label: 'Test Suites',
      path: 'test-suites',
      icon: CircleDashed,
    },
    {
      type: 'group',
      id: 'templates',
      label: 'Templates',
      icon: CircleDashed,
      children: [
        { type: 'link', id: 'owasp', label: 'OWASP', path: 'owasp' },
        { type: 'link', id: 'pci-dss', label: 'PCI DSS', path: 'pci-dss' },
        { type: 'link', id: 'internal', label: 'Internal', path: 'internal' },
      ],
    },
    { type: 'link', id: 'schedules', label: 'Schedules', path: 'schedules', icon: CircleDashed },
    { type: 'link', id: 'results', label: 'Results', path: 'results', icon: CircleDashed },
    { type: 'link', id: 'coverage', label: 'Coverage', path: 'coverage', icon: CircleDashed },
    {
      type: 'link',
      id: 'testing-settings',
      label: 'Settings',
      path: 'testing-settings',
      icon: CircleDashed,
    },
  ],
};

export const settingsNavConfig: NavConfig = {
  productLabel: 'Settings',
  items: [
    { type: 'link', id: 'profile', label: 'Profile', path: 'profile', icon: CircleDashed },
    { type: 'link', id: 'general', label: 'General', path: 'general', icon: CircleDashed },
    {
      type: 'link',
      id: 'subscriptions',
      label: 'Subscriptions',
      path: 'subscriptions',
      icon: CircleDashed,
    },
    {
      type: 'link',
      id: 'applications',
      label: 'Applications',
      path: 'applications',
      icon: CircleDashed,
    },
    {
      type: 'group',
      id: 'users',
      label: 'Users',
      icon: CircleDashed,
      defaultExpanded: true,
      children: [
        { type: 'link', id: 'users-all', label: 'All users', path: 'users-all' },
        {
          type: 'link',
          id: 'users-invites',
          label: 'Pending invites',
          path: 'users-invites',
        },
        { type: 'link', id: 'users-roles', label: 'Roles', path: 'users-roles' },
      ],
    },
    { type: 'section-header', id: 'section-access', label: 'Access Management' },
    { type: 'link', id: 'groups', label: 'Groups', path: 'groups', icon: CircleDashed },
    { type: 'link', id: 'api-tokens', label: 'API Tokens', path: 'api-tokens', icon: CircleDashed },
    {
      type: 'link',
      id: 'activity-log',
      label: 'Activity Log',
      path: 'activity-log',
      icon: CircleDashed,
      dividerAfter: true,
    },
    {
      type: 'group',
      id: 'admin-zone',
      label: 'Admin Zone',
      icon: CircleDashed,
      defaultExpanded: true,
      children: [
        {
          type: 'link',
          id: 'customer-settings',
          label: 'Customer Settings',
          path: 'customer-settings',
        },
        {
          type: 'group',
          id: 'system-configuration',
          label: 'System Configuration',
          children: [
            { type: 'link', id: 'sys-general', label: 'General', path: 'sys-general' },
            { type: 'link', id: 'sys-storage', label: 'Storage', path: 'sys-storage' },
            {
              type: 'link',
              id: 'sys-networking',
              label: 'Networking',
              path: 'sys-networking',
            },
          ],
        },
        {
          type: 'link',
          id: 'bola-triggers',
          label: 'BOLA Triggers',
          path: 'bola-triggers',
        },
        { type: 'link', id: 'experiments', label: 'Experiments', path: 'experiments' },
      ],
    },
  ],
};
