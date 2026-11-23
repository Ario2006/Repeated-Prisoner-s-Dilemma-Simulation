import { playMatch } from './match';
import { makeRng } from './rng';
import { canonical } from './strategies';
import type { MatchOptions, Standing, StrategyId, TournamentResult } from './types';

export interface TournamentOptions extends MatchOptions {
  /** Axelrod replayed each tournament 5 times to wash out luck. */
  repeats?: number;
}

/** Draw a geometric game length with mean `mean` (ends after each round with prob 1/mean). */
export function drawLength(mean: number, rng: () => number, cap = 5000): number {
  let n = 1;
  while (n < cap && rng() >= 1 / mean) n++;
  return n;
}

/**
 * Round robin: every strategy meets every other and a copy of itself.
 * With randomLength, each replication draws one hidden length used for every pairing
 * (as in Axelrod's second tournament), so no one is advantaged by a lucky draw.
 */
export function roundRobin(input: StrategyId[], opts: TournamentOptions = {}): TournamentResult {
  // Canonical order makes the result independent of how the field was listed.
  const ids = canonical(input);
  const { repeats = 5, rounds = 200, randomLength = false } = opts;
  const rng = opts.rng ?? makeRng(opts.seed ?? 1);
  const pts: Record<string, Record<string, number>> = {};
  const turns: Record<string, Record<string, number>> = {};
  ids.forEach(i => {
    pts[i] = {};
    turns[i] = {};
    ids.forEach(j => {
      pts[i][j] = 0;
      turns[i][j] = 0;
    });
  });

  for (let rep = 0; rep < repeats; rep++) {
    const len = randomLength ? drawLength(rounds, rng) : rounds;
    for (let x = 0; x < ids.length; x++) {
      for (let y = x; y < ids.length; y++) {
        const m = playMatch(ids[x], ids[y], { ...opts, rounds: len, randomLength: false, rng });
        if (x === y) {
          // Self-play: credit the average of both seats so the matrix diagonal is one number.
          pts[ids[x]][ids[x]] += (m.scoreA + m.scoreB) / 2;
          turns[ids[x]][ids[x]] += m.rounds;
        } else {
          pts[ids[x]][ids[y]] += m.scoreA;
          pts[ids[y]][ids[x]] += m.scoreB;
          turns[ids[x]][ids[y]] += m.rounds;
          turns[ids[y]][ids[x]] += m.rounds;
        }
      }
    }
  }

  const avg: Record<string, Record<string, number>> = {};
  ids.forEach(i => {
    avg[i] = {};
    ids.forEach(j => (avg[i][j] = pts[i][j] / turns[i][j]));
  });

  const ranking: Standing[] = ids.map(i => {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    ids.forEach(j => {
      if (j === i) return;
      const d = pts[i][j] - pts[j][i];
      if (Math.abs(d) < 1e-9) draws++;
      else if (d > 0) wins++;
      else losses++;
    });
    const perRound = ids.reduce((s, j) => s + avg[i][j], 0) / ids.length;
    const total = ids.reduce((s, j) => s + pts[i][j], 0) / repeats;
    return { id: i, perRound, total, wins, losses, draws };
  });
  ranking.sort((p, q) => q.perRound - p.perRound);
  return { ids, avg, ranking };
}
