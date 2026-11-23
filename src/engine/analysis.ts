import type { MatchResult, RoundRow } from './types';
import { nameOf, STRATEGIES } from './strategies';

export interface MatchStats {
  mutualC: number;
  mutualD: number;
  exploited: number;
  noiseEvents: number;
  longestEcho: { start: number; length: number };
}

/** An echo is a run of alternating one-sided defections: CD, DC, CD, … */
export function longestEcho(rows: RoundRow[]) {
  let best = { start: 0, length: 0 };
  let run = 0;
  let start = 0;
  rows.forEach((r, i) => {
    const k = r.executed.join('');
    const prev = i > 0 ? rows[i - 1].executed.join('') : '';
    const oneSided = k === 'CD' || k === 'DC';
    if (oneSided && run > 0 && prev !== k && (prev === 'CD' || prev === 'DC')) run++;
    else if (oneSided) {
      run = 1;
      start = i;
    } else run = 0;
    if (run > best.length) best = { start, length: run };
  });
  return best;
}

export function matchStats(m: MatchResult): MatchStats {
  let mutualC = 0;
  let mutualD = 0;
  let exploited = 0;
  let noiseEvents = 0;
  m.rows.forEach(r => {
    const k = r.executed.join('');
    if (k === 'CC') mutualC++;
    else if (k === 'DD') mutualD++;
    else exploited++;
    if (r.noisy[0] || r.noisy[1]) noiseEvents++;
  });
  return { mutualC, mutualD, exploited, noiseEvents, longestEcho: longestEcho(m.rows) };
}

/** Two to four plain-language observations about a finished match. */
export function matchInsights(m: MatchResult, labels?: [string, string]): string[] {
  const [na, nb] = labels ?? [nameOf(m.ids[0]), nameOf(m.ids[1])];
  const s = matchStats(m);
  const out: string[] = [];
  const pct = (n: number) => Math.round((n / Math.max(1, m.rounds)) * 100);

  if (s.longestEcho.length >= 4)
    out.push(
      `Echo effect: from round ${s.longestEcho.start + 1}, they traded one-sided punishments for ${s.longestEcho.length} rounds straight.`,
    );
  if (s.noiseEvents > 0)
    out.push(`${s.noiseEvents} move${s.noiseEvents > 1 ? 's were' : ' was'} flipped by noise. Neither player meant ${s.noiseEvents > 1 ? 'those' : 'that'}.`);
  if (pct(s.mutualC) >= 80) out.push(`They cooperated in ${pct(s.mutualC)}% of rounds and drew ${s.mutualC * 6} coins out of the banker together.`);
  if (pct(s.mutualD) >= 60) out.push(`Mutual defection in ${pct(s.mutualD)}% of rounds: both settle for 1 coin when 3 were on offer.`);

  const diff = m.scoreA - m.scoreB;
  const joint = m.scoreA + m.scoreB;
  const best = 6 * m.rounds;
  if (diff === 0) out.push(`A draw at ${m.scoreA} each. Together they earned ${Math.round((joint / best) * 100)}% of what full cooperation pays.`);
  else {
    const [w, l] = diff > 0 ? [na, nb] : [nb, na];
    out.push(
      `${w} beat ${l} by ${Math.abs(diff)}, but together they earned only ${Math.round((joint / best) * 100)}% of what full cooperation pays.`,
    );
  }
  return out.slice(0, 4);
}

/** Plain-language takeaways from a tournament. */
export function tournamentInsights(res: import('./types').TournamentResult): string[] {
  const out: string[] = [];
  const { ranking } = res;
  const n = ranking.length;
  const winner = ranking[0];
  const half = Math.ceil(n / 2);
  const niceTop = ranking.slice(0, half).filter(r => STRATEGIES[r.id].nice).length;
  out.push(`${nameOf(winner.id)} wins with ${winner.perRound.toFixed(2)} points per round, after beating ${winner.wins} of ${n - 1} opponents head-to-head.`);
  if (niceTop >= Math.ceil(half * 0.75)) out.push(`${niceTop} of the top ${half} are nice: never the first to defect.`);
  const mostWins = [...ranking].sort((a, b) => b.wins - a.wins)[0];
  const rank = ranking.indexOf(mostWins) + 1;
  if (mostWins.id !== winner.id && rank > 1)
    out.push(`${nameOf(mostWins.id)} won the most matches (${mostWins.wins}) yet finished ${rank} of ${n}. Beating opponents isn’t the same as scoring well.`);
  return out;
}
