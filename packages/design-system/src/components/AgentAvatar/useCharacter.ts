import {
  type Ref,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { AgentLook } from '../../lib/agent-characters/data.gen';
import { type Character, createCharacter, joinPeers } from '../../lib/agent-characters/engine';
import type { StateId } from '../../lib/agent-characters/eyes';
import { getRuntime } from '../../lib/agent-characters/runtime';

/** One-shot beats: they play in full, then the avatar shows `state` again (04 §5.2, D27). */
export type AgentAvatarBeat = 'hello' | 'done';

export interface AgentAvatarHandle {
  /** Hello on drawer or chat open (from On duty only); Done when a run finishes. */
  play(beat: AgentAvatarBeat): void;
  /** «Cover all applications»: the crown fills to the top, then Done. */
  coverAll(): void;
  /** Hover or focus on Set up / Cover all (bound automatically when `cueRef` is set). */
  cueHover(on: boolean): void;
}

/** Turns character motion on or off for the whole document (P7, a per-user setting; on by default). Reduced motion
 *  in the system settings turns it off as well. Off, every avatar shows its state's static frame. */
export const setAgentMotion = (enabled: boolean) => getRuntime().setMotionEnabled(enabled);

/** Whether characters may move: the off switch and the system's reduced-motion setting, followed live. */
export function useAgentMotion() {
  const rt = getRuntime();
  return useSyncExternalStore(rt.subscribe, rt.motionOn, () => false);
}

const ACTIVE = new Set<StateId>(['idle', 'working', 'needs', 'failed']);

export interface CharacterParams {
  look: Pick<AgentLook, 'shape' | 'color' | 'eyes' | 'prop'>;
  size: number;
  seed: string;
  state: StateId;
  cover: boolean;
  cueRef?: RefObject<HTMLElement | null>;
  onBeatEnd?: (beat: AgentAvatarBeat) => void;
  /** the grey veil layers are needed: bake them */
  requestVeil: () => void;
  /** the runtime registry of neighbours, set by AgentAvatarGroup */
  peers?: Set<Character>;
}

/**
 * Drives the rendered character with the engine while mounted: one live character registered with the document
 * runtime, disposed on unmount. React never re-renders for motion; state, coverage and beats go to the engine.
 */
export function useCharacter(
  svgRef: RefObject<SVGSVGElement | null>,
  p: CharacterParams,
  handleRef?: Ref<AgentAvatarHandle>,
) {
  const chRef = useRef<Character | null>(null);
  const latest = useRef(p);
  useLayoutEffect(() => {
    latest.current = p;
  });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const L = latest.current;
    const ch = createCharacter(svg, L.look, {
      size: L.size,
      state: L.state,
      live: true,
      cover: L.cover,
      salt: L.seed,
      autoReturn: true,
      cue: () => latest.current.cueRef?.current,
      // D27: a one-shot returns to the data's state, whatever it is by then
      returnTo: () => latest.current.state,
      onState: (_st, from) => {
        if (from === 'hello' || from === 'done') latest.current.onBeatEnd?.(from);
      },
      requestVeil: () => latest.current.requestVeil(),
    });
    chRef.current = ch;
    const leave = L.peers ? joinPeers(L.peers, ch) : undefined;
    return () => {
      ch.dispose();
      chRef.current = null;
      leave?.();
    };
  }, [svgRef]);

  useEffect(() => {
    const ch = chRef.current;
    if (!ch) return;
    // a data change during a one-shot waits for its end (returnTo picks it up then)
    if (ch.st === 'hello' || ch.st === 'done') return;
    if ((ch.st === 'box' || ch.st === 'invite') && ACTIVE.has(p.state)) {
      ch.setState('power'); // the activation landing; the new state applies at its end
      ch.setState(p.state);
    } else ch.setState(p.state);
  }, [p.state]);

  useEffect(() => {
    const ch = chRef.current;
    // data that drops the crown while Cover all fills lets the fill finish (it drops the crown at 480 ms)
    if (!ch || (!p.cover && ch.filling)) return;
    ch.setCover(p.cover);
  }, [p.cover]);

  // hover or keyboard focus on the cue; touch gets no preview (the page's cueBind). Re-bound after every render, so
  // a cue that mounts later is picked up on the avatar's next render.
  useEffect(() => {
    const el = latest.current.cueRef?.current;
    if (!el) return;
    let hv = false;
    let fc = false;
    const up = () => chRef.current?.cueHover(hv || fc);
    const enter = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      hv = true;
      up();
    };
    const leave = () => {
      hv = false;
      up();
    };
    const focusIn = () => {
      fc = true;
      up();
    };
    const focusOut = (e: FocusEvent) => {
      fc = el.contains(e.relatedTarget as Node | null);
      up();
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', focusIn);
    el.addEventListener('focusout', focusOut);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', focusIn);
      el.removeEventListener('focusout', focusOut);
    };
  });

  useImperativeHandle(
    handleRef,
    () => ({
      play(beat) {
        const ch = chRef.current;
        if (!ch) return;
        if (beat === 'hello') ch.greet();
        else ch.setState('done');
      },
      coverAll() {
        chRef.current?.coverAll();
      },
      cueHover(on) {
        chRef.current?.cueHover(on);
      },
    }),
    [],
  );
}
