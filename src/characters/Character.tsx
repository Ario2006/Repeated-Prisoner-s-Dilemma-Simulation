import { memo, useEffect, useId, useRef } from 'react';
import { BOB, COLORS, DEFAULT_MOOD, type CastId, type Mood } from './cast';
import styles from './Character.module.css';

const INK = '#18202e';
const SW = 3.2; // outline weight in viewBox units

export type Reaction = 'cheer' | 'hurt' | 'smug' | 'oops' | 'angry';

export interface CharacterProps {
  id: CastId;
  mood?: Mood;
  /** Width in px. Height follows the 100×112 artboard. */
  size?: number;
  /** Which way the eyes look. */
  facing?: 'left' | 'right' | 'front';
  idle?: boolean;
  /** Change the key to replay a reaction. */
  reaction?: { type: Reaction; key: number } | null;
  dim?: boolean;
  title?: string;
  className?: string;
}

/* ───────────── bodies ───────────── */

const poly = (pts: [number, number][]) => 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L') + ' Z';

const burst = (() => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? 34 : 44;
    pts.push([50 + Math.cos(a) * r, 57 + Math.sin(a) * r]);
  }
  return poly(pts);
})();

const hexagon = poly([
  [91, 57], [70.5, 21.5], [29.5, 21.5], [9, 57], [29.5, 92.5], [70.5, 92.5],
]);

const diamond = poly([[50, 12], [93, 56], [50, 100], [7, 56]]);
const bell = 'M50 16 C31 16 25 32 25 50 L24 72 C24 81 14 83 11 93 L89 93 C86 83 76 81 76 72 L75 50 C75 32 69 16 50 16 Z';
const CLOUD: [number, number, number][] = [
  [29, 62, 20], [50, 44, 25], [72, 60, 21], [50, 74, 25], [26, 80, 14], [75, 80, 14],
];

function Body({ id, fill }: { id: CastId; fill: string }) {
  const common = { fill, stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'always-defect':
      return <path d={burst} {...common} />;
    case 'always-cooperate':
      return <rect x={11} y={19} width={78} height={76} rx={32} {...common} />;
    case 'friedman':
      return <rect x={14} y={18} width={72} height={76} rx={7} {...common} />;
    case 'joss':
      return <path d={diamond} {...common} />;
    case 'tester':
      return <path d={hexagon} {...common} />;
    case 'random':
      return <rect x={12} y={18} width={76} height={76} rx={16} {...common} />;
    case 'pavlov':
      return (
        <g>
          <circle cx={50} cy={11} r={5} {...common} />
          <circle cx={50} cy={97} r={6} {...common} fill={INK} />
          <path d={bell} {...common} />
        </g>
      );
    case 'tit-for-two-tats':
      // Outline the union: strokes underneath, fills on top.
      return (
        <g>
          {CLOUD.map(([x, y, r], i) => (
            <circle key={`s${i}`} cx={x} cy={y} r={r} fill="none" stroke={INK} strokeWidth={SW * 2} />
          ))}
          {CLOUD.map(([x, y, r], i) => (
            <circle key={`f${i}`} cx={x} cy={y} r={r} fill={fill} />
          ))}
        </g>
      );
    case 'you':
      return <circle cx={50} cy={57} r={38} {...common} strokeDasharray="7 6" />;
    default:
      return <circle cx={50} cy={57} r={38} {...common} />;
  }
}

/* ───────────── accessories ───────────── */

function Front({ id }: { id: CastId }) {
  const s = { stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (id) {
    case 'tit-for-tat': // mirror arrows: "I do what you did"
      return (
        <g>
          <circle cx={50} cy={83} r={8} fill="#fff" stroke={INK} strokeWidth={2.4} />
          <path d="M45.5 80.5 H54.5 M51.5 78 L54.5 80.5 L51.5 83 M54.5 85.5 H45.5 M48.5 83 L45.5 85.5 L48.5 88" {...s} strokeWidth={1.8} />
        </g>
      );
    case 'generous-tit-for-tat':
      return (
        <path
          d="M50 91 C41 85 42 77 46.5 77 C48.5 77 50 78.5 50 80.5 C50 78.5 51.5 77 53.5 77 C58 77 59 85 50 91 Z"
          fill="#fff"
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      );
    case 'friedman': // a tally of grudges
      return <path d="M38 76 V88 M43 76 V88 M48 76 V88 M53 76 V88 M35 86 L57 78" {...s} strokeWidth={2.2} />;
    case 'always-cooperate':
      return (
        <g>
          <ellipse cx={28} cy={64} rx={6} ry={3.5} fill="#c9457a" opacity={0.45} />
          <ellipse cx={72} cy={64} rx={6} ry={3.5} fill="#c9457a" opacity={0.45} />
          <rect x={62} y={78} width={16} height={7} rx={2} fill="#fbead3" stroke={INK} strokeWidth={1.8} transform="rotate(-18 70 81)" />
        </g>
      );
    case 'random':
      return (
        <g fill="#fff" stroke={INK} strokeWidth={1.6}>
          <circle cx={24} cy={30} r={3.6} />
          <circle cx={76} cy={30} r={3.6} />
          <circle cx={24} cy={82} r={3.6} />
          <circle cx={76} cy={82} r={3.6} />
        </g>
      );
    case 'tester': // magnifying glass
      return (
        <g>
          <path d="M84 84 L95 97" stroke={INK} strokeWidth={5} strokeLinecap="round" />
          <circle cx={80} cy={78} r={9} fill="#dff1ff" fillOpacity={0.85} stroke={INK} strokeWidth={2.6} />
        </g>
      );
    case 'banker':
      return (
        <g>
          <circle cx={50} cy={57} r={31} fill="none" stroke={INK} strokeWidth={1.6} opacity={0.35} />
          <path d="M28 18 L32 -8 L68 -8 L72 18 Z" fill={INK} />
          <rect x={20} y={15} width={60} height={6} rx={3} fill={INK} />
          <rect x={31} y={10} width={38} height={4} fill="#e3a21a" />
        </g>
      );
    case 'mystery':
      return (
        <text x={50} y={92} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK} fontFamily="Bricolage Grotesque, sans-serif">
          ?
        </text>
      );
    default:
      return null;
  }
}

function Behind({ id }: { id: CastId }) {
  if (id === 'joss')
    return (
      <g transform="rotate(16 86 72)">
        <rect x={78} y={58} width={18} height={25} rx={3} fill={INK} stroke={INK} strokeWidth={2} />
        <circle cx={87} cy={70.5} r={5} fill="#fff" />
      </g>
    );
  if (id === 'tit-for-two-tats')
    return <ellipse className={styles.halo} cx={50} cy={10} rx={18} ry={4.5} fill="none" stroke="#e3a21a" strokeWidth={3.4} />;
  return null;
}

/* ───────────── faces ───────────── */

const FACE_Y: Partial<Record<CastId, number>> = {
  pavlov: 54, 'tit-for-two-tats': 58, joss: 53, tester: 53, 'always-defect': 56, friedman: 49, random: 52, 'always-cooperate': 52, banker: 50,
};

function Eye({ x, mood, side }: { x: number; mood: Mood; side: -1 | 1 }) {
  const line = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round' as const, fill: 'none' };
  if (mood === 'happy') return <path d={`M${x - 4.5} 1.5 Q${x} -5 ${x + 4.5} 1.5`} {...line} />;
  if (mood === 'serene') return <path d={`M${x - 4.5} -1 Q${x} 4 ${x + 4.5} -1`} {...line} />;
  if (mood === 'wink' && side === 1) return <path d={`M${x - 4.5} 0 Q${x} -4 ${x + 4.5} 0`} {...line} />;
  if (mood === 'oops')
    return (
      <g>
        <circle cx={x} cy={0} r={5} fill={INK} />
        <circle cx={x - 1.6} cy={-1.8} r={1.5} fill="#fff" />
      </g>
    );
  if (mood === 'smug' || mood === 'wink')
    return (
      <g>
        <ellipse cx={x} cy={1} rx={3.4} ry={3} fill={INK} />
        <path d={`M${x - 5} -1.6 H${x + 5}`} {...line} strokeWidth={2.6} />
      </g>
    );
  return <ellipse cx={x} cy={0} rx={3.3} ry={4.5} fill={INK} />;
}

const BROWS: Partial<Record<Mood, string>> = {
  hurt: 'M-17 -7 L-8 -11 M8 -11 L17 -7',
  angry: 'M-17 -12 L-7 -7 M7 -7 L17 -12',
  stern: 'M-17 -9 L-6 -7 M6 -7 L17 -9',
};

const MOUTH: Record<Mood, { d: string; fill?: boolean }> = {
  neutral: { d: 'M-7 13 Q0 17 7 13' },
  happy: { d: 'M-10 10 Q0 23 10 10 Z', fill: true },
  serene: { d: 'M-6 12 Q0 17 6 12' },
  smug: { d: 'M-8 15 Q3 17 10 9' },
  wink: { d: 'M-8 14 Q3 18 10 10' },
  hurt: { d: 'M-8 17 Q0 10 8 17' },
  angry: { d: 'M-8 16 Q0 12 8 16' },
  stern: { d: 'M-8 15 H8' },
  oops: { d: 'M0 10.5 a3.6 3.6 0 1 0 0.01 0 Z', fill: true },
};

function Face({ id, mood, facing }: { id: CastId; mood: Mood; facing: 'left' | 'right' | 'front' }) {
  const look = facing === 'left' ? -2.2 : facing === 'right' ? 2.2 : 0;
  const m = MOUTH[mood];
  const brow = BROWS[mood];
  return (
    <g transform={`translate(${50 + look} ${FACE_Y[id] ?? 47})`}>
      <g key={mood} className={styles.face}>
        <g className={styles.blink}>
          <Eye x={-12} mood={mood} side={-1} />
          <Eye x={12} mood={mood} side={1} />
        </g>
        {brow && <path d={brow} stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />}
        <path
          d={m.d}
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={m.fill ? INK : 'none'}
        />
      </g>
      {id === 'banker' && <circle cx={12} cy={0} r={8} fill="none" stroke={INK} strokeWidth={2} />}
    </g>
  );
}

/* ───────────── component ───────────── */

const REACTIONS: Record<Reaction, Keyframe[]> = {
  cheer: [{ transform: 'translateY(0)' }, { transform: 'translateY(-14%) scale(1.04)' }, { transform: 'translateY(0)' }],
  hurt: [
    { transform: 'translateX(0)' }, { transform: 'translateX(-5%)' }, { transform: 'translateX(4%)' },
    { transform: 'translateX(-3%)' }, { transform: 'translateX(0)' },
  ],
  smug: [{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(0)' }],
  oops: [{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(0)' }],
  angry: [{ transform: 'scale(1)' }, { transform: 'scale(1.06, 0.94)' }, { transform: 'scale(1)' }],
};

export const Character = memo(function Character({
  id,
  mood,
  size = 120,
  facing = 'front',
  idle = true,
  reaction,
  dim,
  title,
  className,
}: CharacterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId();
  const m = mood ?? DEFAULT_MOOD[id];

  useEffect(() => {
    if (!reaction || !ref.current) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    ref.current.animate(REACTIONS[reaction.type], { duration: reaction.type === 'smug' ? 700 : 420, easing: 'ease-out' });
  }, [reaction?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={ref}
      className={`${styles.root} ${dim ? styles.dim : ''} ${className ?? ''}`}
      style={{ width: size, height: size * 1.12 }}
    >
      <svg viewBox="0 -10 100 122" role="img" aria-labelledby={title ? uid : undefined} aria-hidden={title ? undefined : true}>
        {title && <title id={uid}>{title}</title>}
        <ellipse cx={50} cy={108} rx={30} ry={3.4} fill={INK} opacity={0.12} />
        <g
          className={idle ? styles.bob : undefined}
          style={{ animationDuration: `${BOB[id]}s`, animationDelay: `${-(id.length % 7) * 0.31}s` }}
        >
          <g fill={INK}>
            <ellipse cx={37} cy={103} rx={8} ry={4.4} />
            <ellipse cx={63} cy={103} rx={8} ry={4.4} />
          </g>
          <Behind id={id} />
          <Body id={id} fill={COLORS[id]} />
          <Front id={id} />
          <Face id={id} mood={m} facing={facing} />
        </g>
      </svg>
    </div>
  );
});
