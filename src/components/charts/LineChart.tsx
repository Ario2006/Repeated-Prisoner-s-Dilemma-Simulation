import { useMemo, useState, type ReactNode } from 'react';
import { useSize } from '../../hooks/useSize';
import { niceTicks, fmt } from './scale';
import s from './charts.module.css';

export interface Series {
  id: string;
  label: string;
  color: string;
  points: [number, number][];
  /** Thin, muted reference line (e.g. "if both always cooperated"). */
  reference?: boolean;
}

export interface Band {
  from: number;
  to: number;
  label: string;
}

export interface LineChartProps {
  series: Series[];
  xDomain: [number, number];
  yDomain?: [number, number];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  formatX?: (v: number) => string;
  formatY?: (v: number) => string;
  /** Vertical markers: [x, label]. */
  markers?: [number, string][];
  bands?: Band[];
  /** Point markers drawn on a series at given x (e.g. the generosity chosen). */
  dots?: { x: number; seriesId: string }[];
  legend?: boolean;
  markerAt?: 'top' | 'bottom';
  children?: ReactNode;
  ariaLabel: string;
}

const M = { top: 26, right: 18, bottom: 34, left: 48 };

/** Value of a series at x (linear interpolation; step-free). */
function valueAt(points: [number, number][], x: number): number | null {
  if (!points.length || x < points[0][0] || x > points[points.length - 1][0]) return null;
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid][0] <= x) lo = mid;
    else hi = mid;
  }
  const [x0, y0] = points[lo];
  const [x1, y1] = points[hi];
  return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

export function LineChart({
  series,
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  height = 260,
  formatX = fmt,
  formatY = fmt,
  markers = [],
  bands = [],
  dots = [],
  legend = true,
  markerAt = 'top',
  ariaLabel,
}: LineChartProps) {
  const [ref, { width }] = useSize<HTMLDivElement>();
  const [hoverX, setHoverX] = useState<number | null>(null);
  const W = Math.max(width, 200);
  const iw = W - M.left - M.right;
  const ih = height - M.top - M.bottom;

  const yd = useMemo<[number, number]>(() => {
    if (yDomain) return yDomain;
    let max = 0;
    series.forEach(sr => sr.points.forEach(p => (max = Math.max(max, p[1]))));
    return [0, max || 1];
  }, [series, yDomain]);
  const yTicks = niceTicks(yd[0], yd[1], 5);
  const yMax = Math.max(yd[1], yTicks[yTicks.length - 1]);
  const xTicks = niceTicks(xDomain[0], xDomain[1], Math.max(2, Math.min(7, Math.floor(iw / 80)))).filter(
    t => t >= xDomain[0] - 1e-9 && t <= xDomain[1] + 1e-9,
  );
  const sx = (x: number) => M.left + ((x - xDomain[0]) / (xDomain[1] - xDomain[0] || 1)) * iw;
  const sy = (y: number) => M.top + ih - ((y - yd[0]) / (yMax - yd[0] || 1)) * ih;

  const path = (pts: [number, number][]) => {
    if (!pts.length) return '';
    // Thin very long series to ~2 points per pixel.
    const stepEvery = Math.max(1, Math.floor(pts.length / (iw * 2)));
    let d = '';
    for (let i = 0; i < pts.length; i += stepEvery) d += `${d ? 'L' : 'M'}${sx(pts[i][0]).toFixed(1)},${sy(pts[i][1]).toFixed(1)}`;
    const lastP = pts[pts.length - 1];
    d += `L${sx(lastP[0]).toFixed(1)},${sy(lastP[1]).toFixed(1)}`;
    return d;
  };

  // End labels only when they don't collide; otherwise the legend carries identity.
  const ends = series
    .filter(sr => !sr.reference && sr.points.length)
    .map(sr => ({ sr, y: sy(sr.points[sr.points.length - 1][1]), x: sx(sr.points[sr.points.length - 1][0]) }));
  const sorted = [...ends].sort((a, b) => a.y - b.y);
  const labelsFit = sorted.every((e, i) => i === 0 || e.y - sorted[i - 1].y > 15);

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - r.left;
    const x = xDomain[0] + (px / r.width) * (xDomain[1] - xDomain[0]);
    setHoverX(Math.max(xDomain[0], Math.min(xDomain[1], x)));
  };

  const hover =
    hoverX !== null
      ? series
          .map(sr => ({ sr, v: valueAt(sr.points, hoverX) }))
          .filter((h): h is { sr: Series; v: number } => h.v !== null)
      : [];
  const tipLeft = hoverX !== null ? sx(hoverX) : 0;

  return (
    <div className={s.chart}>
      {legend && series.length > 1 && (
        <ul className={s.legend}>
          {series.map(sr => (
            <li key={sr.id}>
              <i className={sr.reference ? s.keyRef : s.keyLine} style={{ background: sr.color }} />
              {sr.label}
            </li>
          ))}
        </ul>
      )}
      <div ref={ref} className={s.plot} style={{ height }}>
        {width > 0 && (
          <svg width={W} height={height} role="img" aria-label={ariaLabel}>
            {bands.map(b => (
              <g key={b.label}>
                <rect x={sx(b.from)} y={M.top} width={sx(b.to) - sx(b.from)} height={ih} className={s.band} />
                <text x={sx(b.from) + 6} y={M.top + ih - 8} className={s.bandLabel}>
                  {b.label}
                </text>
              </g>
            ))}
            {yTicks.map(t => (
              <g key={`y${t}`}>
                <line x1={M.left} x2={M.left + iw} y1={sy(t)} y2={sy(t)} className={s.grid} />
                <text x={M.left - 8} y={sy(t)} className={s.tickY}>
                  {formatY(t)}
                </text>
              </g>
            ))}
            {xTicks.map(t => (
              <text key={`x${t}`} x={sx(t)} y={M.top + ih + 18} className={s.tickX}>
                {formatX(t)}
              </text>
            ))}
            <line x1={M.left} x2={M.left + iw} y1={M.top + ih} y2={M.top + ih} className={s.axis} />
            {yLabel && (
              <text x={4} y={M.top - 12} className={s.axisLabel}>
                {yLabel}
              </text>
            )}
            {xLabel && (
              <text x={M.left + iw} y={height - 2} className={s.axisLabel} textAnchor="end">
                {xLabel}
              </text>
            )}
            {markers.map(([x, label]) => (
              <g key={label}>
                <line x1={sx(x)} x2={sx(x)} y1={M.top} y2={M.top + ih} className={s.marker} />
                <text x={sx(x) + 5} y={markerAt === 'top' ? M.top + 12 : M.top + ih - 8} className={s.markerLabel}>
                  {label}
                </text>
              </g>
            ))}
            {series.map(sr => (
              <path
                key={sr.id}
                d={path(sr.points)}
                fill="none"
                stroke={sr.reference ? 'var(--ink-3)' : sr.color}
                strokeWidth={sr.reference ? 1.25 : 2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {ends.map(({ sr, x, y }) => (
              <circle key={`e${sr.id}`} cx={x} cy={y} r={4.5} fill={sr.color} stroke="var(--sheet)" strokeWidth={2} />
            ))}
            {dots.map(d => {
              const sr = series.find(q => q.id === d.seriesId);
              const v = sr && valueAt(sr.points, d.x);
              return v == null || !sr ? null : (
                <circle key={`d${d.seriesId}${d.x}`} cx={sx(d.x)} cy={sy(v)} r={6} fill={sr.color} stroke="var(--ink)" strokeWidth={2} />
              );
            })}
            {labelsFit &&
              ends.map(({ sr, x, y }) => (
                <text key={`l${sr.id}`} x={Math.min(x + 8, M.left + iw + 4)} y={y} className={s.endLabel} textAnchor={x > M.left + iw - 60 ? 'end' : 'start'} dx={x > M.left + iw - 60 ? -14 : 0} dy={-10}>
                  {sr.label} {formatY(sr.points[sr.points.length - 1][1])}
                </text>
              ))}
            {hoverX !== null && (
              <g pointerEvents="none">
                <line x1={tipLeft} x2={tipLeft} y1={M.top} y2={M.top + ih} className={s.crosshair} />
                {hover.map(h => (
                  <circle key={h.sr.id} cx={tipLeft} cy={sy(h.v)} r={4.5} fill={h.sr.reference ? 'var(--ink-3)' : h.sr.color} stroke="var(--sheet)" strokeWidth={2} />
                ))}
              </g>
            )}
            <rect
              x={M.left}
              y={M.top}
              width={iw}
              height={ih}
              fill="transparent"
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => setHoverX(null)}
            />
          </svg>
        )}
        {hoverX !== null && hover.length > 0 && (
          <div className={s.tooltip} style={{ left: tipLeft, transform: `translateX(${tipLeft > W / 2 ? 'calc(-100% - 12px)' : '12px'})` }}>
            <b>
              {xLabel ? `${xLabel} ` : ''}
              {formatX(Math.round(hoverX))}
            </b>
            {hover.map(h => (
              <span key={h.sr.id}>
                <i style={{ background: h.sr.reference ? 'var(--ink-3)' : h.sr.color }} />
                {h.sr.label}
                <em>{formatY(h.v)}</em>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
