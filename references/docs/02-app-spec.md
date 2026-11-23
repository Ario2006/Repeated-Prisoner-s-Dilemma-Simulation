# 02. App Spec

## 1. Product summary
An interactive, animated web app that teaches the repeated prisoner's dilemma. Hand-drawn stick-figure characters, each embodying a famous strategy, play against each other for coins handed out by a Banker. Users can watch single matches, run Axelrod-style tournaments, toggle noise, and see evolutionary population dynamics. Audience: curious general public, students. Tone: playful, clear, a little dramatic.

## 2. Modes (each is a screen/tab)
| # | Mode | Purpose | Priority |
|---|---|---|---|
| 1 | **Match Arena** | Two characters play N rounds with animated coins, move cards, bubbles. Human can also play against a character ("You" slot). | MUST |
| 2 | **Tournament** | Round robin of selected characters (each vs every other + itself), live leaderboard, winner trophy. | MUST |
| 3 | **Evolution** | Population shares over generations as a stacked area chart; extinction markers. | MUST |
| 4 | **Noise Lab** | Same as Match/Tournament with a noise slider; shows echo effects; Generous TFT comparison. (Implemented as a *setting* available in modes 1-3 plus a guided preset.) | MUST |
| 5 | **Story intro** | 4-6 short animated cards: Cold War -> dilemma -> impalas -> "what's the best strategy?". | SHOULD |
| 6 | **Island (spatial)** | Grid of cells; neighbours play; strategy imitation. Shows cooperation spreading from a cluster. | COULD |

## 3. Functional requirements
- **FR-1** Select any two strategies (and optionally "Human") for Match Arena. Controls: Play, Pause, Step, Fast, Reset, speed slider (0.25x to 16x).
- **FR-2** Match settings: rounds (default 200, range 1-1000), `randomLength` toggle (default OFF in Arena for clarity, ON in Tournament presets mimicking Axelrod round 2), noise (0-20%, default 0), RNG seed (default random, user-editable, shown on screen for reproducibility).
- **FR-3** Per-round animation (see UI spec): both characters reveal move cards simultaneously, Banker pays coins per the payoff matrix, running scores update, history strip appends an icon.
- **FR-4** Tournament: choose 2-9 characters (default: the 6 core characters), run, show a leaderboard that re-sorts with animation, a matchup heat-map (avg points per round for row vs column), winner trophy. "Run again with new seed" and "Run 5 times" (average) buttons.
- **FR-5** Evolution: starts from the tournament average-score matrix; runs up to 1000 generations; play/pause/scrub; stacked area chart + live share bars on character portraits; characters under 0.01% share show the extinct marker.
- **FR-6** Noise: when a move is flipped, show `icon-noise` flash on the actor and a "Whoops!" bubble; log it in history strip with a small marker. Offer one-click preset "Tit for Tat vs Tit for Tat, 5% noise" and "swap in Generous TFT".
- **FR-7** Human play: two big buttons (Cooperate/Defect) using `card-cooperate` / `card-defect`; opponent's strategy is hidden until the end, then revealed with its character-bible blurb. Game length unknown to player when `randomLength` is ON.
- **FR-8** "Why?" panel: after any run, show 2-4 auto-generated insight lines (e.g. "Tit for Tat never beat anyone in a head-to-head but came 1st overall", "Echo effect detected: alternating defections for 14 rounds").
- **FR-9** Info drawer with strategy rules, payoff matrix, and the four Axelrod qualities. Opened by `btn-info`.
- **FR-10** Everything deterministic given the seed (engine uses the seeded RNG).
- **FR-11** Persist last-used settings in localStorage; share-link encodes settings + seed in the URL hash.

## 4. Game rules (authoritative; see `engine/engine.reference.js`)
- Payoffs: `CC 3/3, CD 0/5, DC 5/0, DD 1/1`. Constants must live in one place and drive both engine and UI.
- A strategy sees only the history of *executed* moves (its own and the opponent's), the round index, and an RNG. It must not see the end of the game.
- **Noise model (default: execution error):** with probability `noise` each player's intended move is flipped when executed. Payoffs and both histories use the executed move. Optional setting `noiseMode: 'execution' | 'perception'`; in perception mode only the *opponent's view* of the move is flipped while payoff uses the true move. Default `execution`.
- **Random length:** after each round the game ends with probability `1/meanRounds` (mean 200). Fixed length: exactly `rounds`.
- Tournament scoring: average points per round, averaged over all opponents including the strategy's own copy (as in Axelrod). Show total points too.
- Evolution: `share_i' = share_i * fitness_i / meanFitness`, `fitness_i = sum_j share_j * avg[i][j]`. No mutation. Normalise each generation. Mark extinct below 1e-4.

## 5. Data model (TypeScript)
```ts
type Move = 'C' | 'D';
interface StrategyDef { id: string; name: string; nice: boolean; blurb: string; move(ctx: Ctx): Move; characterId: string; }
interface Ctx { round: number; my: Move[]; opp: Move[]; rng: () => number; }
interface RoundRow { round: number; intended: [Move, Move]; executed: [Move, Move]; gain: [number, number]; total: [number, number]; noisy: [boolean, boolean]; }
interface MatchResult { scoreA: number; scoreB: number; rounds: number; rows: RoundRow[]; }
interface Settings { rounds: number; randomLength: boolean; noise: number; noiseMode: 'execution'|'perception'; seed: number; speed: number; }
interface TournamentResult { avg: Record<string, Record<string, number>>; ranking: {id: string; score: number}[]; }
```

## 6. Architecture
- **Engine** (`/src/engine`): pure TypeScript port of `engine.reference.js`. Zero DOM. Unit-tested.
- **Playback layer** (`/src/playback`): turns a `MatchResult.rows` into a timed event stream (reveal -> payoff -> update), driven by a speed multiplier; supports pause/step/scrub. Engine computes the whole match up front; UI replays it. (For Human play, compute round by round.)
- **UI layer**: components render assets from `/assets`. SVGs are inlined (not `<img>`) for characters so parts can be animated and expressions swapped.
- **State**: small store (Zustand or React context). Settings, selected strategies, current result, playback cursor.

## 7. Recommended stack (override only with a reason)
React 18 + TypeScript + Vite; Zustand; CSS variables + CSS modules; Web Animations API or Framer Motion for sequencing (CSS keyframes for idle loops already live inside the SVGs); Recharts or hand-rolled SVG for the stacked-area and heat-map; Vitest for engine tests; no backend; deploys as static files.

Suggested structure:
```
src/
  engine/        strategies.ts, match.ts, tournament.ts, evolution.ts, rng.ts, *.test.ts
  playback/      timeline.ts, usePlayback.ts
  assets/        copy of references/assets (import SVGs as raw strings via ?raw)
  components/    Character, Banker, MoveCard, CoinFlight, HistoryStrip, Scoreboard, Leaderboard, PayoffMatrix, HeatMap, EvolutionChart, Controls, SettingsPanel, InfoDrawer
  screens/       Home, MatchArena, Tournament, Evolution, Story
  styles/        tokens.css, global.css
```

## 8. Non-functional requirements
- 60 fps on a mid-range laptop with 2 characters animating; Tournament/Evolution computation < 1 s for 9 strategies x 200 rounds (run in a Web Worker if needed).
- Responsive from 360 px wide phones to 1440 px desktop (see UI spec).
- Accessible: keyboard operable controls, visible focus, `aria-live` region announcing each round result, `prefers-reduced-motion` disables idle loops and coin flights (show instant updates).
- Works offline after first load; no external requests except the Google Font (with fallbacks).

## 9. Out of scope
User accounts, multiplayer over network, user-authored strategies (a "build your own strategy" editor is a stretch goal), mobile app packaging.

## 10. Stretch ideas
Strategy builder (sliders: niceness, forgiveness, retaliation, randomness); Cold-War "gradual disarmament" scenario; sound effects (coin clink, card flip) with mute; export tournament as PNG/CSV.
