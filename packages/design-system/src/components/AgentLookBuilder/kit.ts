// The builder entry (WDS-204): the kit with display names and the full prop library. Importing this module adds
// nothing to a page; enableAgentLookLibrary() registers propDef for every character drawn after the call.
import {
  type AgentColorDef,
  type AgentColorId,
  type AgentEyeStyle,
  type AgentPropId,
  type AgentShapeId,
  COLORS,
  EYE_STYLES,
  GLYPH_PROPS,
  PROPS,
  SHAPES,
} from '../../lib/agent-characters/data.gen';
import { setPropLibrary } from '../../lib/agent-characters/propOf';
import { propDef } from '../../lib/agent-characters/props';

/**
 * Loads the full prop library (15 props on any shape) for every DS copy on the page. Any app that renders stored
 * custom looks calls it once at start-up — the cards, rows and tables that show them, not only the picker.
 * Without it only the six presets' props are drawn. Mounted glyphs pick it up on their next render; a mounted 3D
 * character keeps what it drew until its look changes or it remounts, so call it before the first render.
 */
export function enableAgentLookLibrary() {
  setPropLibrary(propDef);
}

export interface AgentShapeOption {
  id: AgentShapeId;
  name: string;
  family: 'soft' | 'object';
}
export interface AgentColorOption {
  id: AgentColorId;
  name: string;
  hex: string;
  group: AgentColorDef['g'];
  /** Wally's coral: never offered to other agents (D22) */
  brand?: true;
}
export interface AgentEyeOption {
  id: AgentEyeStyle;
  name: string;
}
export interface AgentPropOption {
  id: AgentPropId;
  name: string;
  /** drawn at glyph sizes (16–32 px); the others show only on the 3D character */
  glyph: boolean;
}

export const AGENT_SHAPES: readonly AgentShapeOption[] = SHAPES.map(s => ({
  id: s.id,
  name: s.name,
  family: s.fam,
}));
/** The full palette. Filter `brand` (coral, Wally only) out of pickers (D22). */
export const AGENT_COLORS: readonly AgentColorOption[] = COLORS.map(c => ({
  id: c.id,
  name: c.name,
  hex: c.hex,
  group: c.g,
  ...(c.brand ? { brand: true as const } : {}),
}));
export const AGENT_EYES: readonly AgentEyeOption[] = EYE_STYLES.map(id => ({
  id,
  name: id[0]?.toUpperCase() + id.slice(1),
}));
export const AGENT_PROPS: readonly AgentPropOption[] = PROPS.map(([id, name]) => ({
  id,
  name,
  glyph: GLYPH_PROPS.has(id),
}));
