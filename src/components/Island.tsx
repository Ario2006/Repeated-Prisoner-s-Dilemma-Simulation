import { useEffect, useMemo, useRef, useState } from 'react';
import { sound } from '../audio/sound';
import { COLORS } from '../characters/cast';
import { census, encounterTable, nameOf, stepGrid, type Grid, type StrategyId } from '../engine';
import { useSize } from '../hooks/useSize';
import { Button, Svg } from './ui';
import c from './charts/charts.module.css';
import s from './Island.module.css';

export function IslandView({
  ids,
  initial,
  encounterRounds = 10,
  autoplay = false,
  brush,
  stepMs = 380,
}: {
  ids: StrategyId[];
  initial: Grid;
  encounterRounds?: number;
  autoplay?: boolean;
  /** Strategy painted when the grid is clicked. */
  brush?: StrategyId;
  stepMs?: number;
}) {
  const table = useMemo(() => encounterTable(ids, encounterRounds), [ids, encounterRounds]);
  const [grid, setGrid] = useState(initial);
  const [prev, setPrev] = useState<Grid | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ref, { width }] = useSize<HTMLDivElement>();
  const painting = useRef(false);

  useEffect(() => {
    setGrid(initial);
    setPrev(null);
    setT(0);
    setPlaying(autoplay);
  }, [initial, autoplay]);

  const step = () => {
    setGrid(g => {
      const next = stepGrid(g, table).grid;
      setPrev(g);
      return next;
    });
    setT(v => v + 1);
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(step, stepMs);
    return () => clearInterval(id);
  }, [playing, table, stepMs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop when nothing changes any more.
  useEffect(() => {
    if (prev && prev.cells.every((v, i) => v === grid.cells[i])) {
      if (playing) {
        setPlaying(false);
        const top = Object.entries(census(grid)).sort((a, b) => b[1] - a[1])[0];
        if (top && top[1] === grid.cells.length) sound.win();
      }
    } else if (playing && prev) sound.click();
  }, [grid]); // eslint-disable-line react-hooks/exhaustive-deps

  const side = Math.min(width || 0, 460);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !side) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width = side * dpr;
    cv.height = side * dpr;
    const ctx = cv.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const n = grid.size;
    const cs = side / n;
    ctx.fillStyle = '#f6f7f3';
    ctx.fillRect(0, 0, side, side);
    grid.cells.forEach((id, i) => {
      const x = (i % n) * cs;
      const y = Math.floor(i / n) * cs;
      ctx.fillStyle = COLORS[id];
      const pad = cs > 8 ? 1 : 0.5;
      const r = Math.min(3, cs / 4);
      ctx.beginPath();
      ctx.roundRect(x + pad, y + pad, cs - pad * 2, cs - pad * 2, r);
      ctx.fill();
      if (prev && prev.cells[i] !== id) {
        ctx.strokeStyle = '#18202e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [grid, prev, side]);

  const paint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!brush) return;
    const r = e.currentTarget.getBoundingClientRect();
    const n = grid.size;
    const x = Math.floor(((e.clientX - r.left) / r.width) * n);
    const y = Math.floor(((e.clientY - r.top) / r.height) * n);
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    const i = y * n + x;
    if (grid.cells[i] === brush) return;
    const cells = [...grid.cells];
    cells[i] = brush;
    setPrev(null);
    setGrid({ size: n, cells });
  };

  const counts = census(grid);
  const total = grid.cells.length;

  return (
    <div className={s.wrap}>
      <div ref={ref} className={s.canvasBox}>
        <canvas
          ref={canvas}
          style={{ width: side, height: side, cursor: brush ? 'crosshair' : 'default' }}
          onPointerDown={e => {
            painting.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            paint(e);
          }}
          onPointerMove={e => painting.current && paint(e)}
          onPointerUp={() => (painting.current = false)}
          role="img"
          aria-label={`Grid of ${total} cells. ${Object.entries(counts)
            .map(([k, v]) => `${nameOf(k)}: ${v}`)
            .join(', ')}`}
        />
      </div>
      <div className={s.side}>
        <div className={s.controls}>
          <Button variant="primary" onClick={() => setPlaying(p => !p)}>
            <Svg name={playing ? 'pause' : 'play'} /> {playing ? 'Pause' : 'Run'}
          </Button>
          <Button variant="icon" label="Step one generation" onClick={step}>
            <Svg name="step" />
          </Button>
          <Button
            variant="icon"
            label="Reset"
            onClick={() => {
              setPlaying(false);
              setGrid(initial);
              setPrev(null);
              setT(0);
            }}
          >
            <Svg name="reset" />
          </Button>
        </div>
        <p className={s.gen}>
          Generation <b>{t}</b>
        </p>
        <ul className={s.counts}>
          {ids.map(id => (
            <li key={id}>
              <span className={s.countHead}>
                <i className={c.keySwatch} style={{ background: COLORS[id] }} />
                {nameOf(id)}
                <b>{(((counts[id] ?? 0) / total) * 100).toFixed(0)}%</b>
              </span>
              <span className={s.track}>
                <span style={{ width: `${((counts[id] ?? 0) / total) * 100}%`, background: COLORS[id] }} />
              </span>
            </li>
          ))}
        </ul>
        {brush && <p className={s.hint}>Click or drag on the grid to plant {nameOf(brush)}.</p>}
      </div>
    </div>
  );
}
