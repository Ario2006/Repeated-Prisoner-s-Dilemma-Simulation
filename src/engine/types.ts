export type Move = 'C' | 'D';

/** What a strategy is allowed to see. It never learns how many rounds remain. */
export interface Ctx {
  round: number;
  my: readonly Move[];
  opp: readonly Move[];
  rng: () => number;
  /** Probability Generous TFT forgives a defection. */
  generosity: number;
}

export type Trait = 'yes' | 'no' | 'partly';

export interface Strategy {
  id: StrategyId;
  name: string;
  /** One-line rule, plain language. */
  rule: string;
  /** In-character line. */
  quote: string;
  /** Axelrod's four qualities. */
  traits: { nice: Trait; forgiving: Trait; retaliatory: Trait; clear: Trait };
  /** Never the first to defect (Axelrod's definition of "nice"). */
  nice: boolean;
  origin: string;
  move(ctx: Ctx): Move;
}

export type StrategyId =
  | 'tit-for-tat'
  | 'always-defect'
  | 'always-cooperate'
  | 'friedman'
  | 'joss'
  | 'tit-for-two-tats'
  | 'generous-tit-for-tat'
  | 'pavlov'
  | 'tester'
  | 'random';

export interface MatchOptions {
  /** Fixed length, or the expected length when randomLength is on. */
  rounds?: number;
  /** End after each round with probability 1/rounds (geometric length, mean = rounds). */
  randomLength?: boolean;
  /** Execution error: each intended move flips with this probability. */
  noise?: number;
  generosity?: number;
  seed?: number;
  rng?: () => number;
  /** Safety cap for random-length games. */
  maxRounds?: number;
}

export interface RoundRow {
  round: number;
  intended: [Move, Move];
  executed: [Move, Move];
  gain: [number, number];
  total: [number, number];
  noisy: [boolean, boolean];
}

export interface MatchResult {
  ids: [StrategyId, StrategyId];
  scoreA: number;
  scoreB: number;
  rounds: number;
  rows: RoundRow[];
}

export interface Standing {
  id: StrategyId;
  /** Average points per round across all opponents, including its own twin. */
  perRound: number;
  /** Total points across all matches (averaged over repeats). */
  total: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface TournamentResult {
  ids: StrategyId[];
  /** avg[i][j] = points per round i earned against j. */
  avg: Record<string, Record<string, number>>;
  ranking: Standing[];
}

export type Shares = Record<string, number>;
