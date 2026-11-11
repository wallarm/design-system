import type { CSSProperties, FC, Ref, SVGProps } from 'react';

import type { AgentCharacterId, AgentLook } from '../../lib/agent-characters/data.gen';
import { CAST } from '../../lib/agent-characters/data.gen';
import { shapeOf } from '../../lib/agent-characters/geom';
import { glyphTree } from '../../lib/agent-characters/glyph';
import { defaultLook } from '../../lib/agent-characters/look';
import type { AgentGlyphSize } from '../../lib/agent-characters/places';
import { cn } from '../../utils/cn';
import { renderSvgNode } from '../../utils/renderSvgNode';

/** States a glyph draws statically. Hello and Done show their arcs; the glyph never animates. */
export type AgentGlyphState =
  | 'idle'
  | 'hello'
  | 'working'
  | 'needs'
  | 'done'
  | 'failed'
  | 'off'
  | 'box'
  | 'invite';

type AgentGlyphLook =
  | { agent: AgentCharacterId; look?: never }
  | { look: AgentLook; agent?: never };

export type AgentGlyphProps = Omit<
  SVGProps<SVGSVGElement>,
  'ref' | 'children' | 'role' | 'tabIndex'
> &
  AgentGlyphLook & {
    ref?: Ref<SVGSVGElement>;
    /** 16 beside text-xs, 20 beside text-sm or larger and in table rows (D3); 24 and 32 for other compact slots. */
    size: AgentGlyphSize;
    state?: AgentGlyphState;
    /** The agent's template has applications (`applications_scoped`): only then can it show Partial coverage. */
    hasApplications?: boolean;
    /** `partial` draws the grey crown of Partial coverage, on duty only. */
    coverage?: 'full' | 'partial';
    /** `optical` lifts the body onto the text line (inline places); `box` keeps the box (ladders, stacks). */
    align?: 'optical' | 'box';
  };

/** A preset's look; any other id (or none) gets its deterministic default look, never Wally's coral. */
const lookOf = (id: string | undefined) => CAST.find(p => p.id === id) ?? defaultLook(id ?? '');

/**
 * An AI agent's character as a flat 16–32 px glyph: body, visor and eyes in the state's frame, plus a top-of-head
 * prop. Static, with no canvas or animation code. Always decorative: place it next to the agent's visible name.
 */
export const AgentGlyph: FC<AgentGlyphProps> = ({
  ref,
  agent,
  look,
  size,
  state = 'idle',
  hasApplications = false,
  coverage = 'full',
  align = 'optical',
  className,
  style,
  // a glyph is never announced: it always sits next to the agent's visible name (D17, D18)
  'aria-label': _label,
  'aria-labelledby': _labelledBy,
  ...rest
}) => {
  const { role: _role, ...props } = rest as typeof rest & { role?: string };
  const c = look ?? lookOf(agent);
  // The crown clip depends only on the shape: name it by the shape, so two glyphs that share the id (two DS copies,
  // two React roots) resolve url(#…) to identical geometry.
  const clipId = `agent-glyph-crown-${shapeOf(c.shape).id}`;
  const partial = hasApplications && coverage === 'partial' && state === 'idle';
  const t = glyphTree(c, size, partial ? 'partly' : state, clipId);
  const optical = align === 'optical';

  return (
    <svg
      {...props}
      ref={ref}
      data-slot='agent-glyph'
      data-agent={agent}
      data-state={state}
      viewBox='-8 -14 136 128'
      width={t.width}
      height={t.height}
      aria-hidden='true'
      className={cn(
        'block shrink-0',
        optical && 'translate-y-[var(--oy)]',
        t.opacity && 'opacity-55',
        className,
      )}
      style={optical ? ({ '--oy': `${t.oy}px`, ...style } as CSSProperties) : style}
    >
      {t.children.map((n, i) => renderSvgNode(n, i))}
    </svg>
  );
};

AgentGlyph.displayName = 'AgentGlyph';
