import { useCallback, useEffect, useState } from 'react';
import { useSoundEnabled } from './hooks/useSound';
import { LabView } from './lab/LabView';
import { StoryView } from './story/StoryView';
import s from './App.module.css';

type View = 'story' | 'lab';
const viewFromHash = (): View => (window.location.hash.startsWith('#/lab') ? 'lab' : 'story');

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [soundOn, setSoundOn] = useSoundEnabled();

  useEffect(() => {
    const on = () => setView(viewFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const open = useCallback((v: View) => {
    window.location.hash = v === 'lab' ? '#/lab' : '#/story';
    setView(v);
  }, []);

  return (
    <div className={`${s.app} ${view === 'story' ? s.fixed : ''}`}>
      <header className={s.bar}>
        <a href="#/story" className={s.mark} onClick={() => open('story')}>
          <svg viewBox="0 0 32 20" width="32" height="20" aria-hidden>
            <circle cx="10" cy="10" r="8" fill="#fff" stroke="currentColor" strokeWidth="2.2" />
            <circle cx="22" cy="10" r="8" fill="currentColor" stroke="currentColor" strokeWidth="2.2" />
          </svg>
          <span>Repeated Prisoner’s Dilemma</span>
        </a>
        <nav className={s.nav} aria-label="Views">
          <button aria-current={view === 'story' ? 'page' : undefined} onClick={() => open('story')}>
            Story
          </button>
          <button aria-current={view === 'lab' ? 'page' : undefined} onClick={() => open('lab')}>
            Lab
          </button>
        </nav>
        <button className={s.icon} onClick={() => setSoundOn(!soundOn)} aria-pressed={soundOn} aria-label={soundOn ? 'Mute sound' : 'Turn sound on'} title={soundOn ? 'Mute' : 'Sound on'}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
            {soundOn ? (
              <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>
      <div className={s.content}>{view === 'story' ? <StoryView onOpenLab={() => open('lab')} /> : <LabView />}</div>
    </div>
  );
}
