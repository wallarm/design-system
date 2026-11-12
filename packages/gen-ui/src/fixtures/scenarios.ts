/**
 * Every recorded answer a demo can replay, in picker order: what the user asked, a line about what
 * the answer shows, and its streams in both formats.
 */
import type { GenUiAction } from '../core/define';
import { API_INVENTORY_SCENARIO } from './apiInventory';
import {
  ATTACK_SUMMARY_A2UI,
  ATTACK_SUMMARY_ACTIONS,
  ATTACK_SUMMARY_JSON_RENDER,
} from './attackSummary';
import { DASHBOARD_SCENARIO } from './dashboard';
import { INCIDENT_SCENARIO } from './incident';
import { LIVE_MONITOR_SCENARIO } from './liveMonitor';
import { type Scenario, type ScenarioStreams, toStreams } from './stream';
import { WEEKLY_REPORT_SCENARIO } from './weeklyReport';

export interface ReplayScenario extends ScenarioStreams {
  id: string;
  prompt: string;
  summary: string;
  actions: readonly GenUiAction[];
}

export const SCENARIOS: readonly ReplayScenario[] = [
  {
    id: 'attack-summary',
    prompt: 'Show attacks for the last 24 hours',
    summary: 'Two metrics, the top attacked endpoints, an alert and two actions',
    actions: ATTACK_SUMMARY_ACTIONS,
    // Written by hand in both formats; the agent sends its own data in this one.
    a2ui: ATTACK_SUMMARY_A2UI.map(line => ({ origin: 'agent', line })),
    jsonRender: ATTACK_SUMMARY_JSON_RENDER.map(line => ({ origin: 'agent', line })),
  },
  ...[
    DASHBOARD_SCENARIO,
    LIVE_MONITOR_SCENARIO,
    INCIDENT_SCENARIO,
    API_INVENTORY_SCENARIO,
    WEEKLY_REPORT_SCENARIO,
  ].map((scenario: Scenario): ReplayScenario => ({ ...scenario, ...toStreams(scenario) })),
];
