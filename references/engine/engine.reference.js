// Reference implementation of the Repeated Prisoner's Dilemma engine.
// Pure logic, no DOM. Port to TypeScript as-is. Moves are 'C' (cooperate) or 'D' (defect).

export const PAYOFFS = { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] }; // [me, opponent]; T=5 R=3 P=1 S=0
export const payoff = (a, b) => PAYOFFS[a + b];

// Seeded RNG (mulberry32) so runs are reproducible.
export function makeRng(seed = 1) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ctx = { round (0-based), my: [...], opp: [...], rng }.
// my/opp are the moves actually executed so far (after noise).
export const STRATEGIES = {
  'tit-for-tat':       { name: 'Tit for Tat', nice: true,  move: c => (c.round === 0 ? 'C' : c.opp[c.round - 1]) },
  'always-defect':     { name: 'Always Defect', nice: false, move: () => 'D' },
  'always-cooperate':  { name: 'Always Cooperate', nice: true, move: () => 'C' },
  'friedman':          { name: 'Friedman', nice: true, move: c => (c.opp.includes('D') ? 'D' : 'C') },
  // Joss: Tit for Tat, but ~10% of the time defects instead of cooperating (sneaky).
  'joss':              { name: 'Joss', nice: false, move: c => {
      const tft = c.round === 0 ? 'C' : c.opp[c.round - 1];
      return tft === 'C' && c.rng() < 0.1 ? 'D' : tft; } },
  // Tit for Two Tats: retaliate only after two defections in a row.
  'tit-for-two-tats':  { name: 'Tit for Two Tats', nice: true, move: c =>
      (c.round >= 2 && c.opp[c.round - 1] === 'D' && c.opp[c.round - 2] === 'D' ? 'D' : 'C') },
  // Generous TFT: after an opponent defection, forgive ~10% of the time (retaliate ~9/10).
  'generous-tit-for-tat': { name: 'Generous TFT', nice: true, move: c => {
      if (c.round === 0) return 'C';
      const last = c.opp[c.round - 1];
      return last === 'D' && c.rng() < 0.9 ? 'D' : 'C'; } },
  'random':            { name: 'Random', nice: false, move: c => (c.rng() < 0.5 ? 'C' : 'D') },
  // Tester: defects first. If opponent retaliates -> apologise (C) then play TFT. Else defect every other move.
  'tester':            { name: 'Tester', nice: false, move: c => {
      if (c.round === 0) return 'D';
      const retaliated = c.opp[1] === 'D';
      if (c.round === 1) return 'C';                       // test result is known only at round 1's reply
      if (retaliated) return c.round === 2 ? 'C' : c.opp[c.round - 1]; // apology, then TFT
      return c.round % 2 === 0 ? 'D' : 'C'; } },
  // Graaskamp (SIMPLIFIED): Tit for Tat, but defects once at round 50 to probe the opponent.
  'graaskamp':         { name: 'Graaskamp', nice: true, move: c =>
      (c.round === 0 ? 'C' : c.round === 49 ? 'D' : c.opp[c.round - 1]) },
};

/**
 * Play one match.
 * opts: { rounds=200, randomLength=false, noise=0, rng }
 *  - randomLength: true => game ends after each round with prob 1/rounds (mean = rounds). Strategies never know the end.
 *  - noise: probability that a player's INTENDED move is flipped when executed (implementation error).
 *    Both players and the payoff use the executed move. Intended moves are also returned so the UI can flash "noise".
 */
export function playMatch(idA, idB, opts = {}) {
  const { rounds = 200, randomLength = false, noise = 0, rng = makeRng(1) } = opts;
  const A = STRATEGIES[idA], B = STRATEGIES[idB];
  const a = [], b = [], rows = [];
  let sa = 0, sb = 0;
  for (let r = 0; ; r++) {
    if (!randomLength && r >= rounds) break;
    const ia = A.move({ round: r, my: a, opp: b, rng });
    const ib = B.move({ round: r, my: b, opp: a, rng });
    const ea = rng() < noise ? (ia === 'C' ? 'D' : 'C') : ia;
    const eb = rng() < noise ? (ib === 'C' ? 'D' : 'C') : ib;
    const [pa, pb] = payoff(ea, eb);
    sa += pa; sb += pb; a.push(ea); b.push(eb);
    rows.push({ round: r, intended: [ia, ib], executed: [ea, eb], gain: [pa, pb], total: [sa, sb], noisy: [ia !== ea, ib !== eb] });
    if (randomLength && rng() < 1 / rounds) break;
  }
  return { scoreA: sa, scoreB: sb, rounds: rows.length, rows };
}

/** Round robin: every strategy plays every other AND a copy of itself (as in Axelrod). Returns matrix + ranking. */
export function roundRobin(ids, opts = {}) {
  const rng = opts.rng ?? makeRng(opts.seed ?? 1);
  const avg = {}; // avg[i][j] = average points per round of i versus j
  ids.forEach(i => (avg[i] = {}));
  for (let x = 0; x < ids.length; x++) for (let y = x; y < ids.length; y++) {
    const m = playMatch(ids[x], ids[y], { ...opts, rng });
    avg[ids[x]][ids[y]] = m.scoreA / m.rounds;
    avg[ids[y]][ids[x]] = m.scoreB / m.rounds;
  }
  const total = {};
  ids.forEach(i => (total[i] = ids.reduce((s, j) => s + avg[i][j], 0) / ids.length));
  const ranking = ids.map(id => ({ id, score: total[id] })).sort((p, q) => q.score - p.score);
  return { avg, ranking };
}

/** Evolution (ecological) simulation: shares grow in proportion to fitness. No mutation. */
export function evolve(ids, avg, generations = 1000, extinctBelow = 1e-4) {
  let share = Object.fromEntries(ids.map(i => [i, 1 / ids.length]));
  const history = [{ ...share }];
  for (let g = 0; g < generations; g++) {
    const fit = {};
    ids.forEach(i => (fit[i] = ids.reduce((s, j) => s + share[j] * avg[i][j], 0)));
    const mean = ids.reduce((s, i) => s + share[i] * fit[i], 0);
    const next = {};
    ids.forEach(i => (next[i] = (share[i] * fit[i]) / mean));
    ids.forEach(i => { if (next[i] < extinctBelow) next[i] = 0; });
    const z = ids.reduce((s, i) => s + next[i], 0);
    ids.forEach(i => (next[i] /= z));
    share = next; history.push({ ...share });
  }
  return history;
}
