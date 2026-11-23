import type { Ctx, Move, Strategy, StrategyId } from './types';

const last = (h: readonly Move[]) => h[h.length - 1];
const tft = (c: Ctx): Move => (c.round === 0 ? 'C' : last(c.opp));

export const STRATEGIES: Record<StrategyId, Strategy> = {
  'tit-for-tat': {
    id: 'tit-for-tat',
    name: 'Tit for Tat',
    rule: 'Cooperates first, then copies whatever you did last round.',
    quote: "I'll be nice first. Then I'll do what you did.",
    traits: { nice: 'yes', forgiving: 'yes', retaliatory: 'yes', clear: 'yes' },
    nice: true,
    origin: 'Anatol Rapoport. Won both of Axelrod’s 1980 tournaments; the shortest program entered.',
    move: tft,
  },
  'always-defect': {
    id: 'always-defect',
    name: 'Always Defect',
    rule: 'Defects every round, no matter what.',
    quote: 'Coins are for taking.',
    traits: { nice: 'no', forgiving: 'no', retaliatory: 'yes', clear: 'yes' },
    nice: false,
    origin: 'The one-shot “rational” answer, played forever. Never loses a match.',
    move: () => 'D',
  },
  'always-cooperate': {
    id: 'always-cooperate',
    name: 'Always Cooperate',
    rule: 'Cooperates every round, no matter what.',
    quote: 'Friends share! …ow.',
    traits: { nice: 'yes', forgiving: 'yes', retaliatory: 'no', clear: 'yes' },
    nice: true,
    origin: 'The pushover. Thrives among the nice, feeds the nasty.',
    move: () => 'C',
  },
  friedman: {
    id: 'friedman',
    name: 'Friedman',
    rule: 'Cooperates until you defect once, then defects forever.',
    quote: "Cross me once and we're done. Forever.",
    traits: { nice: 'yes', forgiving: 'no', retaliatory: 'yes', clear: 'yes' },
    nice: true,
    origin: 'James W. Friedman, first tournament. Also called “Grim Trigger”.',
    move: c => (c.opp.includes('D') ? 'D' : 'C'),
  },
  joss: {
    id: 'joss',
    name: 'Joss',
    rule: 'Plays Tit for Tat, but sneaks in a defection 10% of the time.',
    quote: 'Who, me? Never.',
    traits: { nice: 'no', forgiving: 'yes', retaliatory: 'yes', clear: 'no' },
    nice: false,
    origin: 'Johann Joss, first tournament. Its sneaky defections set off long feuds.',
    move: c => {
      const m = tft(c);
      return m === 'C' && c.rng() < 0.1 ? 'D' : m;
    },
  },
  'tit-for-two-tats': {
    id: 'tit-for-two-tats',
    name: 'Tit for Two Tats',
    rule: 'Defects only after you defect twice in a row.',
    quote: "Once is an accident. Twice, I'll notice.",
    traits: { nice: 'yes', forgiving: 'yes', retaliatory: 'partly', clear: 'yes' },
    nice: true,
    origin: 'Axelrod’s sample program; would have won round one. Entered in round two, it came 24th.',
    move: c => {
      const n = c.opp.length;
      return n >= 2 && c.opp[n - 1] === 'D' && c.opp[n - 2] === 'D' ? 'D' : 'C';
    },
  },
  'generous-tit-for-tat': {
    id: 'generous-tit-for-tat',
    name: 'Generous TFT',
    rule: 'Tit for Tat, but forgives a defection some of the time (10% by default).',
    quote: "I'll hit back, but I forgive easily.",
    traits: { nice: 'yes', forgiving: 'yes', retaliatory: 'yes', clear: 'yes' },
    nice: true,
    origin: 'Molander (1985); Nowak & Sigmund (1992). Built to survive mistakes.',
    move: c => {
      const m = tft(c);
      return m === 'D' && c.rng() < c.generosity ? 'C' : m;
    },
  },
  pavlov: {
    id: 'pavlov',
    name: 'Pavlov',
    rule: 'Win–stay, lose–shift: repeats its move after a good round, switches after a bad one.',
    quote: 'That worked? Again. That hurt? Switch.',
    traits: { nice: 'yes', forgiving: 'yes', retaliatory: 'yes', clear: 'partly' },
    nice: true,
    origin: 'Kraines & Kraines (1989); Nowak & Sigmund (1993) showed it beats TFT under noise.',
    // Good round = opponent cooperated (R or T). Equivalent rule: cooperate iff both moved alike.
    move: c => (c.round === 0 ? 'C' : last(c.my) === last(c.opp) ? 'C' : 'D'),
  },
  tester: {
    id: 'tester',
    name: 'Tester',
    rule: 'Defects first to probe you. If you hit back, it apologises and plays Tit for Tat. If not, it defects every other round.',
    quote: "Let's see what you're made of.",
    traits: { nice: 'no', forgiving: 'partly', retaliatory: 'yes', clear: 'no' },
    nice: false,
    origin: 'David Gladstein, second tournament. Built to exploit the forgiving entries.',
    move: c => {
      if (c.round === 0) return 'D';
      const firstD = c.opp.indexOf('D');
      if (firstD >= 0) return c.round === firstD + 1 ? 'C' : last(c.opp);
      if (c.round <= 2) return 'C';
      return c.round % 2 === 1 ? 'D' : 'C';
    },
  },
  random: {
    id: 'random',
    name: 'Random',
    rule: 'Flips a coin every round.',
    quote: 'Heads… or tails?',
    traits: { nice: 'no', forgiving: 'no', retaliatory: 'no', clear: 'no' },
    nice: false,
    origin: 'Axelrod added it to both tournaments as a baseline.',
    move: c => (c.rng() < 0.5 ? 'C' : 'D'),
  },
};

/** Canonical order. Also the stacking and colour order in every chart (CVD-validated). */
export const ALL_IDS: StrategyId[] = [
  'tit-for-tat',
  'tit-for-two-tats',
  'pavlov',
  'generous-tit-for-tat',
  'always-cooperate',
  'friedman',
  'joss',
  'always-defect',
  'tester',
  'random',
];

/** Sort any subset into canonical order so colours and stacks never shuffle. */
export const canonical = (ids: readonly StrategyId[]) => ALL_IDS.filter(id => ids.includes(id));

/** Roughly the line-up of Axelrod's first tournament, re-cast with our characters. */
export const ROUND_ONE: StrategyId[] = [
  'tit-for-tat',
  'friedman',
  'tit-for-two-tats',
  'always-cooperate',
  'joss',
  'always-defect',
  'random',
];

/** Round two adds entries built to exploit the forgiving ones. */
export const ROUND_TWO: StrategyId[] = [...ROUND_ONE, 'tester'];

export const NOISE_FIELD: StrategyId[] = [
  'tit-for-tat',
  'generous-tit-for-tat',
  'pavlov',
  'friedman',
  'tit-for-two-tats',
  'always-defect',
  'joss',
];

export const nameOf = (id: string) => (STRATEGIES as Record<string, Strategy>)[id]?.name ?? id;
