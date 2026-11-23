import { useEffect, useMemo } from 'react';
import { COLORS } from '../characters/cast';
import { matchInsights, matchStats, nameOf, playMatch, STRATEGIES, type MatchOptions, type StrategyId } from '../engine';
import { usePlayback } from '../hooks/usePlayback';
import { LineChart } from './charts/LineChart';
import { HistoryStrip } from './HistoryStrip';
import { MatchStage } from './MatchStage';
import { Transport } from './ui';
import s from './MatchPlayer.module.css';

export interface MatchPlayerProps {
  a: StrategyId;
  b: StrategyId;
  options: MatchOptions;
  /** Start playing as soon as it mounts (or the matchup changes). */
  autoplay?: boolean;
  initialSpeed?: number;
  showChart?: boolean;
  showInsights?: boolean;
  highlightEcho?: boolean;
  size?: number;
}

export function MatchPlayer({ a, b, options, autoplay, initialSpeed = 1, showChart = true, showInsights = true, highlightEcho, size }: MatchPlayerProps) {
  const match = useMemo(() => playMatch(a, b, options), [a, b, options]);
  const pb = usePlayback(match.rounds);
  const labels: [string, string] = a === b ? [nameOf(a), `${nameOf(b)} (twin)`] : [nameOf(a), nameOf(b)];
  // A twin shares an identity colour; give the second line ink so the two stay tellable apart.
  const colorB = a === b ? 'var(--ink-2)' : COLORS[b];

  useEffect(() => {
    pb.reset();
    pb.setSpeed(initialSpeed);
    if (autoplay) {
      const t = setTimeout(pb.play, 500);
      return () => clearTimeout(t);
    }
  }, [match]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = match.rows.slice(0, pb.cursor);
  const echo = highlightEcho ? matchStats({ ...match, rows: shown }).longestEcho : null;

  const series = useMemo(() => {
    const pts: [[number, number][], [number, number][]] = [[[0, 0]], [[0, 0]]];
    shown.forEach(r => {
      pts[0].push([r.round + 1, r.total[0]]);
      pts[1].push([r.round + 1, r.total[1]]);
    });
    return [
      { id: 'ref', label: 'If both always cooperated', color: 'var(--ink-3)', reference: true, points: [[0, 0], [match.rounds, 3 * match.rounds]] as [number, number][] },
      { id: 'a', label: labels[0], color: COLORS[a], points: pts[0] },
      { id: 'b', label: labels[1], color: colorB, points: pts[1] },
    ];
  }, [pb.cursor, match]); // eslint-disable-line react-hooks/exhaustive-deps

  const yMax = Math.max(3 * match.rounds, match.scoreA, match.scoreB);

  return (
    <div className={s.player}>
      <MatchStage
        a={a}
        b={b}
        labels={labels}
        rows={match.rows}
        cursor={pb.cursor}
        phase={pb.phase}
        fast={pb.fast}
        speed={pb.speed}
        intro={[quote(a), quote(b)]}
        size={size}
      />
      <Transport pb={pb} total={match.rounds} />
      <HistoryStrip
        rows={shown}
        total={match.rounds}
        labels={labels}
        colors={[COLORS[a], colorB]}
        highlight={echo && echo.length >= 4 ? echo : null}
      />
      {showChart && (
        <LineChart
          ariaLabel="Running score for each player"
          series={series}
          xDomain={[0, match.rounds]}
          yDomain={[0, yMax]}
          xLabel="Round"
          yLabel="Coins"
          height={170}
        />
      )}
      {showInsights && pb.done && (
        <ul className={s.insights} aria-live="polite">
          {matchInsights(match, labels).map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const quote = (id: StrategyId) => STRATEGIES[id].quote;
