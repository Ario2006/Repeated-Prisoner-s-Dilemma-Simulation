import { flip, payoff } from './payoffs';
import { makeRng } from './rng';
import { STRATEGIES } from './strategies';
import type { MatchOptions, MatchResult, Move, RoundRow, StrategyId } from './types';

export const DEFAULT_GENEROSITY = 0.1;

/**
 * Plays one match. Deterministic for a given seed.
 * Strategies only see executed history, never the number of rounds left.
 */
export function playMatch(a: StrategyId, b: StrategyId, opts: MatchOptions = {}): MatchResult {
  const {
    rounds = 200,
    randomLength = false,
    noise = 0,
    generosity = DEFAULT_GENEROSITY,
    maxRounds = 5000,
  } = opts;
  const rng = opts.rng ?? makeRng(opts.seed ?? 1);
  const A = STRATEGIES[a];
  const B = STRATEGIES[b];
  if (!A || !B) throw new Error(`Unknown strategy: ${!A ? a : b}`);

  const ha: Move[] = [];
  const hb: Move[] = [];
  const rows: RoundRow[] = [];
  let sa = 0;
  let sb = 0;

  for (let r = 0; r < maxRounds; r++) {
    if (!randomLength && r >= rounds) break;
    const ia = A.move({ round: r, my: ha, opp: hb, rng, generosity });
    const ib = B.move({ round: r, my: hb, opp: ha, rng, generosity });
    const na = noise > 0 && rng() < noise;
    const nb = noise > 0 && rng() < noise;
    const ea = na ? flip(ia) : ia;
    const eb = nb ? flip(ib) : ib;
    const [pa, pb] = payoff(ea, eb);
    sa += pa;
    sb += pb;
    ha.push(ea);
    hb.push(eb);
    rows.push({
      round: r,
      intended: [ia, ib],
      executed: [ea, eb],
      gain: [pa, pb],
      total: [sa, sb],
      noisy: [na, nb],
    });
    if (randomLength && rng() < 1 / rounds) break;
  }

  return { ids: [a, b], scoreA: sa, scoreB: sb, rounds: rows.length, rows };
}

/** Step a single round given histories (used for human play). */
export function nextMove(id: StrategyId, my: Move[], opp: Move[], rng: () => number, generosity = DEFAULT_GENEROSITY): Move {
  return STRATEGIES[id].move({ round: my.length, my, opp, rng, generosity });
}
