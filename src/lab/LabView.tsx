import { useEffect, useMemo, useState } from 'react';
import { Character } from '../characters/Character';
import { IslandView } from '../components/Island';
import { MatchPlayer } from '../components/MatchPlayer';
import { TournamentBoard, useTournament } from '../components/Tournament';
import { Button, Segmented, Slider, Toggle } from '../components/ui';
import {
  ALL_IDS, canonical, islandGrid, nameOf, randomGrid, randomSeed, ROUND_ONE, STRATEGIES, tournamentInsights,
  type StrategyId,
} from '../engine';
import s from './LabView.module.css';

type Tab = 'match' | 'tournament' | 'islands';
const TABS: Tab[] = ['match', 'tournament', 'islands'];

interface Settings {
  a: StrategyId;
  b: StrategyId;
  field: StrategyId[];
  rounds: number;
  randomLength: boolean;
  noise: number;
  generosity: number;
  repeats: number;
  seed: number;
}

const DEFAULTS: Settings = {
  a: 'tit-for-tat',
  b: 'joss',
  field: ROUND_ONE,
  rounds: 200,
  randomLength: false,
  noise: 0,
  generosity: 0.1,
  repeats: 5,
  seed: 42,
};

function tabFromHash(): Tab {
  const t = window.location.hash.match(/#\/lab\/(\w+)/)?.[1] as Tab | undefined;
  return t && TABS.includes(t) ? t : 'match';
}

function load(): Settings {
  try {
    const raw = localStorage.getItem('sotf:lab');
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULTS;
}

export function LabView() {
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [cfg, setCfg] = useState<Settings>(load);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setCfg(c => ({ ...c, [k]: v }));

  useEffect(() => {
    try {
      localStorage.setItem('sotf:lab', JSON.stringify(cfg));
    } catch {
      /* ignore */
    }
  }, [cfg]);
  useEffect(() => history.replaceState(null, '', `#/lab/${tab}`), [tab]);
  useEffect(() => {
    const on = () => window.location.hash.startsWith('#/lab') && setTab(tabFromHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const matchOpts = useMemo(
    () => ({ rounds: cfg.rounds, randomLength: cfg.randomLength, noise: cfg.noise, generosity: cfg.generosity, seed: cfg.seed }),
    [cfg.rounds, cfg.randomLength, cfg.noise, cfg.generosity, cfg.seed],
  );
  const tourOpts = useMemo(() => ({ ...matchOpts, repeats: cfg.repeats }), [matchOpts, cfg.repeats]);

  return (
    <div className={s.lab}>
      <div className={s.top}>
        <h1 className={s.title}>Lab</h1>
        <Segmented<Tab>
          label="Experiment"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'match', label: 'Match' },
            { value: 'tournament', label: 'Tournament' },
            { value: 'islands', label: 'Islands' },
          ]}
        />
      </div>

      <div className={s.body}>
        <aside className={s.panel} aria-label="Settings">
          {tab === 'match' && (
            <>
              <StrategySelect label="Player one" value={cfg.a} onChange={v => set('a', v)} />
              <StrategySelect label="Player two" value={cfg.b} onChange={v => set('b', v)} />
            </>
          )}
          {tab === 'tournament' && (
            <FieldPicker value={cfg.field} onChange={v => set('field', v)} />
          )}
          {tab !== 'islands' && (
            <>
              <Slider label={cfg.randomLength ? 'Expected rounds' : 'Rounds'} value={cfg.rounds} min={10} max={1000} step={10} onChange={v => set('rounds', v)} />
              <Toggle label="Hidden, random length" checked={cfg.randomLength} onChange={v => set('randomLength', v)} />
              <Slider label="Noise" value={cfg.noise} min={0} max={0.2} step={0.01} onChange={v => set('noise', v)} format={v => `${Math.round(v * 100)}%`} />
              <Slider label="Generous TFT forgives" value={cfg.generosity} min={0} max={0.6} step={0.05} onChange={v => set('generosity', v)} format={v => `${Math.round(v * 100)}%`} />
            </>
          )}
          {tab === 'tournament' && <Slider label="Replays" value={cfg.repeats} min={1} max={10} onChange={v => set('repeats', v)} />}
          {tab !== 'islands' && (
            <div className={s.seed}>
              <label>
                <span>Seed</span>
                <input type="number" value={cfg.seed} onChange={e => set('seed', Number(e.target.value) || 0)} />
              </label>
              <Button onClick={() => set('seed', randomSeed())}>New seed</Button>
            </div>
          )}
          {tab === 'islands' && <IslandSettings />}
          <Button variant="quiet" onClick={() => setCfg(DEFAULTS)}>
            Restore defaults
          </Button>
        </aside>

        <section className={s.main} key={tab}>
          {tab === 'match' && <MatchPlayer key={`${cfg.a}-${cfg.b}`} a={cfg.a} b={cfg.b} options={matchOpts} />}
          {tab === 'tournament' && <TournamentPanel field={cfg.field} options={tourOpts} />}
          {tab === 'islands' && <IslandPanel />}
        </section>
      </div>
    </div>
  );
}

function StrategySelect({ label, value, onChange }: { label: string; value: StrategyId; onChange: (v: StrategyId) => void }) {
  return (
    <label className={s.select}>
      <span>{label}</span>
      <div className={s.selectRow}>
        <Character id={value} size={38} idle={false} />
        <select value={value} onChange={e => onChange(e.target.value as StrategyId)}>
          {ALL_IDS.map(id => (
            <option key={id} value={id}>
              {nameOf(id)}
            </option>
          ))}
        </select>
      </div>
      <small>{STRATEGIES[value].rule}</small>
    </label>
  );
}

function FieldPicker({ value, onChange }: { value: StrategyId[]; onChange: (v: StrategyId[]) => void }) {
  return (
    <fieldset className={s.field}>
      <legend>Who plays ({value.length})</legend>
      <div className={s.fieldGrid}>
        {ALL_IDS.map(id => {
          const on = value.includes(id);
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              className={on ? s.fieldOn : undefined}
              onClick={() => onChange(on ? value.filter(v => v !== id) : canonical([...value, id]))}
              title={STRATEGIES[id].rule}
            >
              <Character id={id} size={30} idle={false} dim={!on} />
              <span>{nameOf(id)}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TournamentPanel({ field, options }: { field: StrategyId[]; options: Parameters<typeof useTournament>[1] }) {
  const { result } = useTournament(field, options);
  return (
    <div className={s.stack}>
      <TournamentBoard ids={field} options={options} />
      {result && (
        <ul className={s.insights}>
          {tournamentInsights(result).map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Islands keep their own settings: they are a different model. */
const ISLAND_PRESETS = {
  island: { label: 'Island in a sea', make: (a: StrategyId, b: StrategyId) => islandGrid(25, b, a, 3) },
  mix: { label: 'Random mix', make: (_a: StrategyId, _b: StrategyId, ids: StrategyId[], seed: number) => randomGrid(36, ids, seed) },
};

function IslandSettings() {
  return <p className={s.note}>Each cell plays a 10-round match with each of its 8 neighbours, then copies the highest scorer around it. Click or drag on the grid to paint.</p>;
}

function IslandPanel() {
  const [preset, setPreset] = useState<keyof typeof ISLAND_PRESETS>('island');
  const [a, setA] = useState<StrategyId>('tit-for-tat');
  const [b, setB] = useState<StrategyId>('always-defect');
  const [mix, setMix] = useState<StrategyId[]>(['tit-for-tat', 'always-cooperate', 'friedman', 'always-defect', 'random']);
  const [seed, setSeed] = useState(1992);
  const ids = useMemo(() => (preset === 'island' ? canonical(a === b ? [a] : [a, b]) : mix), [preset, a, b, mix]);
  const grid = useMemo(() => ISLAND_PRESETS[preset].make(a, b, mix, seed), [preset, a, b, mix, seed]);
  return (
    <div className={s.stack}>
      <div className={s.islandBar}>
        <Segmented
          label="Starting world"
          value={preset}
          onChange={setPreset}
          options={Object.entries(ISLAND_PRESETS).map(([k, v]) => ({ value: k as keyof typeof ISLAND_PRESETS, label: v.label }))}
        />
        {preset === 'island' ? (
          <>
            <StrategySelect label="Island" value={a} onChange={setA} />
            <StrategySelect label="Sea" value={b} onChange={setB} />
          </>
        ) : (
          <>
            <FieldPicker value={mix} onChange={v => v.length >= 1 && setMix(v)} />
            <Button onClick={() => setSeed(randomSeed())}>Shuffle</Button>
          </>
        )}
      </div>
      {ids.length > 0 && <IslandView key={`${preset}${ids.join()}${seed}`} ids={ids} initial={grid} brush={ids[0]} />}
    </div>
  );
}
