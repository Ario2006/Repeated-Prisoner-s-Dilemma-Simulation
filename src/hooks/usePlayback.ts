import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Turns a precomputed match into a timed sequence.
 * Each round runs deal → reveal → pay, then `cursor` (rounds completed) increments.
 * At 8× and above (or with reduced motion) rounds tick without the per-round theatre.
 */
export type Phase = 'idle' | 'deal' | 'reveal' | 'pay';
export const ROUND_MS = 1500;
export const FAST = 8;

export function usePlayback(total: number) {
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [playing, setPlaying] = useState(false);
  const [stepping, setStepping] = useState(false);
  const [speed, setSpeed] = useState(1);
  const reduced = useReducedMotion();
  const fast = speed >= FAST || reduced;

  useEffect(() => {
    const active = playing || stepping;
    if (!active) return;
    if (cursor >= total) {
      setPlaying(false);
      setStepping(false);
      setPhase('idle');
      return;
    }
    const d = ROUND_MS / speed;
    const finish = () => {
      setPhase('idle');
      setCursor(c => Math.min(total, c + 1));
      if (stepping) setStepping(false);
    };
    let t: number;
    if (fast) {
      // Batch several rounds per tick at very high speeds so 1000 rounds stay quick.
      const per = Math.max(1, Math.round(speed / 16));
      t = window.setTimeout(() => {
        setPhase('idle');
        setCursor(c => Math.min(total, c + (stepping ? 1 : per)));
        if (stepping) setStepping(false);
      }, Math.max(16, (ROUND_MS / Math.max(speed, FAST)) * (stepping ? 0 : 1)));
    } else if (phase === 'idle') t = window.setTimeout(() => setPhase('deal'), 0);
    else if (phase === 'deal') t = window.setTimeout(() => setPhase('reveal'), d * 0.32);
    else if (phase === 'reveal') t = window.setTimeout(() => setPhase('pay'), d * 0.22);
    else t = window.setTimeout(finish, d * 0.46);
    return () => window.clearTimeout(t);
  }, [playing, stepping, phase, cursor, speed, total, fast]);

  const play = useCallback(() => {
    setCursor(c => (c >= total ? 0 : c));
    setPlaying(true);
  }, [total]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const step = useCallback(() => {
    if (cursor >= total) return;
    setPlaying(false);
    setStepping(true);
  }, [cursor, total]);
  const reset = useCallback(() => {
    setPlaying(false);
    setStepping(false);
    setPhase('idle');
    setCursor(0);
  }, []);
  const finish = useCallback(() => {
    setPlaying(false);
    setStepping(false);
    setPhase('idle');
    setCursor(total);
  }, [total]);

  return { cursor, phase, playing, speed, setSpeed, play, pause, toggle, step, reset, finish, fast, done: cursor >= total };
}

export type Playback = ReturnType<typeof usePlayback>;
