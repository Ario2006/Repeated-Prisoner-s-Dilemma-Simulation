import { useEffect, useMemo, useState } from 'react';
import { sound } from '../audio/sound';
import { Character } from '../characters/Character';
import { COLORS } from '../characters/cast';
import { canonical, nameOf, roundRobin, STRATEGIES, type StrategyId, type TournamentOptions, type TournamentResult } from '../engine';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { textOn } from './charts/scale';
import { Button, Svg } from './ui';
import s from './Tournament.module.css';

/** Sequential blue ramp (light → dark) for points per round, 0–5. */
const RAMP = ['#e3eefc', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'];
const rampColor = (v: number) => RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.round((v / 5) * (RAMP.length - 1))))];

interface Partial {
  id: StrategyId;
  perRound: number;
  wins: number;
  losses: number;
  draws: number;
  played: number;
}

/** Standings using only the first `k` pairings: lets the board animate as matches finish. */
function partialStandings(res: TournamentResult, pairs: [StrategyId, StrategyId][], k: number): Partial[] {
  const sum: Record<string, number> = {};
  const n: Record<string, number> = {};
  const rec: Record<string, [number, number, number]> = {};
  res.ids.forEach(i => {
    sum[i] = 0;
    n[i] = 0;
    rec[i] = [0, 0, 0];
  });
  pairs.slice(0, k).forEach(([x, y]) => {
    sum[x] += res.avg[x][y];
    n[x]++;
    if (x !== y) {
      sum[y] += res.avg[y][x];
      n[y]++;
      const d = res.avg[x][y] - res.avg[y][x];
      if (Math.abs(d) < 1e-9) {
        rec[x][2]++;
        rec[y][2]++;
      } else if (d > 0) {
        rec[x][0]++;
        rec[y][1]++;
      } else {
        rec[x][1]++;
        rec[y][0]++;
      }
    }
  });
  return res.ids
    .map(id => ({ id, perRound: n[id] ? sum[id] / n[id] : 0, wins: rec[id][0], losses: rec[id][1], draws: rec[id][2], played: n[id] }))
    .sort((p, q) => q.perRound - p.perRound || res.ids.indexOf(p.id) - res.ids.indexOf(q.id));
}

export function useTournament(ids: StrategyId[], options: TournamentOptions) {
  const field = useMemo(() => canonical(ids), [ids]);
  const result = useMemo(() => (field.length >= 2 ? roundRobin(field, options) : null), [field, options]);
  const pairs = useMemo(() => {
    const p: [StrategyId, StrategyId][] = [];
    field.forEach((x, i) => field.slice(i).forEach(y => p.push([x, y])));
    return p;
  }, [field]);
  return { field, result, pairs };
}

export function TournamentBoard({
  ids,
  options,
  autorun = true,
  showHeatmap = true,
  focus,
}: {
  ids: StrategyId[];
  options: TournamentOptions;
  autorun?: boolean;
  showHeatmap?: boolean;
  /** Highlight a strategy's row (e.g. Tit for Tat). */
  focus?: StrategyId;
}) {
  const { result, pairs } = useTournament(ids, options);
  const reduced = useReducedMotion();
  const [k, setK] = useState(0);
  const [running, setRunning] = useState(false);

  const run = () => {
    setK(0);
    setRunning(true);
  };

  useEffect(() => {
    if (!result) return;
    if (autorun) run();
    else setK(pairs.length);
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running) return;
    if (reduced) {
      setK(pairs.length);
      setRunning(false);
      return;
    }
    if (k >= pairs.length) {
      setRunning(false);
      sound.win();
      return;
    }
    const t = setTimeout(() => {
      setK(v => v + 1);
      sound.coin(0, 0.8 + (k / pairs.length) * 0.6);
    }, Math.max(45, 2600 / pairs.length));
    return () => clearTimeout(t);
  }, [running, k, pairs.length, reduced]);

  if (!result) return <p className={s.empty}>Pick at least two strategies to hold a tournament.</p>;

  const standings = partialStandings(result, pairs, k);
  const done = k >= pairs.length;
  const max = 5;
  const ROW = 46;
  const order = new Map(standings.map((st, i) => [st.id, i]));
  const revealed = new Set(pairs.slice(0, k).map(([x, y]) => `${x}|${y}`));
  const shownCell = (x: string, y: string) => revealed.has(`${x}|${y}`) || revealed.has(`${y}|${x}`);
  const heatOrder = done ? result.ranking.map(r => r.id) : result.ids;

  return (
    <div className={s.wrap}>
      <div className={s.board}>
        <div className={s.boardHead}>
          <span>Points per round, averaged over every opponent</span>
          <span title="Head-to-head record: wins, losses, draws">W · L · D</span>
        </div>
        <ol className={s.rows} style={{ height: standings.length * ROW }} aria-label="Leaderboard">
          {result.ids.map(id => {
            const st = standings.find(q => q.id === id)!;
            const rank = order.get(id)!;
            const isWinner = done && rank === 0;
            return (
              <li
                key={id}
                className={`${s.row} ${focus === id ? s.focus : ''}`}
                style={{ transform: `translateY(${rank * ROW}px)`, height: ROW }}
                aria-label={`${rank + 1}. ${nameOf(id)}: ${st.perRound.toFixed(2)} points per round, ${st.wins} wins`}
              >
                <span className={s.rank}>{rank + 1}</span>
                <Character id={id} size={34} idle={false} mood={isWinner ? 'happy' : undefined} />
                <span className={s.name}>
                  {nameOf(id)}
                  {!STRATEGIES[id].nice && <em className={s.nasty}>nasty</em>}
                </span>
                <span className={s.barTrack}>
                  <span className={s.bar} style={{ width: `${(st.perRound / max) * 100}%`, background: COLORS[id] }} />
                </span>
                <span className={s.value}>{st.played ? st.perRound.toFixed(2) : '–'}</span>
                <span className={s.record}>
                  {st.wins} · {st.losses} · {st.draws}
                </span>
                {isWinner && (
                  <svg className={s.trophy} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <path d="M7 3h10v5a5 5 0 0 1-10 0z M7 5H4a3 3 0 0 0 3 4 M17 5h3a3 3 0 0 1-3 4 M12 13v4 M8 21h8 M9 17h6v4H9z" fill="#e3a21a" stroke="#18202e" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ol>
        <div className={s.boardFoot}>
          <span>
            {done ? `${pairs.length} pairings × ${options.repeats ?? 5} replays` : `Playing pairing ${k + 1} of ${pairs.length}…`}
          </span>
          <Button variant="quiet" onClick={run} disabled={running}>
            <Svg name="reset" /> Replay
          </Button>
        </div>
      </div>

      {showHeatmap && (
        <div className={s.heat}>
          <div className={s.heatHead}>Row’s points per round against column</div>
          <div className={s.heatGrid} style={{ gridTemplateColumns: `auto repeat(${heatOrder.length}, minmax(30px, 1fr))` }} role="table">
            <span />
            {heatOrder.map(c => (
              <span key={`c${c}`} className={s.heatCol} title={nameOf(c)}>
                <Character id={c} size={24} idle={false} />
              </span>
            ))}
            {heatOrder.map(r => (
              <div key={`r${r}`} className={s.heatRow} role="row">
                <span className={s.heatRowHead}>{nameOf(r)}</span>
                {heatOrder.map(c => {
                  const v = result.avg[r][c];
                  const on = shownCell(r, c);
                  const bg = rampColor(v);
                  return (
                    <span
                      key={c}
                      className={s.heatCell}
                      role="cell"
                      style={on ? { background: bg, color: textOn(bg) } : undefined}
                      title={`${nameOf(r)} vs ${nameOf(c)}: ${v.toFixed(2)} points per round`}
                    >
                      {on ? v.toFixed(1) : ''}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <div className={s.ramp}>
            <span>0</span>
            <span className={s.rampBar} style={{ background: `linear-gradient(to right, ${RAMP.join(',')})` }} />
            <span>5 points</span>
          </div>
        </div>
      )}
    </div>
  );
}
