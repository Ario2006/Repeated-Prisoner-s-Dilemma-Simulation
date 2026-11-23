import { useEffect, useRef } from 'react';
import type { RoundRow } from '../engine';
import { useSize } from '../hooks/useSize';
import s from './HistoryStrip.module.css';

/**
 * The whole match as two lanes of stones (white = cooperate, ink = defect).
 * Long matches compress into a barcode where patterns — echoes, grudges — jump out.
 */
export function HistoryStrip({
  rows,
  total,
  labels,
  colors,
  highlight,
  lane = 20,
}: {
  rows: RoundRow[];
  total: number;
  labels: [string, string];
  colors: [string, string];
  highlight?: { start: number; length: number } | null;
  lane?: number;
}) {
  const [ref, { width }] = useSize<HTMLDivElement>();
  const scroller = useRef<HTMLDivElement>(null);
  const cell = Math.max(3, Math.min(20, width / Math.max(1, total)));
  const W = Math.max(width, cell * total);
  const big = cell >= 11;
  const gap = cell >= 4 ? 1 : 0;
  const H = lane * 2 + 10;

  useEffect(() => {
    const el = scroller.current;
    if (el && W > width) el.scrollLeft = el.scrollWidth;
  }, [rows.length, W, width]);

  return (
    <div className={s.wrap}>
      <div className={s.labels} style={{ height: H }}>
        {labels.map((l, i) => (
          <span key={i} style={{ height: lane }}>
            <i style={{ background: colors[i] }} />
            {l}
          </span>
        ))}
      </div>
      <div ref={ref} className={s.sizer}>
        <div ref={scroller} className={s.scroll}>
          {width > 0 && (
            <svg width={W} height={H} role="img" aria-label={`Move history, ${rows.length} rounds`}>
              {highlight && highlight.length > 0 && (
                <rect x={highlight.start * cell - 1} y={0} width={highlight.length * cell + 2} height={H} rx={4} className={s.highlight} />
              )}
              {[0, 1].map(p => (
                <rect key={p} x={0} y={p * (lane + 6) + 2} width={cell * total} height={lane} rx={lane / 2.5} className={s.lane} />
              ))}
              {rows.map((r, i) =>
                [0, 1].map(p => {
                  const m = r.executed[p];
                  const x = i * cell;
                  const y = p * (lane + 6) + 2;
                  const noisy = r.noisy[p];
                  const fill = m === 'C' ? 'var(--stone-c)' : 'var(--stone-d)';
                  return (
                    <g key={`${i}-${p}`}>
                      {big ? (
                        <circle cx={x + cell / 2} cy={y + lane / 2} r={Math.min(cell, lane) / 2 - 2} fill={fill} stroke="var(--ink)" strokeWidth={1.5} />
                      ) : (
                        <rect x={x + gap / 2} y={y + 3} width={cell - gap} height={lane - 6} rx={Math.min(2, cell / 3)} fill={fill} />
                      )}
                      {noisy && (
                        <rect x={x + cell / 2 - 1.5} y={p === 0 ? y - 3 : y + lane} width={3} height={3.5} rx={1} fill="var(--alert)" />
                      )}
                    </g>
                  );
                }),
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
