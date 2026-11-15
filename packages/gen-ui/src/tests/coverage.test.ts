import { describe, expect, it } from '@rstest/core';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { wallarmComponents } from '../components';

/**
 * A decision for every design-system component: the catalog entries that render it, or why an
 * agent never places it. A new DS component fails the test until it gets one, so the catalog
 * can't fall behind the design system without anyone deciding.
 */
type Decision = { entries: readonly string[] } | { excluded: string };

const FILTERS = "the app's own filter bar: an answer that filters fires an action with the filter";
const SECRETS = 'secrets never go through an agent';
const CHAT = 'chat host: the Wally chat renders gen-ui answers, not the other way round';
const CHROME = 'app chrome: the app around the answer owns it';
const PRIMITIVE = 'internal primitive: entries use it inside their Views';
const PROVIDER = 'provider: the host app mounts it, with nothing to render';
/** The typed values a Table column, a row detail and a KeyValueList draw (`render/cells.tsx`). */
const VALUE = { entries: ['Table', 'KeyValueList'] };

const DECISIONS: Record<string, Decision> = {
  Accordion: { entries: ['Accordion'] },
  AgentAvatar: { excluded: CHAT },
  AgentGlyph: { excluded: CHAT },
  AgentLookBuilder: { excluded: 'not a component: look options for building agent characters' },
  Alert: { entries: ['Alert'] },
  AnimatedBackground: { excluded: 'decoration: carries no data' },
  ApprovalCard: { excluded: `${CHAT}; an action that changes something goes through it` },
  AppShell: { excluded: CHROME },
  AssistantMessage: { excluded: CHAT },
  Attribute: { entries: ['KeyValueList', 'Table'] },
  Avatar: { excluded: 'identity of a user or agent: needs an image URL the agent may not send' },
  Badge: { entries: ['Badge', 'Table'] },
  Banner: { excluded: `${CHROME}; a message in the answer is Alert` },
  Breadcrumbs: { excluded: CHROME },
  BulkBar: {
    excluded: 'a bulk action is a Button whose context reads the bound Table selection',
  },
  Button: { entries: ['Button'] },
  ButtonBase: { excluded: PRIMITIVE },
  Calendar: { excluded: 'an inline month grid: a date the user picks is DateInput' },
  Card: { entries: ['Card'] },
  ChainOfThought: { excluded: CHAT },
  Chat: { excluded: CHAT },
  ChatInput: { excluded: CHAT },
  ChatPermissions: { excluded: CHAT },
  Checkbox: { entries: ['Checkbox'] },
  Checkmark: { excluded: PRIMITIVE },
  Code: VALUE,
  CodeEditor: { excluded: "editing code is the app's editor; read-only code is CodeSnippet" },
  CodeSnippet: { entries: ['CodeSnippet'] },
  Conversation: { excluded: CHAT },
  Copyable: { excluded: `${PRIMITIVE}; CodeSnippet has its own copy button` },
  Country: VALUE,
  DateFormatProvider: { excluded: PROVIDER },
  DateInput: { entries: ['DateInput'] },
  DateRangeInput: { entries: ['DateRangeInput'] },
  Dialog: { entries: ['Dialog'] },
  Drawer: { entries: ['Drawer', 'Table'] },
  DropdownMenu: { entries: ['Table'] },
  EmptyState: { entries: ['EmptyState'] },
  FeedbackPulse: { excluded: 'overlay: the app opens its survey, with its own logic' },
  Field: {
    entries: [
      'Input',
      'Select',
      'Textarea',
      'NumberInput',
      'Slider',
      'RadioGroup',
      'SegmentedControl',
      'DateInput',
    ],
  },
  FileUpload: { excluded: 'files never travel through an answer: the app uploads them itself' },
  FilterCascade: { excluded: FILTERS },
  FilterDropdown: { excluded: FILTERS },
  FilterInput: { excluded: FILTERS },
  Flex: { excluded: `${PRIMITIVE}; an answer's layout is Stack and Grid` },
  FormatDateTime: VALUE,
  FormatNumber: { excluded: 'a formatter: entries take a named format from core/format.ts' },
  Heading: { entries: ['Heading', 'Section'] },
  HoverCard: { excluded: 'overlay: user and agent cards the app fills with its own data' },
  HttpMethod: VALUE,
  ImageCropper: { excluded: 'image editing: nothing an answer asks the user for' },
  Indicator: { excluded: `${PRIMITIVE}; a status is Badge` },
  InlineEdit: { excluded: "editing a value in place on the app's page: an answer asks with Input" },
  Input: { entries: ['Input'] },
  InputGroup: { excluded: `${PRIMITIVE}; an answer\'s text field is Input` },
  InputOTP: { excluded: SECRETS },
  Ip: VALUE,
  Kbd: { excluded: 'shortcuts belong to the app, not to an answer' },
  Link: { entries: ['Link'] },
  List: { entries: ['List'] },
  Loader: { excluded: `${PRIMITIVE}; an entry streams in behind its Skeleton` },
  Logo: { excluded: CHROME },
  MessageActions: { excluded: CHAT },
  NavPanel: { excluded: CHROME },
  NavRail: { excluded: CHROME },
  NotificationCenter: { excluded: CHROME },
  NumberInput: { entries: ['NumberInput'] },
  NumericBadge: { excluded: `${PRIMITIVE}; a count is a Table number or a Metric` },
  OverflowList: { excluded: PRIMITIVE },
  OverflowTooltip: { excluded: PRIMITIVE },
  Overlay: { excluded: PRIMITIVE },
  Page: { excluded: `${CHROME}; an answer is laid out with Section` },
  Pagination: { entries: ['Table'] },
  ParameterPath: VALUE,
  PasswordComplexity: { excluded: SECRETS },
  PasswordInput: { excluded: SECRETS },
  Polymorphic: { excluded: PRIMITIVE },
  Popover: { excluded: 'overlay on an arbitrary anchor: content on demand is Drawer or Dialog' },
  Progress: { entries: ['Progress'] },
  Radio: { entries: ['RadioGroup'] },
  RemoteShell: { excluded: CHROME },
  Resizable: { excluded: `${PRIMITIVE}; an answer's layout is Grid and Stack` },
  ResponseCode: VALUE,
  ScrollArea: { excluded: PRIMITIVE },
  SearchInput: { entries: ['SearchInput'] },
  SearchModal: { excluded: CHROME },
  SegmentedControl: { entries: ['SegmentedControl'] },
  SegmentedTabs: {
    excluded: 'a switch between app views: alternative panes in an answer are Tabs',
  },
  Select: { entries: ['Select'] },
  Selection: {
    excluded: 'selectable items outside a Table: Table rows select through its selection prop',
  },
  Separator: { entries: ['Separator'] },
  SimpleCharts: {
    entries: [
      'Metric',
      'BarList',
      'HorizontalBarStack',
      'PieChart',
      'LineChart',
      'AreaChart',
      'ColumnChart',
    ],
  },
  Skeleton: { excluded: `${PRIMITIVE}; every entry has its own Skeleton` },
  Slider: { entries: ['Slider'] },
  SplashScreen: { excluded: CHROME },
  SplitButton: {
    excluded:
      'an action with a menu of variants: one action is Button, a row action is in the Table',
  },
  Stack: { entries: ['Stack', 'Section'] },
  Stepper: { excluded: 'a wizard: its current step is app state, not an answer' },
  Switch: { entries: ['Switch'] },
  Table: { entries: ['Table'] },
  Tabs: { entries: ['Tabs'] },
  Tag: { excluded: 'interactive chip: a static label is Badge, a choice is Select or Checkbox' },
  TemporalCore: { entries: ['DateInput', 'DateRangeInput', 'TimeInput'] },
  Text: { entries: ['Text'] },
  Textarea: { entries: ['Textarea'] },
  ThemeProvider: { excluded: PROVIDER },
  TimeInput: { entries: ['TimeInput'] },
  Timeline: { entries: ['Timeline'] },
  Toast: { excluded: 'overlay: the agent fires an app action and the app toasts' },
  ToggleButton: { entries: ['ToggleButton'] },
  Tooltip: { excluded: 'hover-only: hides data from touch and keyboard users' },
  TopHeader: { excluded: CHROME },
  Tour: { excluded: 'overlay: the app runs it over its own page' },
  Tree: { entries: ['Tree'] },
  TreeView: { excluded: 'a selectable hierarchy: a read-only one is Tree, a choice is Select' },
  UserMessage: { excluded: CHAT },
  UtilityPage: { excluded: `${CHROME}; an answer says it with Alert or EmptyState` },
  WallyAssistant: { excluded: CHAT },
  WallyIcon: { excluded: CHAT },
  WallySkeleton: { excluded: CHAT },
};

/** Entries with no DS component behind them: the dashboard grid is plain CSS grid. */
const GEN_UI_ONLY = ['Grid', 'GridItem'];

const DS_COMPONENTS = join(__dirname, '..', '..', '..', 'design-system', 'src', 'components');
const dsComponents = readdirSync(DS_COMPONENTS, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort();

describe('catalog coverage', () => {
  it('has a decision for every design-system component, and none for a removed one', () => {
    expect(Object.keys(DECISIONS).sort()).toEqual(dsComponents);
  });

  it('names only entries the catalog has', () => {
    const names = new Set(wallarmComponents.map(c => c.name));
    const unknown = Object.values(DECISIONS)
      .flatMap(d => ('entries' in d ? d.entries : []))
      .filter(name => !names.has(name));
    expect(unknown).toEqual([]);
  });

  it('decides every catalog entry', () => {
    const decided = new Set([
      ...GEN_UI_ONLY,
      ...Object.values(DECISIONS).flatMap(d => ('entries' in d ? d.entries : [])),
    ]);
    expect(wallarmComponents.map(c => c.name).filter(name => !decided.has(name))).toEqual([]);
  });
});
