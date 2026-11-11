import cast from '../../../../scripts/agent-avatars/data/cast.json';
import { type AgentPreset, CAST } from '../data.gen';
import { setPropLibrary } from '../propOf';
import { propDef } from '../props';

/** The page's own presets, by its ids (Mend, Probe): the fixtures were captured with them, not with the shipped cast. */
export const PAGE_CAST = cast.presets as unknown as (Omit<AgentPreset, 'id'> & { id: string })[];

export const pagePreset = (id: string) => {
  const p = PAGE_CAST.find(c => c.id === id);
  if (!p) throw new Error(`no preset ${id} on the reference page`);
  return p;
};

/** Runs `fn` with the full prop library when one of the page's presets left the cast (Probe): the shipped preset
 *  table has no prop for it. Shipped looks keep running without the library, as in production. */
export function withPageProps<T>(ids: string[], fn: () => T): T {
  const pageOnly = ids.some(id => {
    const p = pagePreset(id);
    return !CAST.some(c => c.shape === p.shape && c.color === p.color && c.prop === p.prop);
  });
  if (!pageOnly) return fn();
  setPropLibrary(propDef);
  try {
    return fn();
  } finally {
    setPropLibrary(null);
  }
}
