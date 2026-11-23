import type { ReactNode } from 'react';
import { sound } from '../audio/sound';
import type { Playback } from '../hooks/usePlayback';
import s from './ui.module.css';

export function Button({
  children,
  onClick,
  variant = 'plain',
  disabled,
  label,
  pressed,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'plain' | 'primary' | 'quiet' | 'icon';
  disabled?: boolean;
  label?: string;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${s.btn} ${s[variant]} ${className ?? ''}`}
      onClick={() => {
        sound.click();
        onClick?.();
      }}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className={s.seg} role="radiogroup" aria-label={label}>
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? s.segOn : undefined}
          onClick={() => {
            sound.click();
            onChange(o.value);
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = v => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={s.slider}>
      <span className={s.sliderHead}>
        <span>{label}</span>
        <output>{format(value)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={s.toggle}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={s.track} aria-hidden />
      <span>{label}</span>
    </label>
  );
}

const Icon = {
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" />,
  pause: (
    <g fill="currentColor">
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </g>
  ),
  step: (
    <g fill="currentColor">
      <path d="M5 4.5v15l10-7.5z" />
      <rect x="16" y="4.5" width="3.2" height="15" rx="1" />
    </g>
  ),
  reset: <path d="M12 5a7 7 0 1 1-6.6 4.7M5 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  end: (
    <g fill="currentColor">
      <path d="M3 5v14l8-7zM11 5v14l8-7z" />
      <rect x="19" y="5" width="2.6" height="14" rx="1" />
    </g>
  ),
};

export function Svg({ name }: { name: keyof typeof Icon }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      {Icon[name]}
    </svg>
  );
}

export const SPEEDS = [0.5, 1, 2, 4, 8, 16, 64];

export function Transport({ pb, total }: { pb: Playback; total: number }) {
  return (
    <div className={s.transport}>
      <div className={s.transportBtns}>
        <Button variant="icon" label="Reset" onClick={pb.reset}>
          <Svg name="reset" />
        </Button>
        <Button variant="icon" label="Step one round" onClick={pb.step} disabled={pb.done}>
          <Svg name="step" />
        </Button>
        <Button variant="primary" label={pb.playing ? 'Pause' : pb.done ? 'Replay' : 'Play'} onClick={pb.toggle}>
          <Svg name={pb.playing ? 'pause' : 'play'} />
          <span>{pb.playing ? 'Pause' : pb.done ? 'Replay' : 'Play'}</span>
        </Button>
        <Button variant="icon" label="Skip to the end" onClick={pb.finish} disabled={pb.done}>
          <Svg name="end" />
        </Button>
      </div>
      <Segmented
        label="Speed"
        value={pb.speed}
        onChange={pb.setSpeed}
        options={SPEEDS.map(v => ({ value: v, label: `${v}×` }))}
      />
      <span className={s.counter} aria-live="off">
        Round <b>{Math.min(total, pb.cursor + (pb.phase === 'idle' ? 0 : 1))}</b>
        <span> / {total}</span>
      </span>
    </div>
  );
}

export function Stone({ move, size = 18, noisy }: { move: 'C' | 'D'; size?: number; noisy?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={s.stone} aria-label={move === 'C' ? 'cooperate' : 'defect'}>
      <circle cx="10" cy="10" r="8" fill={move === 'C' ? 'var(--stone-c)' : 'var(--stone-d)'} stroke="var(--ink)" strokeWidth="2" />
      {noisy && <circle cx="10" cy="10" r="9.2" fill="none" stroke="var(--alert)" strokeWidth="1.6" strokeDasharray="2.4 2" />}
    </svg>
  );
}

export function Cite({ children }: { children: ReactNode }) {
  return <span className={s.cite}>{children}</span>;
}
