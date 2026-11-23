import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sound } from '../audio/sound';
import { buildChapters } from './chapters';
import { SOURCES } from './sources';
import s from './StoryView.module.css';

function readHash(ids: string[]) {
  const m = window.location.hash.match(/^#\/story\/([\w-]+)/);
  const i = m ? ids.indexOf(m[1]) : -1;
  return i >= 0 ? i : 0;
}

/** Title that assembles word by word. */
function Title({ text }: { text: string }) {
  return (
    <h1 className={s.title} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className={s.word} style={{ animationDelay: `${120 + i * 70}ms` }} aria-hidden>
          {w}{' '}
        </span>
      ))}
    </h1>
  );
}

export function StoryView({ onOpenLab }: { onOpenLab: () => void }) {
  const chapters = useMemo(buildChapters, []);
  const ids = chapters.map(c => c.id);
  const [index, setIndex] = useState(() => readHash(ids));
  const [beat, setBeat] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [notes, setNotes] = useState(false);
  const ch = chapters[index];
  const lastBeat = ch.beats.length - 1;
  const textRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (i: number, b = 0) => {
      const next = Math.max(0, Math.min(chapters.length - 1, i));
      if (next === index) return;
      sound.page();
      setDir(next > index ? 1 : -1);
      setIndex(next);
      setBeat(b === -1 ? chapters[next].beats.length - 1 : b);
    },
    [chapters, index],
  );

  const forward = useCallback(() => {
    if (beat < lastBeat) setBeat(beat + 1);
    else if (index === chapters.length - 1) onOpenLab();
    else go(index + 1);
  }, [beat, lastBeat, go, index, chapters.length, onOpenLab]);
  const back = useCallback(() => (beat > 0 ? setBeat(beat - 1) : index > 0 && go(index - 1, -1)), [beat, go, index]);

  useEffect(() => {
    const id = chapters[index].id;
    if (!window.location.hash.endsWith(`/${id}`)) history.replaceState(null, '', `#/story/${id}`);
  }, [index, chapters]);

  // Follow links and the back button.
  useEffect(() => {
    const onHash = () => {
      if (!window.location.hash.startsWith('#/story/')) return;
      const i = readHash(ids);
      setIndex(cur => {
        if (cur !== i) setBeat(0);
        return i;
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [ids.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, select, textarea, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        if (e.key === ' ' && t.closest('button, a')) return;
        e.preventDefault();
        forward();
      } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        back();
      } else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(chapters.length - 1);
      else if (e.key.toLowerCase() === 'n') setNotes(v => !v);
      else if (e.key.toLowerCase() === 'l') onOpenLab();
      else if (e.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [forward, back, go, chapters.length, onOpenLab]);

  useEffect(() => {
    textRef.current?.querySelector(`[data-beat="${beat}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [beat]);

  const Figure = ch.Figure;
  const layout = ch.layout ?? 'split';

  return (
    <div className={s.story}>
      <div className={s.ambient} aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <main className={`${s.chapter} ${s[layout]} ${dir === 1 ? s.fwd : s.bwd}`} key={ch.id}>
        <div className={s.text} ref={textRef}>
          <p className={s.count} aria-label={`Slide ${index + 1} of ${chapters.length}`}>
            <span className={s.countNum}>{index + 1}</span>
            <span className={s.countOf}>/ {chapters.length}</span>
            <span className={s.countPart}>{ch.part}</span>
          </p>
          <Title text={ch.title} />
          <div className={s.beats} aria-live="polite">
            {ch.beats.slice(0, beat + 1).map((b, i) => (
              <p key={i} data-beat={i} className={`${s.beat} ${i === beat ? s.current : ''}`}>
                {b}
              </p>
            ))}
          </div>
          {beat < lastBeat && (
            <button className={s.more} onClick={forward}>
              <span className={s.pulse} aria-hidden />
              Continue <kbd>→</kbd>
            </button>
          )}
          {ch.sources && <p className={s.sources}>{ch.sources.map(id => SOURCES[id].short).join('; ')}</p>}
        </div>
        {Figure && (
          <section className={s.figure} aria-label="Interactive figure">
            <Figure beat={beat} />
          </section>
        )}
      </main>

      {notes && (
        <aside className={s.notes} aria-label="Speaker notes">
          <h2>Speaker notes</h2>
          <ul>
            {ch.notes.map(n => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </aside>
      )}

      <nav className={s.rail} aria-label="Slides">
        <button className={s.navBtn} onClick={back} disabled={index === 0 && beat === 0} aria-label="Previous">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ol className={s.steps}>
          {chapters.map((c, i) => (
            <li key={c.id}>
              <button
                className={`${s.step} ${i < index ? s.stepDone : ''} ${i === index ? s.stepOn : ''}`}
                onClick={() => go(i)}
                aria-current={i === index ? 'step' : undefined}
              >
                <span className={s.stepDot}>{i + 1}</span>
                <span className={s.stepLabel}>{c.part}</span>
                <span className={s.stepBar}>
                  <span style={{ width: i < index ? '100%' : i === index ? `${((beat + 1) / c.beats.length) * 100}%` : 0 }} />
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button className={`${s.navBtn} ${s.navNext}`} onClick={forward} aria-label={index === chapters.length - 1 && beat === lastBeat ? 'Open the lab' : 'Next'}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={`${s.notesBtn} ${notes ? s.notesOn : ''}`} onClick={() => setNotes(v => !v)} aria-pressed={notes}>
          Notes <kbd>N</kbd>
        </button>
      </nav>
    </div>
  );
}
