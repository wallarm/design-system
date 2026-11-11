import type { ReactNode } from 'react';

import {
  Activity,
  BadgeCheck,
  Bot,
  Brain,
  CircleDashed,
  Database,
  Download,
  FilePlus,
  FileText,
  Filter,
  GitBranch,
  Globe,
  Link,
  ListChecks,
  Pencil,
  Plug,
  Radar,
  Search,
  ShieldAlert,
  Terminal,
  Wrench,
} from '../../../icons';
import type { ChatStep, ChatStepStatus } from '../model/model';

/** Figma 483:1899 step types. Internal: apps override through the `icons` prop. */
const STEP_TYPE_ICONS: Readonly<Record<string, ReactNode>> = {
  thinking: <Brain />,
  plan: <ListChecks />,
  decision: <GitBranch />,
  subagent: <Bot />,
  tool: <Wrench />,
  command: <Terminal />,
  'web-search': <Globe />,
  query: <Search />,
  datastore: <Database />,
  api: <Plug />,
  read: <FileText />,
  fetch: <Download />,
  filter: <Filter />,
  create: <FilePlus />,
  edit: <Pencil />,
  cite: <Link />,
  threat: <ShieldAlert />,
  scan: <Radar />,
  pending: <CircleDashed />,
  summary: <Activity />,
  created: <BadgeCheck />,
};

const KIND_ICONS: Readonly<Record<string, ReactNode>> = {
  reasoning: <Brain />,
  tool: <Wrench />,
  agent: <Bot />,
};

const DEFAULT_ICON = <CircleDashed />;

/** Own keys only, so a key like 'constructor' never resolves to a prototype member. */
const lookup = (
  table: Readonly<Record<string, ReactNode>> | undefined,
  key: string | undefined,
): ReactNode | undefined => (table && key && Object.hasOwn(table, key) ? table[key] : undefined);

/** App `icons`, then the Figma table, then `fallback`. Context chips use it with a Quote fallback. */
export const resolveIcon = (
  key: string | undefined,
  icons: Readonly<Record<string, ReactNode>> | undefined,
  fallback: ReactNode = DEFAULT_ICON,
): ReactNode => lookup(icons, key) ?? lookup(STEP_TYPE_ICONS, key) ?? fallback;

/** `icon: null` → the Simple row; otherwise the key, then the kind's default, then CircleDashed. */
export const resolveStepIcon = (
  step: Pick<ChatStep, 'icon' | 'kind'>,
  icons: Readonly<Record<string, ReactNode>> | undefined,
): ReactNode =>
  step.icon === null
    ? null
    : resolveIcon(step.icon, icons, lookup(KIND_ICONS, step.kind) ?? DEFAULT_ICON);

/** `ChatStepStatus` → `ChainOfThoughtStep status`; unknown values render as done. */
export const stepVisualStatus = (status: ChatStepStatus): 'running' | 'done' | 'error' => {
  switch (status) {
    case 'pending':
    case 'running':
    case 'awaiting-approval':
      return 'running';
    case 'error':
      return 'error';
    default:
      return 'done';
  }
};
