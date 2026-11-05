// The prop registry (WDS-204): preset rendering ships the six presets' props as data; the full library (props.ts,
// propDef for 15 props on any shape) is registered only by the AgentLookBuilder entry.
import { type AgentShapeDef, PRESET_PROPS, type PropDef } from './data.gen';

type PropLibrary = (kind: string, S: AgentShapeDef, col: string) => PropDef;

let library: PropLibrary | null = null;
const warned = new Set<string>();

/** Registers the full prop library (AgentLookBuilder's enableAgentLookLibrary); null unregisters (tests). */
export function setPropLibrary(lib: PropLibrary | null) {
  library = lib;
}

/** propDef() for a look: the library when registered, else the preset table, else no prop. Never throws. */
export function propOf(kind: string, S: AgentShapeDef, col: string): PropDef | null {
  if (library) return library(kind, S, col);
  const key = `${S.id}|${col}|${kind}`;
  const hit = PRESET_PROPS[key];
  if (hit) return hit;
  if (kind !== 'none' && process.env.NODE_ENV !== 'production' && !warned.has(key)) {
    warned.add(key);
    // biome-ignore lint/suspicious/noConsole: dev-only warning
    console.warn(
      `[AgentAvatar] the prop "${kind}" on ${S.id} needs the full prop library: call enableAgentLookLibrary() from @wallarm-org/design-system/AgentLookBuilder. Drawn without the prop.`,
    );
  }
  return null;
}
