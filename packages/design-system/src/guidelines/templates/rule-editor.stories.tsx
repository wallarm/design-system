import { type ChangeEvent, type FormEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '../../components/Alert';
import { Attribute, AttributeLabel, AttributeValue } from '../../components/Attribute';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
} from '../../components/Checkbox';
import { CodeEditorContent, CodeEditorRoot } from '../../components/CodeEditor';
import {
  CodeSnippetActions,
  CodeSnippetAdapterProvider,
  CodeSnippetCode,
  CodeSnippetContent,
  CodeSnippetCopyButton,
  CodeSnippetHeader,
  CodeSnippetLineNumbers,
  CodeSnippetRoot,
  CodeSnippetTitle,
  CodeSnippetWrapButton,
  InlineCodeSnippet,
  loadPrismAdapter,
} from '../../components/CodeSnippet';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerFooterControls,
  DrawerHeader,
  DrawerTitle,
} from '../../components/Drawer';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldIndicator,
  FieldLabel,
  FieldLegend,
} from '../../components/Field';
import { FormatDateTime } from '../../components/FormatDateTime';
import { Heading } from '../../components/Heading';
import { HttpMethod } from '../../components/HttpMethod';
import { Input } from '../../components/Input';
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageTitle,
  PageToolbar,
} from '../../components/Page';
import {
  Radio,
  RadioDescription,
  RadioGroup,
  RadioIndicator,
  RadioLabel,
} from '../../components/Radio';
import { SearchInput } from '../../components/SearchInput';
import {
  createListCollection,
  Select,
  SelectContent,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../../components/Select';
import { Separator } from '../../components/Separator';
import { HStack, VStack } from '../../components/Stack';
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  type StepperItemStatus,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '../../components/Stepper';
import type { TableCellContext, TableColumnDef } from '../../components/Table';
import { Table } from '../../components/Table';
import { useToast } from '../../components/Toast';
import { Plus } from '../../icons';

type RuleAction = 'block' | 'monitor';

interface RuleDraft {
  name: string;
  host: string[];
  path: string;
  methods: string[];
  condition: string;
  action: RuleAction;
}

interface Rule {
  id: string;
  name: string;
  host: string;
  path: string;
  methods: string[];
  action: RuleAction;
  updatedAt: string;
}

interface RuleEditorArgs {
  /** The rules request is still in flight; the table shows skeleton rows. */
  isLoading: boolean;
}

const RULE_STEPS = ['Scope', 'Condition', 'Action', 'Review'] as const;

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

const HOSTS = [
  { label: 'api.shop-demo.io', value: 'api.shop-demo.io' },
  { label: 'auth.shop-demo.io', value: 'auth.shop-demo.io' },
  { label: 'payments.shop-demo.io', value: 'payments.shop-demo.io' },
  { label: 'admin.shop-demo.io', value: 'admin.shop-demo.io' },
];

const hostCollection = createListCollection({ items: HOSTS });

const ACTION = {
  block: { label: 'Block', color: 'red' },
  monitor: { label: 'Monitor', color: 'blue' },
} as const;

const CONDITION = `# Scripted logins from outside the office range
match:
  all:
    - header: User-Agent
      not_matches: '^Mozilla/'
    - body.json: $.password
      exists: true
    - client_ip:
        not_in:
          - 203.0.113.0/24
threshold:
  requests: 20
  window: 1m
  per: client_ip`;

// A new rule starts from an example condition, so the editor is never a blank page.
const EMPTY_DRAFT: RuleDraft = {
  name: '',
  host: [],
  path: '',
  methods: [],
  condition: CONDITION,
  action: 'block',
};

const RULES: Rule[] = [
  {
    id: 'r-2041',
    name: 'Block admin panel outside VPN',
    host: 'admin.shop-demo.io',
    path: '/*',
    methods: ['GET', 'POST'],
    action: 'block',
    updatedAt: '2026-11-04T09:12:00Z',
  },
  {
    id: 'r-2038',
    name: 'Card testing on checkout',
    host: 'payments.shop-demo.io',
    path: '/v1/charges',
    methods: ['POST'],
    action: 'block',
    updatedAt: '2026-11-02T16:40:00Z',
  },
  {
    id: 'r-2035',
    name: 'GraphQL introspection',
    host: 'api.shop-demo.io',
    path: '/graphql',
    methods: ['POST'],
    action: 'monitor',
    updatedAt: '2026-10-30T11:05:00Z',
  },
  {
    id: 'r-2029',
    name: 'Mass assignment on profile update',
    host: 'api.shop-demo.io',
    path: '/v2/users/*',
    methods: ['PUT', 'PATCH'],
    action: 'monitor',
    updatedAt: '2026-10-27T08:30:00Z',
  },
  {
    id: 'r-2024',
    name: 'Coupon enumeration',
    host: 'api.shop-demo.io',
    path: '/v2/coupons/*',
    methods: ['GET'],
    action: 'block',
    updatedAt: '2026-10-21T14:18:00Z',
  },
  {
    id: 'r-2017',
    name: 'Legacy export endpoint',
    host: 'api.shop-demo.io',
    path: '/v1/export',
    methods: ['GET', 'DELETE'],
    action: 'monitor',
    updatedAt: '2026-10-12T10:00:00Z',
  },
];

// Stands in for the request your app sends.
const saveRequest = () => new Promise(resolve => setTimeout(resolve, 800));

const getRuleId = (rule: Rule) => rule.id;

const renderPath = ({ row }: TableCellContext<Rule, unknown>) => (
  <InlineCodeSnippet code={row.original.path} copyable={false} />
);

const renderMethods = ({ row }: TableCellContext<Rule, unknown>) => (
  <HStack gap={4}>
    {row.original.methods.map(method => (
      <HttpMethod key={method} method={method} size='small' />
    ))}
  </HStack>
);

const renderAction = ({ row }: TableCellContext<Rule, unknown>) => (
  <Badge variant='dotted' type='secondary' color={ACTION[row.original.action].color}>
    {ACTION[row.original.action].label}
  </Badge>
);

const renderUpdated = ({ row }: TableCellContext<Rule, unknown>) => (
  <FormatDateTime value={row.original.updatedAt} format='date' />
);

const RULE_COLUMNS: TableColumnDef<Rule>[] = [
  { accessorKey: 'name', header: 'Name', size: 300 },
  { accessorKey: 'host', header: 'Host', size: 200 },
  { accessorKey: 'path', header: 'Path', size: 180, cell: renderPath },
  { accessorKey: 'methods', header: 'Methods', size: 160, cell: renderMethods },
  { accessorKey: 'action', header: 'Action', size: 120, cell: renderAction },
  { accessorKey: 'updatedAt', header: 'Updated', size: 140, cell: renderUpdated },
];

const meta = {
  title: 'Templates/Rule editor',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use when building a create or edit flow for a custom security rule: scope, a condition written as code, an action and a review step in a Stepper drawer.',
      },
    },
  },
} satisfies Meta;

export default meta;

const RuleEditor: StoryFn<RuleEditorArgs> = ({ isLoading }) => {
  const toast = useToast();
  const [rules, setRules] = useState(RULES);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState<number[]>([]);
  const [name, setName] = useState(EMPTY_DRAFT.name);
  const [host, setHost] = useState(EMPTY_DRAFT.host);
  const [path, setPath] = useState(EMPTY_DRAFT.path);
  const [methods, setMethods] = useState(EMPTY_DRAFT.methods);
  const [condition, setCondition] = useState(EMPTY_DRAFT.condition);
  const [action, setAction] = useState<RuleAction>(EMPTY_DRAFT.action);
  const [pending, setPending] = useState(false);

  const errors = {
    name: name.trim() === '' ? 'Enter a rule name.' : null,
    host: host.length === 0 ? 'Select a host.' : null,
    path: path.startsWith('/') ? null : 'Start the path with /.',
    methods: methods.length === 0 ? 'Select at least one method.' : null,
    condition: condition.trim() === '' ? 'Write a condition.' : null,
  };
  const valid = [
    !errors.name && !errors.host && !errors.path && !errors.methods,
    !errors.condition,
    true,
    true,
  ];
  const statuses = valid.map<StepperItemStatus>((ok, i) =>
    !visited.includes(i) ? 'upcoming' : ok ? 'completed' : 'danger',
  );
  const showScopeErrors = visited.includes(0);
  const showConditionErrors = visited.includes(1);
  const last = step === RULE_STEPS.length - 1;

  const search = query.trim().toLowerCase();
  const rows = rules.filter(
    rule => rule.name.toLowerCase().includes(search) || rule.path.includes(search),
  );

  const handleCreate = () => {
    setName(EMPTY_DRAFT.name);
    setHost(EMPTY_DRAFT.host);
    setPath(EMPTY_DRAFT.path);
    setMethods(EMPTY_DRAFT.methods);
    setCondition(EMPTY_DRAFT.condition);
    setAction(EMPTY_DRAFT.action);
    setVisited([]);
    setStep(0);
    setOpen(true);
  };
  const handleStepChange = ({ step: next }: { step: number }) => {
    setVisited(prev => (prev.includes(step) ? prev : [...prev, step]));
    setStep(next);
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => setName(event.target.value);
  const handleHostChange = ({ value }: { value: string[] }) => setHost(value);
  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => setPath(event.target.value);
  const handleActionChange = ({ value }: { value: string | null }) =>
    setAction(value === 'monitor' ? 'monitor' : 'block');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid.every(Boolean)) {
      setVisited([0, 1, 2]);
      setStep(valid.indexOf(false));
      return;
    }
    setPending(true);
    await saveRequest();
    setPending(false);
    setRules(prev => [
      {
        id: `r-${2042 + prev.length}`,
        name,
        host: host[0] ?? '',
        path,
        methods,
        action,
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setOpen(false);
    toast.create({ id: 'rule-created', title: 'Rule created', type: 'default' });
  };

  return (
    <Page name='custom-rules' fullSize fixedHeight data-testid='rules-page'>
      <PageHeader>
        <PageHeaderGroup className='flex-1'>
          <PageTitle>Custom rules</PageTitle>
          <PageDescription>
            Rules that block or monitor requests matching your own conditions, on top of the
            built-in attack detection.
          </PageDescription>
        </PageHeaderGroup>
        <PageActions>
          <Button size='medium' onClick={handleCreate} data-testid='rules-create'>
            <Plus />
            Create rule
          </Button>
        </PageActions>
      </PageHeader>

      <PageToolbar>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder='Search name or path'
          className='w-[320px]'
          data-testid='rules-search'
        />
      </PageToolbar>

      <PageContent>
        <Table
          aria-label='Custom rules'
          data={isLoading ? [] : rows}
          columns={RULE_COLUMNS}
          isLoading={isLoading}
          getRowId={getRuleId}
          data-testid='rules-table'
        />
      </PageContent>

      <Drawer open={open} onOpenChange={setOpen} data-testid='rule-drawer'>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create rule</DrawerTitle>
          </DrawerHeader>
          {/* noValidate: the page validates itself and shows its own errors. */}
          <form noValidate onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
            <Stepper
              count={RULE_STEPS.length}
              step={step}
              onStepChange={handleStepChange}
              className='flex min-h-0 flex-1 flex-col'
              data-testid='rule-stepper'
            >
              <StepperList aria-label='Create rule steps'>
                {RULE_STEPS.map((title, i) => (
                  <StepperItem key={title} index={i} status={statuses[i]}>
                    <StepperTrigger>
                      <StepperIndicator />
                      <StepperTitle>{title}</StepperTitle>
                    </StepperTrigger>
                    <StepperSeparator />
                  </StepperItem>
                ))}
              </StepperList>
              <CodeSnippetAdapterProvider adapter={loadPrismAdapter}>
                <DrawerBody>
                  <StepperContent index={0} className='py-16'>
                    <VStack gap={12}>
                      <Field required>
                        <FieldLabel>
                          Name
                          <FieldIndicator />
                        </FieldLabel>
                        <Input
                          value={name}
                          error={showScopeErrors && Boolean(errors.name)}
                          onChange={handleNameChange}
                          placeholder='Login credential stuffing'
                          data-testid='rule-name'
                        />
                        {showScopeErrors && errors.name && <FieldError>{errors.name}</FieldError>}
                      </Field>
                      <div className='grid grid-cols-2 gap-12'>
                        <Field required>
                          <FieldLabel>
                            Host
                            <FieldIndicator />
                          </FieldLabel>
                          <Select
                            collection={hostCollection}
                            value={host}
                            onValueChange={handleHostChange}
                            invalid={showScopeErrors && Boolean(errors.host)}
                            data-testid='rule-host'
                          >
                            <SelectInput placeholder='Select a host' />
                            <SelectPositioner>
                              <SelectContent>
                                {hostCollection.items.map(item => (
                                  <SelectOption key={item.value} item={item}>
                                    <SelectOptionText>{item.label}</SelectOptionText>
                                    <SelectOptionIndicator />
                                  </SelectOption>
                                ))}
                              </SelectContent>
                            </SelectPositioner>
                          </Select>
                          {showScopeErrors && errors.host && <FieldError>{errors.host}</FieldError>}
                        </Field>
                        <Field required>
                          <FieldLabel>
                            Path
                            <FieldIndicator />
                          </FieldLabel>
                          <Input
                            value={path}
                            error={showScopeErrors && Boolean(errors.path)}
                            onChange={handlePathChange}
                            placeholder='/v2/login'
                            data-testid='rule-path'
                          />
                          {showScopeErrors && errors.path && <FieldError>{errors.path}</FieldError>}
                        </Field>
                      </div>
                      {/* A direct CheckboxGroup child makes Field a fieldset, so each checkbox keeps its
                          own id. Inside a plain field every checkbox label points at the field id,
                          and clicking any method toggles the first. */}
                      <Field data-testid='rule-methods'>
                        <FieldLegend variant='label'>Methods</FieldLegend>
                        <FieldDescription>
                          Requests with other methods skip this rule.
                        </FieldDescription>
                        <CheckboxGroup name='methods' value={methods} onValueChange={setMethods}>
                          {HTTP_METHODS.map(method => (
                            <Checkbox key={method} value={method}>
                              <CheckboxIndicator />
                              <CheckboxLabel>
                                <HttpMethod method={method} />
                              </CheckboxLabel>
                            </Checkbox>
                          ))}
                        </CheckboxGroup>
                        {showScopeErrors && errors.methods && (
                          <FieldError>{errors.methods}</FieldError>
                        )}
                      </Field>
                    </VStack>
                  </StepperContent>

                  <StepperContent index={1} className='py-16'>
                    <Field required>
                      <FieldLabel>
                        Condition
                        <FieldIndicator />
                      </FieldLabel>
                      <FieldDescription>
                        YAML. A request matches when every item under all is true.
                      </FieldDescription>
                      <CodeEditorRoot
                        value={condition}
                        onChange={setCondition}
                        language='yaml'
                        data-testid='rule-condition'
                      >
                        <CodeSnippetHeader>
                          <CodeSnippetTitle>condition.yaml</CodeSnippetTitle>
                          <CodeSnippetActions>
                            <CodeSnippetCopyButton />
                            <CodeSnippetWrapButton />
                          </CodeSnippetActions>
                        </CodeSnippetHeader>
                        <CodeEditorContent lineNumbers aria-label='Rule condition' />
                      </CodeEditorRoot>
                      {showConditionErrors && errors.condition && (
                        <FieldError>{errors.condition}</FieldError>
                      )}
                    </Field>
                  </StepperContent>

                  <StepperContent index={2} className='py-16'>
                    <Field required>
                      <FieldLabel>
                        Action
                        <FieldIndicator />
                      </FieldLabel>
                      <FieldDescription>What happens to a request that matches.</FieldDescription>
                      <RadioGroup
                        variant='card'
                        name='action'
                        value={action}
                        onValueChange={handleActionChange}
                      >
                        <Radio value='block'>
                          <RadioIndicator />
                          <RadioLabel>Block</RadioLabel>
                          <RadioDescription>
                            Return 403 and record the request as an attack.
                          </RadioDescription>
                        </Radio>
                        <Radio value='monitor'>
                          <RadioIndicator />
                          <RadioLabel>Monitor</RadioLabel>
                          <RadioDescription>
                            Let the request through and record it as an attack. Use it to tune a new
                            rule first.
                          </RadioDescription>
                        </Radio>
                      </RadioGroup>
                    </Field>
                  </StepperContent>

                  <StepperContent index={3} className='py-16'>
                    <VStack gap={16}>
                      <Alert color='info'>
                        <AlertIcon />
                        <AlertContent>
                          <AlertTitle>Applies within a minute</AlertTitle>
                          <AlertDescription>
                            Every node picks up the rule on its next sync. Requests already in
                            flight are not rechecked.
                          </AlertDescription>
                        </AlertContent>
                      </Alert>
                      <div>
                        <VStack gap={6} className='pb-8' data-testid='rule-review'>
                          <Attribute orientation='horizontal'>
                            <AttributeLabel width={140}>Name</AttributeLabel>
                            <AttributeValue>{name}</AttributeValue>
                          </Attribute>
                          <Attribute orientation='horizontal'>
                            <AttributeLabel width={140}>Host</AttributeLabel>
                            <AttributeValue>{host[0]}</AttributeValue>
                          </Attribute>
                          <Attribute orientation='horizontal'>
                            <AttributeLabel width={140}>Path</AttributeLabel>
                            <AttributeValue>
                              <InlineCodeSnippet code={path} size='md' />
                            </AttributeValue>
                          </Attribute>
                          <Attribute orientation='horizontal'>
                            <AttributeLabel width={140}>Methods</AttributeLabel>
                            <AttributeValue>
                              <HStack gap={4}>
                                {methods.map(method => (
                                  <HttpMethod key={method} method={method} />
                                ))}
                              </HStack>
                            </AttributeValue>
                          </Attribute>
                          <Attribute orientation='horizontal'>
                            <AttributeLabel width={140}>Action</AttributeLabel>
                            <AttributeValue>
                              <Badge variant='dotted' type='secondary' color={ACTION[action].color}>
                                {ACTION[action].label}
                              </Badge>
                            </AttributeValue>
                          </Attribute>
                        </VStack>
                        <Separator spacing={4} />
                        <HStack justify='between' align='center' className='py-8'>
                          <Heading as='h3' size='md' weight='medium'>
                            Condition
                          </Heading>
                        </HStack>
                        <CodeSnippetRoot code={condition} language='yaml'>
                          <CodeSnippetContent>
                            <CodeSnippetLineNumbers />
                            <CodeSnippetCode />
                          </CodeSnippetContent>
                        </CodeSnippetRoot>
                      </div>
                    </VStack>
                  </StepperContent>
                </DrawerBody>
              </CodeSnippetAdapterProvider>
              <DrawerFooter>
                <DrawerFooterControls placement='left'>
                  <DrawerClose asChild>
                    <Button variant='ghost' color='neutral'>
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooterControls>
                <DrawerFooterControls placement='right'>
                  <StepperPrevTrigger asChild>
                    <Button variant='outline' color='neutral' data-testid='rule-back'>
                      Back
                    </Button>
                  </StepperPrevTrigger>
                  {last ? (
                    <Button type='submit' loading={pending} data-testid='rule-submit'>
                      Create rule
                    </Button>
                  ) : (
                    <StepperNextTrigger asChild>
                      <Button data-testid='rule-next'>Next</Button>
                    </StepperNextTrigger>
                  )}
                </DrawerFooterControls>
              </DrawerFooter>
            </Stepper>
          </form>
        </DrawerContent>
      </Drawer>
    </Page>
  );
};

/**
 * The custom rules list. "Create rule" opens a four-step `Stepper` drawer: Scope (a host
 * `Select`, a path and a `CheckboxGroup` of methods), Condition (a YAML `CodeEditor`), Action
 * (`RadioGroup variant='card'`) and Review (`Attribute` rows and a read-only `CodeSnippet`).
 * Steps never block; "Create rule" on Review jumps back to the first invalid step, or closes the
 * drawer, adds the row and shows a toast.
 */
export const Default = RuleEditor.bind({});
Default.args = { isLoading: false };

/**
 * The rules request is still in flight: the table shows skeleton rows while "Create rule" stays
 * available.
 */
export const Loading = RuleEditor.bind({});
Loading.args = { isLoading: true };
