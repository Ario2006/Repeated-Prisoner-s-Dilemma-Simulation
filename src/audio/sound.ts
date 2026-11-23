/**
 * Synthesised sound effects (Web Audio, no files). Every voice is a short enveloped
 * oscillator or filtered noise burst routed through one master gain and a compressor,
 * so overlapping coins never clip.
 */
type Ctx = AudioContext;

class Sound {
  private ctx: Ctx | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private listeners = new Set<(on: boolean) => void>();
  enabled = true;

  constructor() {
    try {
      this.enabled = localStorage.getItem('sotf:sound') !== 'off';
    } catch {
      /* storage unavailable */
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    try {
      localStorage.setItem('sotf:sound', on ? 'on' : 'off');
    } catch {
      /* ignore */
    }
    if (on) this.ensure();
    this.listeners.forEach(l => l(on));
  }

  subscribe(l: (on: boolean) => void) {
    this.listeners.add(l);
    return () => void this.listeners.delete(l);
  }

  private ensure(): Ctx | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 6;
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(comp).connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, opts: { type?: OscillatorType; at?: number; dur?: number; gain?: number; attack?: number; glide?: number } = {}) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const { type = 'sine', at = 0, dur = 0.2, gain = 0.3, attack = 0.004, glide } = opts;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private hiss(opts: { at?: number; dur?: number; freq?: number; q?: number; gain?: number; type?: BiquadFilterType } = {}) {
    const ctx = this.ensure();
    if (!ctx || !this.master || !this.noiseBuf) return;
    const { at = 0, dur = 0.06, freq = 3000, q = 1.2, gain = 0.25, type = 'bandpass' } = opts;
    const t0 = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /** A single coin: two inharmonic partials, like struck metal. */
  coin(at = 0, pitch = 1) {
    this.tone(1975 * pitch, { at, dur: 0.16, gain: 0.16, type: 'triangle' });
    this.tone(2637 * pitch, { at: at + 0.012, dur: 0.24, gain: 0.12 });
    this.tone(5270 * pitch, { at: at + 0.012, dur: 0.05, gain: 0.03 });
  }

  /** n coins, rising in pitch so you can hear the count. */
  coins(n: number, side: 0 | 1 = 0) {
    for (let i = 0; i < n; i++) this.coin(i * 0.075 + side * 0.03, 1 + i * 0.045 + side * 0.02);
  }

  flip() {
    this.hiss({ dur: 0.05, freq: 2400, q: 0.8, gain: 0.18 });
    this.hiss({ at: 0.06, dur: 0.04, freq: 3800, q: 1, gain: 0.12 });
  }

  /** Reveal: soft wooden knock for cooperate, low dull thud for defect. */
  reveal(a: 'C' | 'D', b: 'C' | 'D') {
    [a, b].forEach((m, i) => {
      if (m === 'C') this.tone(i ? 784 : 659, { at: i * 0.02, dur: 0.22, gain: 0.16, type: 'sine' });
      else this.tone(i ? 147 : 131, { at: i * 0.02, dur: 0.2, gain: 0.26, type: 'square', glide: 90 });
    });
  }

  /** A move got flipped by noise: a downward glitch. */
  glitch() {
    this.tone(1200, { dur: 0.22, gain: 0.08, type: 'sawtooth', glide: 160 });
    this.hiss({ dur: 0.12, freq: 900, q: 4, gain: 0.12 });
  }

  click() {
    this.hiss({ dur: 0.025, freq: 5200, q: 2, gain: 0.08 });
  }

  /** Winner fanfare: a major arpeggio. */
  win() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, { at: i * 0.09, dur: 0.42, gain: 0.15, type: 'triangle' }));
  }

  /** Something went extinct / a sad outcome. */
  sad() {
    this.tone(392, { dur: 0.3, gain: 0.12, type: 'triangle', glide: 330 });
    this.tone(311, { at: 0.18, dur: 0.45, gain: 0.12, type: 'triangle', glide: 262 });
  }

  /** Short UI whoosh for chapter turns. */
  page() {
    this.hiss({ dur: 0.18, freq: 1400, q: 0.6, gain: 0.07, type: 'lowpass' });
  }
}

export const sound = new Sound();
