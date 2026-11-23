import { playMatch } from './match';
import { makeRng } from './rng';
import type { StrategyId } from './types';

/**
 * Spatial game in the spirit of Nowak & May (1992): a torus of cells, each playing a
 * short repeated game with its 8 neighbours, then copying the best scorer around it
 * (itself included). Synchronous, deterministic.
 */
export interface Grid {
  size: number;
  cells: StrategyId[];
}

export interface SpatialStep {
  grid: Grid;
  scores: number[];
}

/** Expected points per encounter: table[i][j] = what i earns against j. */
export function encounterTable(ids: StrategyId[], rounds: number, samples = 8, seed = 7) {
  const rng = makeRng(seed);
  const table: Record<string, Record<string, number>> = {};
  ids.forEach(i => (table[i] = {}));
  ids.forEach(i =>
    ids.forEach(j => {
      let s = 0;
      for (let k = 0; k < samples; k++) s += playMatch(i, j, { rounds, rng }).scoreA;
      table[i][j] = s / samples;
    }),
  );
  return table;
}

const neighbours = (size: number, idx: number) => {
  const x = idx % size;
  const y = Math.floor(idx / size);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      out.push(((y + dy + size) % size) * size + ((x + dx + size) % size));
    }
  return out;
};

export function scoreGrid(grid: Grid, table: Record<string, Record<string, number>>): number[] {
  return grid.cells.map((s, i) => neighbours(grid.size, i).reduce((acc, n) => acc + table[s][grid.cells[n]], 0));
}

export function stepGrid(grid: Grid, table: Record<string, Record<string, number>>): SpatialStep {
  const scores = scoreGrid(grid, table);
  const cells = grid.cells.map((own, i) => {
    let best = own;
    let bestScore = scores[i];
    for (const n of neighbours(grid.size, i)) {
      if (scores[n] > bestScore + 1e-9) {
        bestScore = scores[n];
        best = grid.cells[n];
      }
    }
    return best;
  });
  return { grid: { size: grid.size, cells }, scores };
}

/** A sea of `background` with a square island of `island` in the middle. */
export function islandGrid(size: number, background: StrategyId, island: StrategyId, islandSize: number): Grid {
  const cells: StrategyId[] = Array(size * size).fill(background);
  const start = Math.floor((size - islandSize) / 2);
  for (let y = start; y < start + islandSize; y++)
    for (let x = start; x < start + islandSize; x++) cells[y * size + x] = island;
  return { size, cells };
}

export function randomGrid(size: number, ids: StrategyId[], seed: number): Grid {
  const rng = makeRng(seed);
  return { size, cells: Array.from({ length: size * size }, () => ids[Math.floor(rng() * ids.length)]) };
}

export function census(grid: Grid): Record<string, number> {
  const c: Record<string, number> = {};
  grid.cells.forEach(s => (c[s] = (c[s] ?? 0) + 1));
  return c;
}
