import { PAYOFFS, type Move } from '../engine';
import { Stone } from './ui';
import s from './PayoffMatrix.module.css';

export type Cell = `${Move}${Move}`;

interface Side {
  label: string;
  color: string;
}

export interface PayoffMatrixProps {
  a: Side;
  b: Side;
  /** The cell being played right now. */
  active?: Cell | null;
  /** Fade everything outside this column (B's move). */
  focusCol?: Move | null;
  /** Ring a set of cells: best reply (gold) or a comparison (outline). */
  marks?: Partial<Record<Cell, 'best' | 'compare' | 'ghost'>>;
  onPick?: (cell: Cell) => void;
  compact?: boolean;
  caption?: string;
}

const MOVES: Move[] = ['C', 'D'];
const word = (m: Move) => (m === 'C' ? 'cooperates' : 'defects');

export function PayoffMatrix({ a, b, active, focusCol, marks = {}, onPick, compact, caption }: PayoffMatrixProps) {
  return (
    <figure className={`${s.wrap} ${compact ? s.compact : ''}`}>
      <div className={s.grid} role="table" aria-label={caption ?? `Payoffs for ${a.label} and ${b.label}`}>
        <div className={s.corner} role="presentation">
          <span className={s.who}>
            <i style={{ background: b.color }} /> {b.label}
          </span>
          <span className={s.who}>
            <i style={{ background: a.color }} /> {a.label}
          </span>
        </div>
        {MOVES.map(m => (
          <div key={`h${m}`} className={`${s.colHead} ${focusCol && focusCol !== m ? s.faded : ''}`} role="columnheader">
            <Stone move={m} size={compact ? 14 : 18} /> {word(m)}
          </div>
        ))}
        {MOVES.map(ra => (
          <div key={`r${ra}`} className={s.row} role="row">
            <div className={s.rowHead} role="rowheader">
              <Stone move={ra} size={compact ? 14 : 18} /> {word(ra)}
            </div>
            {MOVES.map(cb => {
              const cell = `${ra}${cb}` as Cell;
              const [pa, pb] = PAYOFFS[cell];
              const faded = focusCol && focusCol !== cb;
              const mark = marks[cell];
              const cls = [s.cell, active === cell && s.active, faded && s.faded, mark && s[mark], onPick && s.pickable]
                .filter(Boolean)
                .join(' ');
              const Tag = onPick ? 'button' : 'div';
              return (
                <Tag
                  key={cell}
                  className={cls}
                  role="cell"
                  onClick={onPick ? () => onPick(cell) : undefined}
                  aria-label={`${a.label} ${word(ra)}, ${b.label} ${word(cb)}: ${a.label} gets ${pa}, ${b.label} gets ${pb}`}
                >
                  <span className={s.pa}>
                    <i style={{ background: a.color }} />
                    {pa}
                  </span>
                  <span className={s.pb}>
                    <i style={{ background: b.color }} />
                    {pb}
                  </span>
                </Tag>
              );
            })}
          </div>
        ))}
      </div>
      {caption && <figcaption className={s.caption}>{caption}</figcaption>}
    </figure>
  );
}
