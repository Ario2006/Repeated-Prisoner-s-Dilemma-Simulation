import type { Move } from './types';

/** Axelrod's payoffs. T > R > P > S and 2R > T + S. Single source of truth for engine and UI. */
export const T = 5; // temptation
export const R = 3; // reward
export const P = 1; // punishment
export const S = 0; // sucker

export const PAYOFFS: Record<`${Move}${Move}`, [number, number]> = {
  CC: [R, R],
  CD: [S, T],
  DC: [T, S],
  DD: [P, P],
};

export const payoff = (a: Move, b: Move): [number, number] => PAYOFFS[`${a}${b}`];

export const flip = (m: Move): Move => (m === 'C' ? 'D' : 'C');
