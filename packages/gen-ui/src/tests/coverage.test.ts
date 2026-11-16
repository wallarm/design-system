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

const FORMS = 'input: forms with two-way binding (#472)';
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
  BulkBar: { excluded: 'Table selection and bulk actions (#472)' },
  Button: { entries: ['Button'] },
  ButtonBase: { excluded: PRIMITIVE },
  Calendar: { excluded: FORMS },
  Card: { entries: ['Card'] },
  ChainOfThought: { excluded: CHAT },
  Chat: { excluded: CHAT },
  ChatInput: { excluded: CHAT },
  ChatPermissions: { excluded: CHAT },
  Checkbox: { excluded: FORMS },
  Checkmark: { excluded: PRIMITIVE },
  Code: VALUE,
  CodeEditor: { excluded: `${FORMS}; read-only code is CodeSnippet` },
  CodeSnippet: { entries: ['CodeSnippet'] },
  Conversation: { excluded: CHAT },
  Copyable: { excluded: `${PRIMITIVE}; CodeSnippet has its own copy button` },
  Country: VALUE,
  DateFormatProvider: { excluded: PROVIDER },
  DateInput: { excluded: FORMS },
  DateRangeInput: { excluded: FORMS },
  Dialog: { entries: ['Dialog'] },
  Drawer: { entries: ['Drawer', 'Table'] },
  DropdownMenu: { excluded: 'menu items need event arguments (#472)' },
  EmptyState: { entries: ['EmptyState'] },
  FeedbackPulse: { excluded: 'overlay: the app opens its survey, with its own logic' },
  Field: { excluded: FORMS },
  FileUpload: { excluded: FORMS },
  FilterCascade: { excluded: FORMS },
  FilterDropdown: { excluded: FORMS },
  FilterInput: { excluded: FORMS },
  Flex: { excluded: `${PRIMITIVE}; an answer's layout is Stack and Grid` },
  FormatDateTime: VALUE,
  FormatNumber: { excluded: 'a formatter: entries take a named format from core/format.ts' },
  Heading: { entries: ['Heading', 'Section'] },
  HoverCard: { excluded: 'overlay: user and agent cards the app fills with its own data' },
  HttpMethod: VALUE,
  ImageCropper: { excluded: FORMS },
  Indicator: { excluded: `${PRIMITIVE}; a status is Badge` },
  InlineEdit: { excluded: FORMS },
  Input: { excluded: FORMS },
  InputGroup: { excluded: FORMS },
  InputOTP: { excluded: `${FORMS}; an agent never asks for a code` },
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
  NumberInput: { excluded: FORMS },
  NumericBadge: { excluded: `${PRIMITIVE}; a count is a Table number or a Metric` },
  OverflowList: { excluded: PRIMITIVE },
  OverflowTooltip: { excluded: PRIMITIVE },
  Overlay: { excluded: PRIMITIVE },
  Page: { excluded: `${CHROME}; an answer is laid out with Section` },
  Pagination: { excluded: 'Table paging (#472)' },
  ParameterPath: VALUE,
  PasswordComplexity: { excluded: FORMS },
  PasswordInput: { excluded: FORMS },
  Polymorphic: { excluded: PRIMITIVE },
  Popover: { excluded: 'overlay on an arbitrary anchor: content on demand is Drawer or Dialog' },
  Progress: { entries: ['Progress'] },
  Radio: { excluded: FORMS },
  RemoteShell: { excluded: CHROME },
  Resizable: { excluded: `${PRIMITIVE}; an answer's layout is Grid and Stack` },
  ResponseCode: VALUE,
  ScrollArea: { excluded: PRIMITIVE },
  SearchInput: { excluded: FORMS },
  SearchModal: { excluded: CHROME },
  SegmentedControl: { excluded: FORMS },
  SegmentedTabs: {
    excluded: 'a switch between app views: alternative panes in an answer are Tabs',
  },
  Select: { excluded: FORMS },
  Selection: { excluded: 'Table selection and bulk actions (#472)' },
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
  Slider: { excluded: FORMS },
  SplashScreen: { excluded: CHROME },
  SplitButton: { excluded: 'menu items need event arguments (#472); one action is Button' },
  Stack: { entries: ['Stack', 'Section'] },
  Stepper: { excluded: 'a wizard: its current step is app state (with forms, #472)' },
  Switch: { excluded: FORMS },
  Table: { entries: ['Table'] },
  Tabs: { entries: ['Tabs'] },
  Tag: { excluded: 'interactive chip (#472): a static label is Badge' },
  TemporalCore: { excluded: PRIMITIVE },
  Text: { entries: ['Text'] },
  Textarea: { excluded: FORMS },
  ThemeProvider: { excluded: PROVIDER },
  TimeInput: { excluded: FORMS },
  Timeline: { entries: ['Timeline'] },
  Toast: { excluded: 'overlay: the agent fires an app action and the app toasts' },
  ToggleButton: { excluded: FORMS },
  Tooltip: { excluded: 'hover-only: hides data from touch and keyboard users' },
  TopHeader: { excluded: CHROME },
  Tour: { excluded: 'overlay: the app runs it over its own page' },
  Tree: { entries: ['Tree'] },
  TreeView: { excluded: `${FORMS}; a read-only hierarchy is Tree` },
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
