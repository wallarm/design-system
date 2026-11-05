// The prop registry (WDS-204): preset rendering ships the six presets' props as data; the full library (props.ts,
// propDef for 15 props on any shape) is registered only by the AgentLookBuilder entry.
import { type AgentShapeDef, PRESET_PROPS, type PropDef } from './data.gen';

type PropLibrary = (kind: string, S: AgentShapeDef, col: string) => PropDef;

// One registry per document, like the runtime (07 §6.5): a host that enables the library also enables it for a
// Module Federation remote's copy of the DS. Not on the runtime object: runtime.ts pulls the bake queue, which the
// glyph path must not load.
const KEY = Symbol.for('@wallarm-org/design-system/agent-characters/prop-library');
const registry = globalThis as typeof globalThis & { [KEY]?: PropLibrary | null };
const warned = new Set<string>();

/** Registers the full prop library (AgentLookBuilder's enableAgentLookLibrary); null unregisters (tests). */
export function setPropLibrary(lib: PropLibrary | null) {
  registry[KEY] = lib;
}

/** propDef() for a look: the library when registered, else the preset table, else no prop. Never throws. */
export function propOf(kind: string, S: AgentShapeDef, col: string): PropDef | null {
  const library = registry[KEY];
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
