import type { FC, Ref, SVGProps } from 'react';
import { useId } from 'react';
import { charTree } from '../../lib/agent-characters/char';
import type { AgentCharacterId, AgentLook } from '../../lib/agent-characters/data.gen';
import { CAST } from '../../lib/agent-characters/data.gen';
import { defaultLook } from '../../lib/agent-characters/look';
import type { AgentAvatarSize } from '../../lib/agent-characters/places';
import type { SvgNode } from '../../lib/agent-characters/svg';
import { cn } from '../../utils/cn';
import { renderSvgNode } from '../../utils/renderSvgNode';
import { layerKey, useBakedLayers } from './useBakedLayers';

/** Persistent states of an agent; Hello and Done show their static frame here (the live beats come later). */
export type AgentAvatarState =
  | 'idle'
  | 'working'
  | 'needs'
  | 'failed'
  | 'off'
  | 'box'
  | 'invite'
  | 'hello'
  | 'done';

type AgentAvatarLook =
  | { agent: AgentCharacterId; look?: never }
  | { look: AgentLook; agent?: never };

export type AgentAvatarProps = Omit<
  SVGProps<SVGSVGElement>,
  'ref' | 'children' | 'role' | 'aria-label' | 'aria-hidden' | 'tabIndex'
> &
  AgentAvatarLook & {
    ref?: Ref<SVGSVGElement>;
    /** Set per place (see PLACES): 40 Overview rows, 48 headers and toasts, 56 beside people, 72 cards and the drawer, 120 the empty chat. */
    size: AgentAvatarSize;
    state?: AgentAvatarState;
    /** The agent's template has applications (`applications_scoped`): only then can it show Partial coverage. */
    hasApplications?: boolean;
    /** `partial` keeps the top of the head in grey felt, in every state but Deactivated. */
    coverage?: 'full' | 'partial';
    /** The contact shadow: the drawer header, the empty chat and 96 px and up (D1). */
    shadow?: boolean;
    /** Set when the character stands alone; leave unset next to the agent's visible name (decorative). */
    label?: string;
    /** The agent's uid: keeps its timing stable and distinct from its neighbours. */
    seed: string;
  };

const lookOf = (id: string | undefined) => CAST.find(p => p.id === id) ?? defaultLook(id ?? '');

/**
 * An AI agent's character above 32 px: a soft felt body baked in the browser, a glass visor and eyes in the state's
 * frame. This is the static frame of each state. Below 40 px use AgentGlyph.
 */
export const AgentAvatar: FC<AgentAvatarProps> = ({
  ref,
  agent,
  look,
  size,
  state = 'idle',
  hasApplications = false,
  coverage = 'full',
  shadow = false,
  label,
  seed,
  className,
  ...props
}) => {
  const ids = `agent-avatar-${useId().replace(/[^\w-]/g, '')}-`;
  const c = look ?? lookOf(agent);
  // the crown stays in every state but Deactivated (04 §4.11; charTree drops it when off)
  const cover = hasApplications && coverage === 'partial';
  const t = charTree(c, { size, state, shadow, cover, ids });
  // the grey veil is baked only while it shows, as on the page
  const baked = useBakedLayers(
    t.layers.filter(l => !l.veil || t.ghosting),
    size,
  );
  const bakedImage = (n: SvgNode) => {
    if (n.attrs['data-j'] === undefined) return undefined;
    const layer = t.layers[Number(n.attrs['data-j'])];
    return layer && baked[layerKey(layer)] ? { 'data-ready': true } : undefined;
  };
  const withImages = (n: SvgNode): SvgNode => {
    if (n.attrs['data-j'] === undefined)
      return n.children ? { ...n, children: n.children.map(withImages) } : n;
    const layer = t.layers[Number(n.attrs['data-j'])];
    const b = layer && baked[layerKey(layer)];
    if (!b) return n;
    return {
      ...n,
      children: n.children?.map(ch =>
        ch.tag === 'image'
          ? {
              ...ch,
              attrs: { ...ch.attrs, href: b.url, x: b.x0, y: b.y0, width: b.R, height: b.R },
            }
          : ch,
      ),
    };
  };

  return (
    <svg
      {...props}
      ref={ref}
      data-slot='agent-avatar'
      data-agent={agent}
      data-seed={seed}
      data-state={state}
      data-ghosting={t.ghosting || undefined}
      data-veiled={t.veiled || undefined}
      viewBox='-8 -14 136 128'
      width={t.width}
      height={t.height}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn('shrink-0', className)}
    >
      {t.children.map(withImages).map((n, i) => renderSvgNode(n, i, bakedImage))}
    </svg>
  );
};

AgentAvatar.displayName = 'AgentAvatar';
