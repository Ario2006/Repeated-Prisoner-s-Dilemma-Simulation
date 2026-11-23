import { describe, expect, it } from 'vitest';
import {
  ALL_IDS, NOISE_FIELD, ROUND_ONE, ROUND_TWO, STRATEGIES, census, encounterTable, evolve, islandGrid,
  longestEcho, makeRng, playMatch, roundRobin, stepGrid,
} from './index';
import { SEEDS } from '../story/seeds';

const ctx = (my: string, opp: string) => ({
  round: my.length, my: [...my] as ('C' | 'D')[], opp: [...opp] as ('C' | 'D')[], rng: makeRng(1), generosity: 0.1,
});

describe('payoffs and basic matches', () => {
  it('TFT vs TFT cooperates throughout: 600 each over 200 rounds', () => {
    const m = playMatch('tit-for-tat', 'tit-for-tat', { rounds: 200 });
    expect([m.scoreA, m.scoreB]).toEqual([600, 600]);
    expect(m.rows.every(r => r.executed.join('') === 'CC')).toBe(true);
  });
  it('Always Defect vs Always Cooperate: 1000 vs 0', () => {
    const m = playMatch('always-defect', 'always-cooperate', { rounds: 200 });
    expect([m.scoreA, m.scoreB]).toEqual([1000, 0]);
  });
  it('TFT loses to Always Defect by exactly one sucker payoff: 199 vs 204', () => {
    const m = playMatch('tit-for-tat', 'always-defect', { rounds: 200 });
    expect([m.scoreA, m.scoreB]).toEqual([199, 204]);
  });
  it('Friedman vs Joss locks into permanent mutual defection', () => {
    const m = playMatch('friedman', 'joss', { rounds: 200, seed: 42 });
    const first = m.rows.findIndex(r => r.executed[1] === 'D');
    expect(first).toBeGreaterThanOrEqual(0);
    m.rows.slice(first + 2).forEach(r => expect(r.executed).toEqual(['D', 'D']));
  });
});

describe('strategy rules', () => {
  it('Tit for Two Tats ignores a single defection', () => {
    const s = STRATEGIES['tit-for-two-tats'];
    expect(s.move(ctx('CC', 'CD'))).toBe('C');
    expect(s.move(ctx('CCC', 'CDC'))).toBe('C');
    expect(s.move(ctx('CCCC', 'CDCD'))).toBe('C');
    expect(s.move(ctx('CCC', 'CDD'))).toBe('D');
  });
  it('Pavlov: win-stay, lose-shift', () => {
    const s = STRATEGIES.pavlov;
    expect(s.move(ctx('', ''))).toBe('C');
    expect(s.move(ctx('C', 'C'))).toBe('C'); // R: stay
    expect(s.move(ctx('C', 'D'))).toBe('D'); // S: shift
    expect(s.move(ctx('D', 'C'))).toBe('D'); // T: stay
    expect(s.move(ctx('D', 'D'))).toBe('C'); // P: shift
  });
  it('Tester apologises to a retaliator, then plays Tit for Tat', () => {
    const m = playMatch('tester', 'tit-for-tat', { rounds: 10 });
    expect(m.rows.map(r => r.executed.join('')).slice(0, 4)).toEqual(['DC', 'CD', 'CC', 'CC']);
    expect(m.rows.slice(2).every(r => r.executed.join('') === 'CC')).toBe(true);
  });
  it('Tester exploits Tit for Two Tats by defecting every other round', () => {
    const m = playMatch('tester', 'tit-for-two-tats', { rounds: 200 });
    expect(m.rows.every(r => r.executed[1] === 'C')).toBe(true);
    expect(m.scoreA).toBeGreaterThan(m.scoreB * 2);
  });
  it('Generous TFT forgives roughly its generosity rate', () => {
    const m = playMatch('generous-tit-for-tat', 'always-defect', { rounds: 5000, seed: 3, generosity: 0.1 });
    const forgiven = m.rows.slice(1).filter(r => r.executed[0] === 'C').length / 4999;
    expect(forgiven).toBeGreaterThan(0.08);
    expect(forgiven).toBeLessThan(0.12);
  });
});

describe('noise, seeds and game length', () => {
  it('same seed gives identical matches', () => {
    expect(playMatch('joss', 'random', { seed: 9, noise: 0.1 }).rows).toEqual(playMatch('joss', 'random', { seed: 9, noise: 0.1 }).rows);
  });
  it('noise 0 flips nothing; noise 1 flips everything', () => {
    expect(playMatch('tit-for-tat', 'joss', { noise: 0 }).rows.some(r => r.noisy[0] || r.noisy[1])).toBe(false);
    const all = playMatch('always-cooperate', 'always-defect', { rounds: 50, noise: 1 });
    expect(all.rows.every(r => r.executed.join('') === 'DC')).toBe(true);
  });
  it('random-length games average close to the requested mean', () => {
    let total = 0;
    for (let s = 1; s <= 300; s++) total += playMatch('tit-for-tat', 'tit-for-tat', { rounds: 200, randomLength: true, seed: s }).rounds;
    expect(total / 300).toBeGreaterThan(180);
    expect(total / 300).toBeLessThan(220);
  });
  it('noise produces echo effects between two Tit for Tats', () => {
    const m = playMatch('tit-for-tat', 'tit-for-tat', { rounds: 200, noise: 0.05, seed: SEEDS.echo });
    expect(longestEcho(m.rows).length).toBeGreaterThanOrEqual(4);
  });
});

describe('tournaments (the story depends on these)', () => {
  const r1 = roundRobin(ROUND_ONE, { seed: SEEDS.roundOne });
  const r2 = roundRobin(ROUND_TWO, { seed: SEEDS.roundTwo, randomLength: true });
  it('round one: nice strategies fill the top four, Tit for Two Tats leads, TFT wins no match', () => {
    const ids = r1.ranking.map(s => s.id);
    expect(ids[0]).toBe('tit-for-two-tats');
    ids.slice(0, 4).forEach(id => expect(STRATEGIES[id].nice).toBe(true));
    expect(r1.ranking.find(s => s.id === 'tit-for-tat')!.wins).toBe(0);
    expect(r1.ranking.find(s => s.id === 'always-defect')!.losses).toBe(0);
  });
  it('round two: Tester arrives, Tit for Tat wins, Tit for Two Tats slips', () => {
    const ids = r2.ranking.map(s => s.id);
    expect(ids[0]).toBe('tit-for-tat');
    expect(ids.indexOf('tit-for-two-tats')).toBeGreaterThan(1);
  });
  it('at 5% noise Generous TFT outranks plain Tit for Tat', () => {
    const r = roundRobin(NOISE_FIELD, { seed: SEEDS.noise, noise: 0.05 }).ranking.map(s => s.id);
    expect(r.indexOf('generous-tit-for-tat')).toBeLessThan(r.indexOf('tit-for-tat'));
  });
  it('with everyone, Always Defect lands in the bottom two', () => {
    const r = roundRobin(ALL_IDS, { seed: 3 }).ranking.map(s => s.id);
    expect(r.indexOf('always-defect')).toBeGreaterThanOrEqual(r.length - 2);
  });
});

describe('evolution and space', () => {
  it('shares always sum to 1 and Tit for Tat ends on top after round two', () => {
    const r2 = roundRobin(ROUND_TWO, { seed: SEEDS.roundTwo, randomLength: true });
    const h = evolve(ROUND_TWO, r2.avg, 1000);
    h.forEach(g => expect(Math.abs(Object.values(g).reduce((a, b) => a + b, 0) - 1)).toBeLessThan(1e-9));
    const end = h[h.length - 1];
    expect(Object.entries(end).sort((a, b) => b[1] - a[1])[0][0]).toBe('tit-for-tat');
    expect(end['always-defect']).toBe(0);
  });
  it('a lone Tit for Tat dies among defectors; a 2×2 island takes over', () => {
    const table = encounterTable(['tit-for-tat', 'always-defect'], 10);
    for (const [size, winner] of [[1, 'always-defect'], [2, 'tit-for-tat']] as const) {
      let g = islandGrid(21, 'always-defect', 'tit-for-tat', size);
      for (let t = 0; t < 30; t++) g = stepGrid(g, table).grid;
      expect(census(g)[winner]).toBe(441);
    }
  });
});
