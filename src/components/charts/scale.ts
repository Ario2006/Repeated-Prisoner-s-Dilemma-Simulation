/** Round tick values ("nice numbers", Heckbert 1990). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (max <= min) return [min];
  const span = niceNum(max - min, false);
  const step = niceNum(span / Math.max(1, count - 1), true);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

function niceNum(x: number, round: boolean) {
  const e = Math.floor(Math.log10(x));
  const f = x / 10 ** e;
  const nf = round ? (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) : f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * 10 ** e;
}

export const fmt = (v: number) => {
  const a = Math.abs(v);
  if (a >= 10000) return `${Math.round(v / 1000)}K`;
  if (Number.isInteger(v)) return v.toLocaleString('en-US');
  return a < 10 ? v.toFixed(2) : Math.round(v).toLocaleString('en-US');
};

export const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;

/** Pick white or ink text for a label sitting inside a coloured fill. */
export function textOn(hex: string) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#18202e' : '#ffffff';
}
