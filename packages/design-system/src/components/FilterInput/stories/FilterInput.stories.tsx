import type React from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterInput } from '../FilterInput';
import {
  createStatusCodeInputFilter,
  createStatusCodeNormalizer,
  createStatusCodeSuggestions,
  createStatusCodeValidator,
} from '../lib/statusCode';
import type { ExprNode, FieldMetadata } from '../types';
import { backendFieldsToMetadata, realBackendFields } from './backendFieldsFixture';

const DESCRIPTION = [
  'A config-driven query builder — `fields` metadata in, an `ExprNode` tree out of `onChange` — for filtering a data-dense resource.',
  'Reach for a row of `Select`s instead when three or four facets picked by equality would do; reach for this when the attribute count is high, or the query needs AND/OR, grouping, or operators like `between` and `like`.',
  'The menus, chips and connectors are internal, so what you own is the field config.',
].join(' ');

const meta = {
  title: 'Patterns/FilterInput/FilterInput',
  component: FilterInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 960 }}>
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text to display when field is empty',
    },
    error: {
      control: 'boolean',
      description: 'Whether the field has a validation error',
    },
    showKeyboardHint: {
      control: 'boolean',
      description: 'Whether to show the keyboard hint',
    },
  },
} satisfies Meta<typeof FilterInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// The full attack-vectors filter set (identical to the Composition "Default"
// story), mapped from the shared raw backend schema. Every story below uses it
// so the field dropdown is the same everywhere.
const attackVectorFields: FieldMetadata[] = realBackendFields.map(backendFieldsToMetadata);

/** The pattern at rest against the real attack-vectors schema: click in and it walks you field, then operator, then value. */
export const Default: Story = {
  args: {
    fields: attackVectorFields,
    placeholder: 'Type to filter...',
  },
};

/** `showKeyboardHint` prints the shortcut hint beside the input — worth turning on where filtering is new to the reader, and off where it is routine. */
export const WithKeyboardHint: Story = {
  args: {
    fields: attackVectorFields,
    placeholder: 'Type to filter...',
    showKeyboardHint: true,
  },
};

const groupedDemoFields: FieldMetadata[] = [
  { name: 'attack_type', label: 'Attack type', type: 'string' },
  { name: 'status', label: 'Status', type: 'string' },
  { name: 'host', label: 'Host', type: 'string' },
  { name: 'path', label: 'Path', type: 'string' },
  { name: 'country', label: 'Country', type: 'string' },
];

/** `fieldGroups` sorts the field menu under labelled headers, which is what keeps a fifty-field schema navigable. */
export const WithFieldGroups: Story = {
  args: {
    fields: groupedDemoFields,
    fieldGroups: [
      { label: 'Threat classification', fields: ['attack_type', 'status'] },
      { label: 'Request features', fields: ['host', 'path'] },
      { label: 'Source and identity', fields: ['country'] },
    ],
    placeholder: 'Type to filter...',
  },
};

const describedChipFields: FieldMetadata[] = [
  {
    name: 'status_code',
    label: 'Status code',
    type: 'string',
    description: 'Filter by the HTTP response status code returned to the attacker.',
    example: '200, 4XX, 5XX',
  },
];

/** A field with a `description` carries it into a tooltip on the chip's first segment, so a committed filter can still explain itself; the operator and value segments keep click-to-edit. */
export const WithDescribedChip: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'condition',
      field: 'status_code',
      operator: '=',
      value: '200',
    });

    return (
      <FilterInput
        fields={describedChipFields}
        value={expression}
        onChange={setExpression}
        placeholder='Type to filter...'
      />
    );
  },
};

/** `error` reddens the input as a whole — pair it with an `Alert` that says what was rejected, since the input itself cannot. */
export const ErrorEmpty: Story = {
  args: {
    fields: attackVectorFields,
    placeholder: 'Type to filter...',
    error: true,
  },
};

/** Controlled mode: `value` takes an `ExprNode` and `onChange` hands the tree back. The JSON below the input is the story printing that tree, not part of the component. */
export const WithPresetValue: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'condition',
      field: 'status',
      operator: '=',
      value: 'Blocked',
    });

    return (
      <>
        <FilterInput
          fields={attackVectorFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
        />
        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
    );
  },
};

/** Two conditions joined by AND — what a `group` node looks like once rendered, connectors included. */
export const WithMultiConditionPreset: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'status', operator: '=', value: 'Blocked' },
        { type: 'condition', field: 'status_code', operator: '>', value: 400 },
      ],
    });

    return (
      <>
        <FilterInput
          fields={attackVectorFields}
          value={expression}
          onChange={setExpression}
          placeholder='Type to filter...'
        />
        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
    );
  },
};

/** The error state with a condition already committed: the chip stays editable, so the query can be fixed in place rather than cleared. */
export const ErrorWithValue: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'condition',
      field: 'status',
      operator: '=',
      value: 'Blocked',
    });

    return (
      <FilterInput
        fields={attackVectorFields}
        value={expression}
        onChange={setExpression}
        placeholder='Type to filter...'
        error
      />
    );
  },
};

/** A condition marked `disabled` is locked — dimmed, no edit, no remove — which is how a drill-down carries its context into the filter without letting the reader drop it. */
export const WithDisabledChips: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'country', operator: '=', value: 'US', disabled: true },
        { type: 'condition', field: 'status', operator: '=', value: 'Blocked', disabled: true },
        { type: 'condition', field: 'status_code', operator: '>', value: 400 },
      ],
    });

    return (
      <>
        <FilterInput
          fields={attackVectorFields}
          value={expression}
          onChange={setExpression}
          placeholder='Add more filters...'
        />
        {expression && (
          <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
            <pre>{JSON.stringify(expression, null, 2)}</pre>
          </div>
        )}
      </>
    );
  },
};

/** With every chip locked, clear-all has nothing to remove, and the input still accepts new conditions on top. */
export const AllChipsDisabled: Story = {
  render: () => {
    const [expression, setExpression] = useState<ExprNode | null>({
      type: 'group',
      operator: 'and',
      children: [
        { type: 'condition', field: 'status', operator: '=', value: 'Monitoring', disabled: true },
        {
          type: 'condition',
          field: 'country',
          operator: 'in',
          value: ['US', 'DE'],
          disabled: true,
        },
      ],
    });

    return (
      <FilterInput
        fields={attackVectorFields}
        value={expression}
        onChange={setExpression}
        placeholder='Add more filters...'
      />
    );
  },
};

/** A status-code field wired by hand with the `createStatusCode*` helpers: typing narrows the mask suggestions, 4 to 4XX and 40 to 40X. */
export const HTTPStatusCodeSuggestions: Story = {
  args: {
    fields: [
      {
        name: 'response_code',
        label: 'Status code',
        type: 'integer',
        // Mask values are strings ("4XX", "40X"), so numeric comparison
        // operators would be meaningless — restrict to equality/containment.
        operators: ['=', '!=', 'in'],
        getSuggestions: createStatusCodeSuggestions(),
        validate: createStatusCodeValidator(),
        acceptChar: createStatusCodeInputFilter(),
        normalize: createStatusCodeNormalizer(),
      },
    ],
    placeholder: 'Type to filter by status code...',
  },
};

/** `status_code` is a reserved field name — the DS fills in the same suggestions, input filter, normaliser and validator on its own, and an explicit callback still wins. */
export const HTTPStatusCodeByName: Story = {
  args: {
    fields: [
      {
        name: 'status_code',
        label: 'Status code',
        type: 'integer',
        operators: ['=', '!=', 'in'],
      },
    ],
    placeholder: 'Type to filter by status code...',
  },
};

const pairedFields: FieldMetadata[] = [
  {
    name: 'context_param',
    label: 'Context Param',
    type: 'enum',
    options: ['header', 'cookie', 'query', 'body'],
    // The param key is always "is <key>" — there is no "is not"/"is not set" on
    // the first part; the second part (Value) carries the real comparison.
    operators: ['='],
    pairedField: {
      name: 'context_value',
      label: 'Value',
      type: 'string',
      options: [],
      // "like"/"not like" match substrings; "is set"/"is not set" complete the
      // chip without a second value.
      operators: ['=', '!=', 'like', 'not_like', 'is_null', 'is_not_null'],
    },
  },
  { name: 'method', label: 'Method', type: 'enum', options: ['GET', 'POST', 'PUT', 'DELETE'] },
];

/** `pairedField` captures two steps in one chip — a parameter name, then its value with its own operator — for an attribute that means nothing on its own. */
export const PairedField: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>(null);
      return <FilterInput fields={pairedFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

/** `is set` and `is not set` on the paired half finish the chip with no second value, which is how you ask whether a key is present at all. */
export const PairedFieldValueIsSet: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>({
        type: 'group',
        operator: 'and',
        children: [
          { type: 'condition', field: 'context_param', operator: '=', value: 'header' },
          { type: 'condition', field: 'context_value', operator: 'is_null', value: null },
        ],
      });
      return <FilterInput fields={pairedFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

const describedParamFields: FieldMetadata[] = [
  {
    name: 'context_param',
    label: 'Context Param',
    type: 'enum',
    operators: ['='],
    values: [
      {
        value: 'requests->headers->request-id',
        label: 'request-id',
        description: 'requests->headers->request-id',
      },
      {
        value: 'requests->headers->cookie->JSESSION-ID',
        label: 'JSESSION-ID',
        description: 'requests->headers->cookie->JSESSION-ID',
      },
      {
        // Same bold label as the first row — distinguished only by its path.
        value: 'requests->body->request-id',
        label: 'request-id',
        description: 'requests->body->request-id',
      },
    ],
    pairedField: {
      name: 'context_value',
      label: 'Value',
      type: 'string',
      options: [],
      operators: ['=', '!=', 'like', 'not_like', 'is_null', 'is_not_null'],
    },
  },
  { name: 'method', label: 'Method', type: 'enum', options: ['GET', 'POST', 'PUT', 'DELETE'] },
];

/** The value rows carry a muted second line because the bold name is not unique: two `request-id` rows differ only by their path, and selecting one commits the path. */
export const PairedFieldValueDescriptions: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>(null);
      return <FilterInput fields={describedParamFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

/** The same paired field arriving pre-filled from a controlled value, rendered as the single chip it becomes. */
export const PairedFieldPreset: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>({
        type: 'condition',
        field: 'context_param',
        operator: '=',
        value: 'header',
        pair: { operator: '=', value: 'authorization' },
      });
      return <FilterInput fields={pairedFields} value={value} onChange={setValue} />;
    };
    return <ParentComponent />;
  },
};

const attackTypeNestedFields: FieldMetadata[] = [
  {
    name: 'attack_type',
    label: 'Attack type',
    type: 'enum',
    operators: ['in', 'not_in', '=', '!='],
    values: [
      {
        label: 'Input-based attacks',
        children: [
          { value: 'crlf', label: 'CRLF injection' },
          { value: 'xss', label: 'Cross-site scripting (XSS)' },
          { value: 'email_injection', label: 'Email injection' },
          { value: 'ldap', label: 'LDAP injection' },
          { value: 'mass_assignment', label: 'Mass assignment' },
          { value: 'nosqli', label: 'NoSQL injection' },
          { value: 'path_traversal', label: 'Path traversal' },
          { value: 'rce', label: 'Remote code execution (RCE)' },
          { value: 'resource_scanning', label: 'Resource scanning' },
          {
            label: 'SQL injection',
            children: [
              { value: 'sqli_boolean', label: 'Boolean-based blind SQLi' },
              { value: 'sqli_code_exec', label: 'Code execution via SQLi' },
              { value: 'sqli_generic', label: 'Generic SQLi' },
              { value: 'sqli_obfuscated', label: 'Obfuscated union-based SQLi' },
              { value: 'sqli_recon', label: 'SQLi recon' },
              { value: 'sqli_stacked', label: 'Stacked queries' },
              { value: 'sqli_time', label: 'Time-based blind SQLi' },
              { value: 'sqli_union', label: 'Union-based SQLi' },
            ],
          },
          { value: 'ssi', label: 'SSI injection' },
          { value: 'ssrf', label: 'Server-side request forgery (SSRF)' },
          { value: 'ssti', label: 'Server-side template injection (SSTI)' },
        ],
      },
      {
        label: 'GraphQL attacks',
        children: [
          { value: 'graphql_aliases', label: 'GraphQL aliases' },
          { value: 'graphql_batching', label: 'GraphQL batching' },
          { value: 'graphql_debug', label: 'GraphQL debug' },
          { value: 'graphql_introspection', label: 'GraphQL introspection' },
          { value: 'graphql_query_depth', label: 'GraphQL query depth' },
          { value: 'graphql_query_size', label: 'GraphQL query size' },
          { value: 'graphql_value_size', label: 'GraphQL value size' },
        ],
      },
      {
        label: 'API specification enforcement',
        children: [
          { value: 'invalid_parameter', label: 'Invalid parameter' },
          { value: 'invalid_request', label: 'Invalid request' },
          { value: 'missing_authentication', label: 'Missing authentication' },
          { value: 'missing_parameter', label: 'Missing parameter' },
          { value: 'undefined_endpoint', label: 'Undefined endpoint' },
          { value: 'undefined_parameter', label: 'Undefined parameter' },
        ],
      },
      {
        label: 'API abuse',
        children: [
          { value: 'account_takeover', label: 'Account takeover' },
          { value: 'scraping', label: 'Scraping' },
          { value: 'security_crawlers', label: 'Security crawlers' },
          { value: 'suspicious_api_activity', label: 'Suspicious API activity' },
          {
            value: 'unrestricted_resource_consumption',
            label: 'Unrestricted resource consumption',
          },
        ],
      },
      {
        label: 'Enumeration attacks',
        children: [
          { value: 'bola', label: 'Broken object level authorization (BOLA)' },
          { value: 'brute_force', label: 'Brute force attack' },
          { value: 'forced_browsing', label: 'Forced browsing' },
          { value: 'generic_enumeration', label: 'Generic enumeration attack' },
        ],
      },
      {
        label: 'Data handling',
        children: [
          { value: 'data_bomb', label: 'Data bomb' },
          { value: 'file_upload_violation', label: 'File upload violation' },
          { value: 'invalid_xml', label: 'Invalid XML' },
          { value: 'processing_overlimit', label: 'Processing overlimit' },
          { value: 'resource_overlimit', label: 'Resource overlimit' },
          { value: 'xxe', label: 'XML external entity (XXE)' },
        ],
      },
      {
        label: 'Other',
        children: [
          { value: 'blocked_source', label: 'Blocked source' },
          { value: 'credential_stuffing', label: 'Credential stuffing' },
          { value: 'custom_ai_payload_inspection', label: 'Custom AI payload inspection' },
          { value: 'custom_logic_abuse', label: 'Custom logic abuse' },
          { value: 'open_redirect', label: 'Open redirect' },
          { value: 'prompt_injection', label: 'Prompt injection' },
          { value: 'system_prompt_retrieval', label: 'System prompt retrieval' },
          { value: 'virtual_patch', label: 'Virtual patch' },
        ],
      },
    ],
  },
];

/** Values grouped under section headers, with one row opening a submenu of sub-types: only leaves commit, so the expression never carries a group. A fully selected group collapses to its own label in the chip while a partial one lists the chosen leaves, and typing flattens the tree to matches at any depth. */
export const NestedValueSubmenu: Story = {
  render: () => {
    const ParentComponent = () => {
      const [value, setValue] = useState<ExprNode | null>(null);
      return (
        <>
          <FilterInput
            fields={attackTypeNestedFields}
            value={value}
            onChange={setValue}
            placeholder='Filter by attack type…'
          />
          {value && (
            <div className='mt-16 p-4 bg-gray-100 rounded text-xs'>
              <pre>{JSON.stringify(value, null, 2)}</pre>
            </div>
          )}
        </>
      );
    };
    return <ParentComponent />;
  },
};
