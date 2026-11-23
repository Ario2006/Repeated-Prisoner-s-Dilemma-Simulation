import { useEffect, useMemo, useState } from 'react';
import { Character } from '../../characters/Character';
import { COLORS } from '../../characters/cast';
import { MatchPlayer } from '../../components/MatchPlayer';
import { TournamentBoard } from '../../components/Tournament';
import { useSize } from '../../hooks/useSize';
import { nameOf, ROUND_ONE, ROUND_TWO, roundRobin, STRATEGIES, type StrategyId, type TournamentResult, type Trait } from '../../engine';
import { SEEDS } from '../seeds';
import c from '../../components/charts/charts.module.css';
import f from './figures.module.css';

/* Shared, memoised tournament configs so every figure tells the same story. */
export const R1_OPTS = { seed: SEEDS.roundOne, rounds: 200, repeats: 5 };
export const R2_OPTS = { seed: SEEDS.roundTwo, rounds: 200, repeats: 5, randomLength: true };
let r1Cache: TournamentResult | null = null;
let r2Cache: TournamentResult | null = null;
export const roundOne = () => (r1Cache ??= roundRobin(ROUND_ONE, R1_OPTS));
export const roundTwo = () => (r2Cache ??= roundRobin(ROUND_TWO, R2_OPTS));

/* ───────────── watch a match ───────────── */

const OPP_CHOICES: StrategyId[] = ['always-defect', 'always-cooperate', 'joss', 'friedman', 'tit-for-two-tats', 'tester', 'random'];
const PRESETS: [StrategyId, StrategyId][] = [
  ['tit-for-tat', 'always-defect'],
  ['tit-for-tat', 'always-cooperate'],
  ['tit-for-tat', 'joss'],
];

export function WatchMatchFigure({ beat }: { beat: number }) {
  const [pair, setPair] = useState(PRESETS[0]);
  useEffect(() => setPair(PRESETS[Math.min(beat, PRESETS.length - 1)]), [beat]);
  const options = useMemo(() => ({ rounds: 30, seed: SEEDS.match }), []);
  return (
    <div className={f.fig}>
      <div className={f.row}>
        <span className={f.label}>Tit for Tat vs</span>
        <div className={f.chips}>
          {OPP_CHOICES.map(id => (
            <button key={id} className={`${f.chip} ${pair[1] === id ? f.chipOn : ''}`} onClick={() => setPair(['tit-for-tat', id])}>
              <Character id={id} size={26} idle={false} />
              {nameOf(id)}
            </button>
          ))}
        </div>
      </div>
      <MatchPlayer a={pair[0]} b={pair[1]} options={options} autoplay initialSpeed={2} size={130} />
    </div>
  );
}

/* ───────────── the tournament ───────────── */

/** Beat 0–1: live leaderboard. Beat 2: slopegraph. Beat 3: the four qualities. */
export function TournamentFigure({ beat }: { beat: number }) {
  if (beat >= 3) return <QualitiesFigure beat={0} round="two" />;
  if (beat >= 2) return <WinsScatter result={roundTwo()} />;
  return <TournamentBoard ids={ROUND_TWO} options={R2_OPTS} focus={beat >= 1 ? 'tit-for-tat' : undefined} showHeatmap={false} />;
}

/**
 * Slopegraph: rank by head-to-head wins (left) vs final tournament rank (right).
 * The bully tops the left column and sinks on the right; Tit for Tat does the opposite.
 */
export function WinsScatter({ result }: { result: TournamentResult }) {
  const [ref, { width }] = useSize<HTMLDivElement>();
  const n = result.ranking.length;
  const ROW = 44;
  const H = n * ROW + 40;
  const byWins = [...result.ranking].sort((a, b) => b.wins - a.wins || a.perRound - b.perRound);
  const leftY = new Map(byWins.map((r, i) => [r.id, 40 + i * ROW + ROW / 2]));
  const rightY = new Map(result.ranking.map((r, i) => [r.id, 40 + i * ROW + ROW / 2]));
  const colW = Math.min(230, Math.max(150, width * 0.32));
  const x1 = colW;
  const x2 = Math.max(x1 + 80, width - colW);
  const loud = new Set<StrategyId>(['always-defect', 'tit-for-tat']);
  return (
    <figure className={f.fig}>
      <div ref={ref} className={f.slope} style={{ height: H }}>
        {width > 0 && (
          <svg width={width} height={H} role="img" aria-label="Rank by matches won versus final tournament rank">
            <text x={x1} y={16} textAnchor="end" className={c.axisLabel}>
              Ranked by matches won
            </text>
            <text x={x2} y={16} className={c.axisLabel}>
              Ranked by final score
            </text>
            {result.ranking.map(r => (
              <line
                key={r.id}
                x1={x1 + 6}
                x2={x2 - 6}
                y1={leftY.get(r.id)}
                y2={rightY.get(r.id)}
                stroke={COLORS[r.id]}
                strokeWidth={loud.has(r.id) ? 3.5 : 2}
                opacity={loud.has(r.id) ? 1 : 0.3}
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}
        {width > 0 &&
          byWins.map(r => (
            <div key={`l${r.id}`} className={`${f.slopeItem} ${f.slopeLeft} ${loud.has(r.id) ? '' : f.slopeQuiet}`} style={{ top: leftY.get(r.id), width: x1 }}>
              <b>{r.wins}</b> {nameOf(r.id)} <Character id={r.id} size={30} idle={false} />
            </div>
          ))}
        {width > 0 &&
          result.ranking.map((r, i) => (
            <div key={`r${r.id}`} className={`${f.slopeItem} ${loud.has(r.id) ? '' : f.slopeQuiet}`} style={{ top: rightY.get(r.id), left: x2 }}>
              <Character id={r.id} size={30} idle={false} /> {ordinalShort(i + 1)} {nameOf(r.id)} <b>{r.perRound.toFixed(2)}</b>
            </div>
          ))}
      </div>
      <figcaption className={f.caption}>
        Left: how many opponents each strategy beat head-to-head. Right: its place in the tournament. Same tournament as before.
      </figcaption>
    </figure>
  );
}

const ordinalShort = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

/* ───────────── the four qualities ───────────── */

const TRAITS: { key: keyof (typeof STRATEGIES)['tit-for-tat']['traits']; label: string }[] = [
  { key: 'nice', label: 'Nice' },
  { key: 'forgiving', label: 'Forgiving' },
  { key: 'retaliatory', label: 'Retaliatory' },
  { key: 'clear', label: 'Clear' },
];

function TraitMark({ v }: { v: Trait }) {
  return <span className={f[v]} aria-label={v}>{v === 'yes' ? '✓' : v === 'no' ? '–' : '~'}</span>;
}

export function QualitiesFigure({ beat, round = 'one' }: { beat: number; round?: 'one' | 'two' }) {
  const res = round === 'one' ? roundOne() : roundTwo();
  const hot = beat >= 1 && beat <= 4 ? TRAITS[beat - 1].key : null;
  return (
    <figure className={f.fig}>
      <table className={f.table}>
        <thead>
          <tr>
            <th className={f.num}>#</th>
            <th>Strategy</th>
            {TRAITS.map(t => (
              <th key={t.key} className={hot === t.key ? f.colOn : undefined}>
                {t.label}
              </th>
            ))}
            <th className={f.num}>Score</th>
          </tr>
        </thead>
        <tbody>
          {res.ranking.map((r, i) => (
            <tr key={r.id}>
              <td className={f.num}>{i + 1}</td>
              <td>
                <span className={f.who}>
                  <Character id={r.id} size={28} idle={false} /> {nameOf(r.id)}
                </span>
              </td>
              {TRAITS.map(t => (
                <td key={t.key} className={hot === t.key ? f.colOn : undefined}>
                  <TraitMark v={STRATEGIES[r.id].traits[t.key]} />
                </td>
              ))}
              <td className={f.num}>{r.perRound.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className={f.caption}>
        ✓ has the quality, ~ partly, – lacks it. Ranked by the tournament on this slide. Qualities from Axelrod (1984).
      </figcaption>
    </figure>
  );
}

