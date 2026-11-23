import { useEffect, useState } from 'react';
import { sound } from '../../audio/sound';
import { Character } from '../../characters/Character';
import { COLORS, type Mood } from '../../characters/cast';
import { MatchStage } from '../../components/MatchStage';
import { PayoffMatrix, type Cell } from '../../components/PayoffMatrix';
import { Button } from '../../components/ui';
import { makeRng, nameOf, nextMove, payoff, randomSeed, STRATEGIES, type Move, type RoundRow, type StrategyId } from '../../engine';
import { usePlayback } from '../../hooks/usePlayback';
import f from './figures.module.css';

/** The one-shot logic, walked through cell by cell, with two players reacting. */
export function DominanceFigure({ beat }: { beat: number }) {
  const a = { label: 'You', color: COLORS.you };
  const b = { label: 'Them', color: COLORS.mystery };
  const steps: {
    focusCol?: Move;
    marks: Partial<Record<Cell, 'best' | 'compare' | 'ghost'>>;
    caption: string;
    moods: [Mood, Mood];
    thought: string;
  }[] = [
    { marks: {}, caption: 'Each cell: your coins (big), their coins (small).', moods: ['neutral', 'neutral'], thought: 'Hmm…' },
    { focusCol: 'C', marks: { CC: 'compare', DC: 'best' }, caption: 'If they cooperate: 3 for cooperating, 5 for defecting.', moods: ['smug', 'happy'], thought: '5 beats 3…' },
    { focusCol: 'D', marks: { CD: 'compare', DD: 'best' }, caption: 'If they defect: 0 for cooperating, 1 for defecting.', moods: ['smug', 'smug'], thought: '1 beats 0…' },
    { marks: { DD: 'best', CC: 'ghost' }, caption: 'Both defect and get 1 each. The dashed cell, 3 each, was right there.', moods: ['angry', 'angry'], thought: 'We both lost.' },
  ];
  const st = steps[Math.min(beat, steps.length - 1)];
  return (
    <div className={f.dilemma}>
      <div className={`${f.actor} ${f.actorL}`}>
        <span className={f.thought} key={st.thought}>
          {st.thought}
        </span>
        <Character id="you" size={120} facing="right" mood={st.moods[0]} reaction={beat ? { type: beat === 3 ? 'angry' : 'smug', key: beat } : null} />
        <b>You</b>
      </div>
      <PayoffMatrix a={a} b={b} focusCol={st.focusCol} marks={st.marks} caption={st.caption} />
      <div className={`${f.actor} ${f.actorR}`}>
        <span className={f.thought} style={{ visibility: beat === 3 ? 'visible' : 'hidden' }}>
          Same logic.
        </span>
        <Character id="mystery" size={120} facing="left" mood={st.moods[1]} />
        <b>Them</b>
      </div>
    </div>
  );
}

/* ───────────── human play ───────────── */

const OPPONENTS: StrategyId[] = ['tit-for-tat', 'always-defect', 'always-cooperate', 'friedman', 'joss', 'tit-for-two-tats', 'pavlov', 'tester', 'random'];

export function HumanPlayFigure() {
  const [game, setGame] = useState(() => newGame());
  const [rows, setRows] = useState<RoundRow[]>([]);
  const pb = usePlayback(rows.length);
  const over = game.ended && pb.cursor >= rows.length && pb.phase === 'idle';

  function newGame() {
    const seed = randomSeed();
    const rng = makeRng(seed);
    return { opp: OPPONENTS[Math.floor(rng() * OPPONENTS.length)], rng, ended: false };
  }

  useEffect(() => {
    if (rows.length > pb.cursor && pb.phase === 'idle' && !pb.playing) pb.step();
  }, [rows.length, pb.cursor, pb.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (over) sound.win();
  }, [over]);

  const choose = (mine: Move) => {
    if (game.ended || pb.phase !== 'idle') return;
    const my = rows.map(r => r.executed[0]);
    const op = rows.map(r => r.executed[1]);
    const theirs = nextMove(game.opp, op, my, game.rng);
    const [ga, gb] = payoff(mine, theirs);
    const prev = rows[rows.length - 1]?.total ?? [0, 0];
    const row: RoundRow = {
      round: rows.length,
      intended: [mine, theirs],
      executed: [mine, theirs],
      gain: [ga, gb],
      total: [prev[0] + ga, prev[1] + gb],
      noisy: [false, false],
    };
    // Hidden length: at least 5 rounds, then a 1-in-6 chance each round that this was the last.
    const ended = rows.length + 1 >= 5 && game.rng() < 1 / 6;
    setRows(r => [...r, row]);
    if (ended || rows.length + 1 >= 30) setGame(g => ({ ...g, ended: true }));
  };

  const restart = () => {
    pb.reset();
    setRows([]);
    setGame(newGame());
  };

  const last = rows[rows.length - 1];
  return (
    <div className={f.fig}>
      <MatchStage
        a="you"
        b={over ? game.opp : 'mystery'}
        labels={['You', over ? nameOf(game.opp) : 'Mystery player']}
        rows={rows}
        cursor={pb.cursor}
        phase={pb.phase}
        fast={pb.fast}
        speed={1.4}
        intro={['Your move.', 'We’ll meet again… for a while.']}
        size={140}
      />
      {!over ? (
        <div className={f.choices}>
          <button className={f.choice} onClick={() => choose('C')} disabled={pb.phase !== 'idle'}>
            <StoneDot move="C" /> Cooperate
          </button>
          <button className={`${f.choice} ${f.choiceD}`} onClick={() => choose('D')} disabled={pb.phase !== 'idle'}>
            <StoneDot move="D" /> Defect
          </button>
        </div>
      ) : (
        <div className={f.reveal}>
          <Character id={game.opp} size={84} mood="happy" />
          <div>
            <h3>
              That was {nameOf(game.opp)}, and the game ended after {rows.length} rounds.
            </h3>
            <p>
              {STRATEGIES[game.opp].rule} You scored {last.total[0]}, they scored {last.total[1]}.{' '}
              {last.total[0] + last.total[1] >= rows.length * 5
                ? 'Together you pulled a lot out of the banker.'
                : 'Together you left coins on the table.'}
            </p>
            <div style={{ marginTop: 10 }}>
              <Button variant="primary" onClick={restart}>
                Play a new mystery opponent
              </Button>
            </div>
          </div>
        </div>
      )}
      <p className={f.caption}>
        Nobody knows when the game ends. Not you, not them. Rounds played: {rows.length}.
      </p>
    </div>
  );
}

function StoneDot({ move }: { move: Move }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r="8.5" fill={move === 'C' ? '#fff' : '#18202e'} stroke={move === 'C' ? '#18202e' : '#fff'} strokeWidth="2" />
    </svg>
  );
}

