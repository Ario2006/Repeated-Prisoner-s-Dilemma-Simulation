import { useEffect, useRef, useState } from 'react';
import { sound } from '../audio/sound';
import { Character, type Reaction } from '../characters/Character';
import { COLORS, DEFAULT_MOOD, moodForGain, type CastId, type Mood } from '../characters/cast';
import type { Move, RoundRow } from '../engine';
import { ROUND_MS, type Phase } from '../hooks/usePlayback';
import { PayoffMatrix, type Cell } from './PayoffMatrix';
import s from './MatchStage.module.css';

export interface MatchStageProps {
  a: CastId;
  b: CastId;
  labels: [string, string];
  rows: RoundRow[];
  cursor: number;
  phase: Phase;
  fast: boolean;
  speed: number;
  /** Lines each character says before the first round. */
  intro?: [string, string];
  showMatrix?: boolean;
  size?: number;
}

const REACT: Record<number, Reaction> = { 0: 'hurt', 1: 'angry', 3: 'cheer', 5: 'smug' };
const COIN_SVG =
  '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#e3a21a" stroke="#18202e" stroke-width="2"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#18202e" stroke-width="1.4" opacity=".55"/></svg>';

export function MatchStage({ a, b, labels, rows, cursor, phase, fast, speed, intro, showMatrix = true, size = 150 }: MatchStageProps) {
  const stage = useRef<HTMLDivElement>(null);
  const bank = useRef<HTMLDivElement>(null);
  const scoreEls = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [reactions, setReactions] = useState<[{ type: Reaction; key: number } | null, { type: Reaction; key: number } | null]>([null, null]);
  const live = phase !== 'idle' ? rows[cursor] : undefined;
  const last = rows[cursor - 1];
  const shown = live ?? last;
  const revealed = live ? phase === 'reveal' || phase === 'pay' : !!last;
  const totals = last?.total ?? [0, 0];
  const roundMs = ROUND_MS / speed;

  /* sounds + reactions per phase */
  useEffect(() => {
    if (fast || !live) return;
    if (phase === 'deal') sound.flip();
    if (phase === 'reveal') {
      sound.reveal(live.executed[0], live.executed[1]);
      if (live.noisy[0] || live.noisy[1]) {
        sound.glitch();
        setReactions(r => [live.noisy[0] ? { type: 'oops', key: cursor * 2 } : r[0], live.noisy[1] ? { type: 'oops', key: cursor * 2 + 1 } : r[1]]);
      }
    }
    if (phase === 'pay') {
      sound.coins(live.gain[0], 0);
      sound.coins(live.gain[1], 1);
      setReactions([
        { type: REACT[live.gain[0]], key: cursor * 2 + 10000 },
        { type: REACT[live.gain[1]], key: cursor * 2 + 10001 },
      ]);
      flyCoins(live.gain);
    }
  }, [phase, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  /* a soft tick when racing */
  useEffect(() => {
    if (fast && cursor > 0 && speed <= 16) sound.click();
  }, [cursor, fast, speed]);

  function flyCoins(gain: [number, number]) {
    const root = stage.current;
    const from = bank.current;
    if (!root || !from) return;
    const R = root.getBoundingClientRect();
    const f = from.getBoundingClientRect();
    const fx = f.left + f.width / 2 - R.left - 12;
    const fy = f.top + f.height / 2 - R.top - 12;
    const dur = Math.max(260, Math.min(720, roundMs * 0.4));
    gain.forEach((n, side) => {
      const to = scoreEls[side].current?.getBoundingClientRect();
      if (!to) return;
      const tx = to.left + to.width / 2 - R.left - 12;
      const ty = to.top + to.height / 2 - R.top - 12;
      for (let i = 0; i < n; i++) {
        const el = document.createElement('div');
        el.className = s.coin;
        el.innerHTML = COIN_SVG;
        root.appendChild(el);
        const cx = (fx + tx) / 2 + (side ? 30 : -30);
        const cy = Math.min(fy, ty) - 90 - i * 6;
        const frames: Keyframe[] = [];
        for (let k = 0; k <= 12; k++) {
          const t = k / 12;
          const x = (1 - t) ** 2 * fx + 2 * (1 - t) * t * cx + t * t * tx;
          const y = (1 - t) ** 2 * fy + 2 * (1 - t) * t * cy + t * t * ty;
          frames.push({ transform: `translate(${x}px, ${y}px) rotate(${t * 360 * (side ? -1 : 1)}deg) scale(${1 - t * 0.25})`, opacity: k === 12 ? 0.2 : 1 });
        }
        el.animate(frames, { duration: dur, delay: i * Math.min(70, roundMs * 0.04), easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'both' }).onfinish = () => el.remove();
      }
    });
  }

  const mood = (side: 0 | 1, id: CastId): Mood => {
    if (!shown || (live && phase === 'deal')) return DEFAULT_MOOD[id];
    if (live && phase === 'reveal') return live.noisy[side] ? 'oops' : DEFAULT_MOOD[id];
    return moodForGain(shown.gain[side]);
  };

  const cell = shown && revealed ? (`${shown.executed[0]}${shown.executed[1]}` as Cell) : null;
  const ids: [CastId, CastId] = [a, b];
  const showIntro = intro && cursor === 0 && phase === 'idle';

  return (
    <div ref={stage} className={s.stage}>
      {ids.map((id, side) => (
        <div key={side} className={`${s.player} ${side ? s.right : s.left}`}>
          <div className={s.bubbleSlot}>
            {showIntro && <p className={s.bubble}>{intro![side]}</p>}
            {live && revealed && live.noisy[side] && (
              <p className={`${s.bubble} ${s.oops}`} key={cursor}>
                Oops! I meant to {live.intended[side] === 'C' ? 'cooperate' : 'defect'}.
              </p>
            )}
          </div>
          <div className={s.figure}>
            <Character
              id={id}
              size={size}
              mood={mood(side as 0 | 1, id)}
              facing={side ? 'left' : 'right'}
              reaction={reactions[side]}
            />
            {shown && (
              <Card
                key={live ? `live${cursor}` : 'last'}
                move={shown.executed[side]}
                revealed={revealed}
                animate={!!live && !fast}
                side={side as 0 | 1}
                noisy={revealed && shown.noisy[side]}
              />
            )}
          </div>
          <div className={s.name}>
            <i style={{ background: COLORS[id] }} />
            {labels[side]}
          </div>
          <div ref={scoreEls[side]} className={s.score}>
            {totals[side]}
            {live && phase === 'pay' && !fast && (
              <span key={cursor} className={s.pop}>
                +{live.gain[side]}
              </span>
            )}
          </div>
        </div>
      ))}

      <div className={s.center}>
        <div ref={bank} className={s.bank}>
          <Character id="banker" size={Math.round(size * 0.52)} mood={cell === 'CC' ? 'happy' : cell === 'DD' ? 'stern' : 'neutral'} />
        </div>
        {showMatrix && (
          <PayoffMatrix compact a={{ label: labels[0], color: COLORS[a] }} b={{ label: labels[1], color: COLORS[b] }} active={cell} />
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {!fast && live && phase === 'pay'
          ? `Round ${cursor + 1}: ${labels[0]} ${verb(live.executed[0])}, ${labels[1]} ${verb(live.executed[1])}. ${labels[0]} +${live.gain[0]}, ${labels[1]} +${live.gain[1]}.`
          : ''}
      </p>
    </div>
  );
}

const verb = (m: Move) => (m === 'C' ? 'cooperated' : 'defected');

function Card({ move, revealed, animate, side, noisy }: { move: Move; revealed: boolean; animate: boolean; side: 0 | 1; noisy: boolean }) {
  return (
    <div className={`${s.card} ${side ? s.cardR : s.cardL} ${animate ? s.dealt : ''}`}>
      <div className={`${s.cardInner} ${revealed ? s.flipped : ''}`}>
        <div className={s.back} />
        <div className={`${s.front} ${move === 'D' ? s.frontD : ''} ${noisy ? s.frontNoisy : ''}`}>
          <span className={s.cardStone} />
          <span>{move === 'C' ? 'Cooperate' : 'Defect'}</span>
        </div>
      </div>
    </div>
  );
}
