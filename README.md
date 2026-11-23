# Repeated Prisoner’s Dilemma

An interactive, research-backed story of the **repeated prisoner’s dilemma**: why selfish players can learn to cooperate.

It has two parts:

- **Story**: 5 animated slides built to present in class: one round, repeated play, Tit for Tat, Axelrod’s tournament, then a hand-off to the lab. Each slide reveals its points one at a time and has a live simulation beside the text.
- **Lab**: a sandbox with three experiments: Match (with noise), Tournament, and Islands.

Every number on screen is computed live by a small, tested game engine. Nothing is pre-recorded.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 19 engine tests, including every claim the story makes
npm run build    # type-check and build a static site into dist/
```

## Presenting

Open the Story and use the keyboard:

| Key | Action |
|---|---|
| → / Space / PageDown | next point, then next chapter |
| ← / PageUp | back |
| N | speaker notes (facts, formulas, prompts for the class) |
| F | full screen |
| L | open the lab |
| Home / End | first / last chapter |

Every slide has its own link (`#/story/dilemma`, `#/story/tournament`, …), and each lab tab does too (`#/lab/match`, `#/lab/tournament`, `#/lab/islands`). **[`docs/Presentation Guide.pdf`](docs/Presentation%20Guide.pdf)** is the full 12–15 minute script: timing, what to click and say on each slide, the three lab demos with expected results, and likely questions.

## The model

| Piece | Rule |
|---|---|
| Payoffs | Temptation 5, Reward 3, Punishment 1, Sucker 0 (Axelrod’s values). Defined once in `src/engine/payoffs.ts`. |
| Strategies | Each sees only the moves actually played so far, never how many rounds remain. |
| Noise | Execution error: each intended move flips with probability *p*. |
| Hidden length | After each round the game ends with probability 1/mean. In tournaments, each replay draws one hidden length shared by all pairings, as in Axelrod’s second tournament. |
| Tournament | Round robin including self-play, 5 replays, scored as average points per round. |
| Islands | Torus grid. Each cell plays a 10-round match with its 8 neighbours, then copies the best scorer around it (Nowak & May, 1992). |

Seeds are fixed in `src/story/seeds.ts`, so the story tells the same story every time. The lab lets you change them.

## The cast

| Character | Rule | Source |
|---|---|---|
| Tit for Tat | Cooperate first, then copy the opponent’s last move | Rapoport; won both 1980 tournaments |
| Tit for Two Tats | Defect only after two defections in a row | Axelrod’s sample program |
| Pavlov | Win–stay, lose–shift | Nowak & Sigmund (1993) |
| Generous TFT | Tit for Tat that forgives 10% of defections (adjustable) | Molander (1985); Nowak & Sigmund (1992) |
| Always Cooperate | Always cooperate | baseline |
| Friedman | Cooperate until crossed once, then defect forever | J. W. Friedman |
| Joss | Tit for Tat with 10% sneaky defections | J. Joss |
| Always Defect | Always defect | baseline |
| Tester | Probe with a defection; apologise to retaliators, exploit pushovers | D. Gladstein |
| Random | 50/50 | Axelrod’s baseline |

## Project layout

```
src/
  engine/       Pure TypeScript game theory: payoffs, strategies, match, tournament,
                evolution, spatial grid, analysis. No DOM. Unit-tested.
  characters/   The cast as React SVG components: one rig, distinct shapes, moods, reactions.
  audio/        Synthesised sound effects (Web Audio; no audio files).
  hooks/        Playback timeline, sizing, reduced motion, sound toggle.
  components/   Match stage, payoff matrix, history strip, charts, tournament board,
                island grid, controls.
  story/        The 5 slides (narrative, beats, notes, sources), figures, seeds, citations.
  lab/          The sandbox.
  styles/       Design tokens and base styles.
docs/
  Presentation Guide.pdf   Slide-by-slide script and lab walkthrough.
  PRESENTATION.md          The same guide in short form.
  guide-assets/            Source HTML and screenshots for the PDF.
references/         The original brief and assets (kept for reference).
```

## Design

The page is ledger paper and ink, with one gold reserved for the banker’s coins. Moves are **stones**, white for cooperate and ink for defect. That reads on any projector and doesn’t depend on colour vision. Each strategy has its own shape and a colour from a palette validated for colour-vision deficiency. Type is Bricolage Grotesque for the interface and Newsreader for the story. The app respects `prefers-reduced-motion`, works with the keyboard, has visible focus and `aria-live` round announcements, and lays out down to a 360 px phone.
