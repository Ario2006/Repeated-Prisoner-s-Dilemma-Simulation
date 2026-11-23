import { useState } from 'react';
import { sound } from '../../audio/sound';
import { Character } from '../../characters/Character';
import type { CastId } from '../../characters/cast';
import f from './figures.module.css';

const EXPERIMENTS: { tab: string; title: string; question: string; cast: CastId[] }[] = [
  {
    tab: 'match',
    title: 'Match',
    question: 'Pit any two strategies against each other. Turn on noise and watch one mistake echo.',
    cast: ['tit-for-tat', 'joss'],
  },
  {
    tab: 'tournament',
    title: 'Tournament',
    question: 'Choose who enters. Does Tit for Tat still win when the field changes?',
    cast: ['generous-tit-for-tat', 'tester', 'pavlov'],
  },
  {
    tab: 'islands',
    title: 'Islands',
    question: 'Plant a few cooperators in a world of cheaters. Do they die out or take over?',
    cast: ['tit-for-tat', 'always-defect'],
  },
];

export function FinaleFigure({ beat }: { beat: number }) {
  const [hover, setHover] = useState<{ tab: string; key: number } | null>(null);
  return (
    <div className={f.finale}>
      <div className={f.rules}>
        {[
          ['Be nice', 'Never defect first.'],
          ['Forgive', 'Punish once, then move on.'],
          ['Hit back', 'Never be a pushover.'],
          ['Be clear', 'Easy to read, easy to trust.'],
        ].map(([h, p], i) => (
          <div key={h} className={f.rule} style={{ animationDelay: `${i * 90}ms` }}>
            <b>{h}</b>
            <span>{p}</span>
          </div>
        ))}
      </div>
      {beat >= 1 && (
        <div className={f.experiments}>
          {EXPERIMENTS.map((e, i) => (
            <a
              key={e.tab}
              href={`#/lab/${e.tab}`}
              className={f.experiment}
              style={{ animationDelay: `${i * 120}ms` }}
              onMouseEnter={() => setHover({ tab: e.tab, key: Date.now() })}
              onMouseLeave={() => setHover(null)}
              onClick={() => sound.win()}
            >
              <div className={f.expCast}>
                {e.cast.map(id => (
                  <Character key={id} id={id} size={52} reaction={hover?.tab === e.tab ? { type: 'cheer', key: hover.key } : null} />
                ))}
              </div>
              <h3>{e.title}</h3>
              <p>{e.question}</p>
              <span className={f.expGo}>Open {e.title.toLowerCase()}</span>
            </a>
          ))}
        </div>
      )}
      {beat >= 1 && (
        <a href="#/lab/match" className={f.cta} onClick={() => sound.win()}>
          Open the lab
          <kbd>L</kbd>
        </a>
      )}
    </div>
  );
}
