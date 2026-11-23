import type { ReactNode } from 'react';
import type { StrategyId } from '../engine';
import type { SourceId } from './sources';
import { DominanceFigure, HumanPlayFigure } from './figures/opening';
import { TournamentFigure, WatchMatchFigure, roundTwo } from './figures/tournament';
import { FinaleFigure } from './figures/finale';

export interface Chapter {
  id: string;
  /** Short name for the progress rail. */
  part: string;
  title: string;
  /** Revealed one at a time with → so a presenter can pace the room. */
  beats: ReactNode[];
  Figure?: (p: { beat: number }) => ReactNode;
  notes: string[];
  sources?: SourceId[];
  layout?: 'split' | 'wide';
}

const ordinal = (n: number) => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

/** Five slides, one idea each. The last one hands over to the lab. */
export function buildChapters(): Chapter[] {
  const t = roundTwo();
  const field = t.ids.length;
  const place = (id: StrategyId) => t.ranking.findIndex(r => r.id === id) + 1;
  const wins = (id: StrategyId) => t.ranking.find(r => r.id === id)!.wins;
  const placeWord = (id: StrategyId) => (place(id) === 1 ? 'first' : place(id) === field ? 'last' : ordinal(place(id)));

  return [
    {
      id: 'dilemma',
      part: 'One round',
      title: 'Play once, and betrayal wins',
      beats: [
        <>Two players. Each secretly chooses to cooperate or defect, and a banker pays out coins from this table.</>,
        <>If the other player cooperates, defecting pays you 5 instead of 3.</>,
        <>If they defect, defecting pays you 1 instead of 0.</>,
        <>So defecting always pays more. They think the same way, and you both walk away with 1 coin when 3 each was on the table. That is the prisoner’s dilemma.</>,
      ],
      Figure: DominanceFigure,
      notes: [
        'Open with a question: “You play a stranger once, for real money. Cooperate or defect?” Take a show of hands.',
        'The game was devised at RAND in 1950 by Merrill Flood and Melvin Dresher; Albert Tucker named it.',
        'It is a dilemma because Temptation 5 > Reward 3 > Punishment 1 > Sucker 0. Mutual defection is the only Nash equilibrium.',
      ],
      sources: ['flood', 'nash'],
    },
    {
      id: 'repeat',
      part: 'Again and again',
      title: 'Now play it again, and again',
      beats: [
        <>Real life rarely happens once. Neighbours, classmates, companies, even impalas grooming each other: the same players meet over and over.</>,
        <>That changes everything. Betray me today and I can pay you back tomorrow. Try it against a mystery opponent.</>,
        <>One rule: nobody knows which round is the last. If you did, you’d betray on the final round, then the one before it, all the way back to the start. The unknown future keeps cooperation alive. Robert Axelrod called it the shadow of the future.</>,
      ],
      Figure: HumanPlayFigure,
      notes: [
        'Let the class vote each move (hands up for Cooperate). The opponent is a random strategy, revealed when the game ends.',
        'The game lasts at least 5 rounds, then each round has a 1 in 6 chance of being the last, so nobody can plan an ending.',
        'Impalas take turns grooming each other (Hart & Hart, 1992). Biologists call this reciprocal altruism (Trivers, 1971).',
      ],
      sources: ['trivers', 'hart', 'axelrod84'],
    },
    {
      id: 'match',
      part: 'A strategy',
      title: 'Tit for Tat never wins a match',
      beats: [
        <>Meet Tit for Tat: be nice first, then copy whatever the other player did last round. Against Always Defect it gets suckered once, then hits back. It loses by exactly 5.</>,
        <>Against Always Cooperate, it ties. Tit for Tat can tie or lose. It can never beat anyone.</>,
        <>Against sneaky Joss, one betrayal sets off a chain of payback. Pick any opponent above to see more.</>,
      ],
      Figure: WatchMatchFigure,
      notes: [
        'Why it can never win: Tit for Tat only defects after being defected on, so its opponent is always level or ahead.',
        'The strip under the stage is the whole match: white stones mean cooperate, black stones mean defect.',
        'Use the speed buttons or “skip to the end” if you are short on time.',
      ],
    },
    {
      id: 'tournament',
      part: 'The tournament',
      title: '…but it wins the tournament',
      layout: 'wide',
      beats: [
        <>In 1980 Robert Axelrod invited experts to send in strategies, then played them all against each other on a computer. The simplest entry, Tit for Tat, won. Here is our re-run: {field} strategies, every pairing, hidden game lengths, five replays.</>,
        <>Tit for Tat finishes {placeWord('tit-for-tat')}, without beating a single opponent head-to-head.</>,
        <>Rank them by matches won, then by final score. Always Defect wins {wins('always-defect')} of {field - 1} matches and finishes {placeWord('always-defect')}. The coins come from the banker, not from your opponent.</>,
        <>So what do the winners share? Axelrod’s answer: they are nice, forgiving, retaliatory and clear.</>,
      ],
      Figure: TournamentFigure,
      notes: [
        'Real history: 14 entries plus Random in round one, 62 plus Random in round two. Tit for Tat, by Anatol Rapoport, won both.',
        'Scores are average coins per round across every opponent, including a copy of itself.',
        'Tester defects first to probe for pushovers. It comes close, but Tit for Tat still edges it.',
        'The slopegraph is the key idea: winning is not about beating the person in front of you.',
      ],
      sources: ['axelrod80a', 'axelrod80b', 'axelrod84'],
    },
    {
      id: 'lab',
      part: 'Your turn',
      title: 'Your turn',
      beats: [
        <>Four rules came out of the tournament: be nice, forgive, hit back, and be clear. Winning isn’t beating the other player.</>,
        <>But real worlds are messy. What happens when moves get flipped by mistake? Who wins when the line-up changes? Can a few cooperators survive among cheaters? Find out in the lab.</>,
      ],
      Figure: FinaleFigure,
      notes: [
        'Click “Open the lab” (or press L) and go straight into the walkthrough.',
        'Hook for the lab: in a noisy world, two Tit for Tats fall into feuds. A little forgiveness (Generous TFT) fixes it.',
      ],
      sources: ['axelrod84', 'nowakSigmund92', 'nowakMay'],
    },
  ];
}
