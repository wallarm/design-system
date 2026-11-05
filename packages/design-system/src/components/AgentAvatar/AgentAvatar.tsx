import type { FC, Ref, RefObject, SVGProps } from 'react';
import { useContext, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { charTree } from '../../lib/agent-characters/char';
import type { AgentCharacterId, AgentLook } from '../../lib/agent-characters/data.gen';
import { CAST } from '../../lib/agent-characters/data.gen';
import { defaultLook, hash32, rng } from '../../lib/agent-characters/look';
import type { AgentAvatarSize } from '../../lib/agent-characters/places';
import { getRuntime } from '../../lib/agent-characters/runtime';
import type { SvgNode } from '../../lib/agent-characters/svg';
import { cn } from '../../utils/cn';
import { mergeRefs } from '../../utils/mergeRefs';
import { renderSvgNode } from '../../utils/renderSvgNode';
import { AgentAvatarGroupContext } from './AgentAvatarGroup';
import { layerKey, useBakedLayers } from './useBakedLayers';
import {
  type AgentAvatarBeat,
  type AgentAvatarHandle,
  NO_DONE,
  useAgentMotion,
  useCharacter,
} from './useCharacter';

/** Persistent states of an agent, from data. Hello and Done here draw their frame; as events use `handleRef.play`. */
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
    /** Animated, set per place (40 Overview rows, 72 cards and the drawer, 120 the empty chat). Static under reduced
     *  motion or when motion is switched off (`setAgentMotion`). */
    live?: boolean;
    /** Beats and Cover all: `play('hello' | 'done')`, `coverAll()`, `cueHover(on)`. */
    handleRef?: Ref<AgentAvatarHandle>;
    /** After Hello or Done has played in full; the character shows `state` again. */
    onBeatEnd?: (beat: AgentAvatarBeat) => void;
    /** The Set up (or Cover all) control: Inviting glances at it; hover and focus on it are followed. */
    cueRef?: RefObject<HTMLElement | null>;
  };

const lookOf = (id: string | undefined) => CAST.find(p => p.id === id) ?? defaultLook(id ?? '');
// The ids carry this bundle's number from the document runtime, so two DS copies on a page never share one. Taken
// on the first mount, not at import: importing the package creates nothing.
let COPY: string | undefined;
const copyId = () => {
  COPY ??= getRuntime().nextId();
  return COPY;
};

type SvgRest = Omit<
  AgentAvatarProps,
  | 'agent'
  | 'look'
  | 'size'
  | 'state'
  | 'hasApplications'
  | 'coverage'
  | 'shadow'
  | 'label'
  | 'seed'
  | 'live'
  | 'handleRef'
  | 'onBeatEnd'
  | 'cueRef'
>;

interface FrameProps {
  t: ReturnType<typeof charTree>;
  size: number;
  /** bake the grey veil layers too */
  veil: boolean;
  agent?: AgentCharacterId;
  seed: string;
  label?: string;
  live: boolean;
  rest: SvgRest;
  svgRef: Ref<SVGSVGElement>;
}

/** The rendered SVG with its baked layers. Live, the engine owns every attribute it animates. */
const Frame: FC<FrameProps> = ({ t, size, veil, agent, seed, label, live, rest, svgRef }) => {
  const { className, ...props } = rest;
  const baked = useBakedLayers(
    t.layers.filter(l => !l.veil || veil),
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
      ref={svgRef}
      data-slot='agent-avatar'
      data-agent={agent}
      data-seed={seed}
      data-live={live || undefined}
      data-state={t.state}
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

interface InnerProps {
  c: AgentLook | Omit<AgentLook, 'v'>;
  agent?: AgentCharacterId;
  size: AgentAvatarSize;
  state: AgentAvatarState;
  cover: boolean;
  shadow: boolean;
  label?: string;
  seed: string;
  handleRef?: Ref<AgentAvatarHandle>;
  onBeatEnd?: (beat: AgentAvatarBeat) => void;
  cueRef?: RefObject<HTMLElement | null>;
  svgRef?: Ref<SVGSVGElement>;
  rest: SvgRest;
}

/** Static: the state's frame. A beat shows its frame for the page's static length (Hello 1.2 s, Done 1.6–2.2 s). */
const StaticAvatar: FC<InnerProps> = ({
  c,
  agent,
  size,
  state,
  cover,
  shadow,
  label,
  seed,
  handleRef,
  onBeatEnd,
  svgRef,
  rest,
}) => {
  const [copy] = useState(copyId);
  const ids = `agent-avatar-${copy}-${useId().replace(/[^\w-]/g, '')}-`;
  const [beat, setBeat] = useState<{ kind: AgentAvatarBeat; ms: number; covered: boolean } | null>(
    null,
  );
  const [r] = useState(() => {
    // the page's static Done length draws from the character's first stream after its five construction draws
    const g = rng(hash32(`x${c.shape}${seed}`));
    for (let i = 0; i < 5; i++) g();
    return g;
  });
  useImperativeHandle(
    handleRef,
    () => ({
      play(kind) {
        if (kind === 'hello' && state !== 'idle') return; // Hello plays only from On duty
        if (kind === 'done' && NO_DONE.has(state)) return; // nothing to finish when off or a ghost
        setBeat({ kind, ms: kind === 'hello' ? 1200 : 1600 + r() * 600, covered: false });
      },
      // under reduced motion Cover all jumps to its end: Done without the crown, from On duty only (as live)
      coverAll() {
        if (cover && state === 'idle')
          setBeat({ kind: 'done', ms: 1600 + r() * 600, covered: true });
      },
      cueHover: () => undefined,
    }),
    [state, cover, r],
  );
  const onEnd = useRef(onBeatEnd);
  const playing = useRef(beat);
  useEffect(() => {
    onEnd.current = onBeatEnd;
    playing.current = beat;
  });
  // a beat cut short (unmount, or motion switched on) still ends for the host
  useEffect(
    () => () => {
      if (playing.current) onEnd.current?.(playing.current.kind);
    },
    [],
  );
  useEffect(() => {
    if (!beat) return;
    const id = setTimeout(() => {
      setBeat(null);
      playing.current = null;
      onEnd.current?.(beat.kind);
    }, beat.ms);
    return () => clearTimeout(id);
  }, [beat]);
  const shown = beat ? beat.kind : state;
  const t = charTree(c, { size, state: shown, shadow, cover: cover && !beat?.covered, ids });
  return (
    <Frame
      t={t}
      size={size}
      veil={t.ghosting}
      agent={agent}
      seed={seed}
      label={label}
      live={false}
      rest={rest}
      svgRef={svgRef ?? null}
    />
  );
};

/** Live: the tree is drawn once from the mount state; the engine animates it from then on. */
const LiveAvatar: FC<InnerProps> = ({
  c,
  agent,
  size,
  state,
  cover,
  shadow,
  label,
  seed,
  handleRef,
  onBeatEnd,
  cueRef,
  svgRef,
  rest,
}) => {
  const [copy] = useState(copyId);
  const ids = `agent-avatar-${copy}-${useId().replace(/[^\w-]/g, '')}-`;
  const [init] = useState({ state, cover });
  const t = charTree(c, { size, state: init.state, shadow, cover: init.cover, ids });
  const [veil, setVeil] = useState(t.ghosting);
  const own = useRef<SVGSVGElement | null>(null);
  const group = useContext(AgentAvatarGroupContext);
  const requestVeil = () => setVeil(true);
  const setSvg = (node: SVGSVGElement | null) => mergeRefs(own, svgRef)(node);
  useCharacter(
    own,
    {
      look: c,
      size,
      seed,
      state,
      cover,
      cueRef,
      onBeatEnd,
      requestVeil,
      peers: group ?? undefined,
    },
    handleRef,
  );
  return (
    <Frame
      t={t}
      size={size}
      veil={veil}
      agent={agent}
      seed={seed}
      label={label}
      live
      rest={rest}
      svgRef={setSvg}
    />
  );
};

/**
 * An AI agent's character above 32 px: a soft felt body baked in the browser, a glass visor and eyes. Static, it
 * draws its state's frame; `live`, it moves as the reference does (blinks, glances, the idle repertoire, beats).
 * Below 40 px use AgentGlyph.
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
  live = false,
  handleRef,
  onBeatEnd,
  cueRef,
  ...rest
}) => {
  const c = look ?? lookOf(agent);
  // the crown stays in every state but Deactivated (04 §4.11; charTree drops it when off)
  const cover = hasApplications && coverage === 'partial';
  const motion = useAgentMotion(live);
  const inner: InnerProps = {
    c,
    agent,
    size,
    state,
    cover,
    shadow,
    label,
    seed,
    handleRef,
    onBeatEnd,
    cueRef,
    svgRef: ref,
    rest,
  };
  // a new look, size or seed is a new character; switching motion on or off redraws from the current state
  return live && motion ? (
    <LiveAvatar
      key={`${c.shape}|${c.color}|${c.eyes}|${c.prop}|${size}|${seed}|${shadow}`}
      {...inner}
    />
  ) : (
    <StaticAvatar key='static' {...inner} />
  );
};

AgentAvatar.displayName = 'AgentAvatar';
