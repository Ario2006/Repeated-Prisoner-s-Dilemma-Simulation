import type { StrategyId } from '../engine';

export type Mood = 'neutral' | 'happy' | 'smug' | 'hurt' | 'angry' | 'oops' | 'serene' | 'wink' | 'stern';
export type CastId = StrategyId | 'banker' | 'you' | 'mystery';

/**
 * Identity colours, in the canonical ALL_IDS order. Validated for colour-vision
 * deficiency on the sheet surface (adjacent pairs ΔE ≥ 9). Random is grey on purpose:
 * it has no character.
 */
export const COLORS: Record<CastId, string> = {
  'tit-for-tat': '#2a78d6',
  'tit-for-two-tats': '#eb6834',
  pavlov: '#1baf7a',
  'generous-tit-for-tat': '#eda100',
  'always-cooperate': '#e87ba4',
  friedman: '#008300',
  joss: '#6250d6',
  'always-defect': '#e34948',
  tester: '#7b4a1f',
  random: '#8a8f98',
  banker: '#e3a21a',
  you: '#ffffff',
  mystery: '#b9c0b6',
};

export const DEFAULT_MOOD: Record<CastId, Mood> = {
  'tit-for-tat': 'neutral',
  'tit-for-two-tats': 'serene',
  pavlov: 'neutral',
  'generous-tit-for-tat': 'happy',
  'always-cooperate': 'happy',
  friedman: 'stern',
  joss: 'wink',
  'always-defect': 'smug',
  tester: 'smug',
  random: 'oops',
  banker: 'happy',
  you: 'neutral',
  mystery: 'neutral',
};

/** Seconds per idle bob: calm characters breathe slowly, Random fidgets. */
export const BOB: Record<CastId, number> = {
  'tit-for-tat': 2.6,
  'tit-for-two-tats': 3.6,
  pavlov: 2.4,
  'generous-tit-for-tat': 2.8,
  'always-cooperate': 2.0,
  friedman: 4.2,
  joss: 1.3,
  'always-defect': 3.4,
  tester: 1.8,
  random: 0.9,
  banker: 3.0,
  you: 2.6,
  mystery: 3.2,
};

/** Mood after a round, from the coins received (Axelrod payoffs). */
export const moodForGain = (gain: number): Mood =>
  gain === 5 ? 'smug' : gain === 3 ? 'happy' : gain === 1 ? 'angry' : 'hurt';
