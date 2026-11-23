import type { Shares, StrategyId } from './types';

export const EXTINCT = 1e-4;

/**
 * Axelrod's ecological simulation (discrete replicator dynamics, no mutation):
 *   fitness_i = Σ_j share_j · avg[i][j]
 *   share_i'  = share_i · fitness_i / mean fitness
 * Shares under 0.01% are treated as extinct.
 */
export function evolve(
  ids: StrategyId[],
  avg: Record<string, Record<string, number>>,
  generations = 1000,
  initial?: Shares,
): Shares[] {
  let share: Shares = initial ? { ...initial } : Object.fromEntries(ids.map(i => [i, 1 / ids.length]));
  const history: Shares[] = [share];
  for (let g = 0; g < generations; g++) {
    const fit: Record<string, number> = {};
    ids.forEach(i => (fit[i] = ids.reduce((s, j) => s + share[j] * avg[i][j], 0)));
    const mean = ids.reduce((s, i) => s + share[i] * fit[i], 0);
    const next: Shares = {};
    ids.forEach(i => {
      const v = mean > 0 ? (share[i] * fit[i]) / mean : share[i];
      next[i] = v < EXTINCT ? 0 : v;
    });
    const z = ids.reduce((s, i) => s + next[i], 0) || 1;
    ids.forEach(i => (next[i] /= z));
    share = next;
    history.push(share);
  }
  return history;
}
