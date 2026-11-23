# 03. UI Spec

Hand-drawn doodle aesthetic: kraft-paper background, thick black marker outlines, mustard-gold accents. All art is supplied in `assets/`; **do not redraw it**. Use the SVG files as-is and compose with CSS.

## 1. Design tokens (`styles/tokens.css`)
```css
:root{
  --paper:#f0dfb7;  --paper-light:#f6ecd2; --ink:#111; --white:#fff;
  --gold:#e0a526;   --gold-light:#f2c14e;
  --coop:#4aa3df;   --coop-bg:#d9eefb;
  --defect:#c8312b; --defect-bg:#f7d6d2;
  --neutral-bg:#f6e1b5; --track:#cfc6b0;
  --radius:14px; --stroke:4px;
  --font: 'Patrick Hand','Segoe Print','Comic Sans MS',cursive; /* load Patrick Hand from Google Fonts, 400 */
  --ease-pop: cubic-bezier(.34,1.56,.64,1);
}
```
Dark mode: keep the paper look (it is the brand). Only chrome outside the stage may darken. Not required.

Typography: all UI text in `--font`. Sizes: title 44-64, section header 28, body 18, labels 16, numbers (scores) 28-34 bold. Use uppercase for names and buttons.

Line style: 4px ink outlines on panels and buttons, rounded joins. Subtle drop shadow: `filter: drop-shadow(0 3px 0 rgba(0,0,0,.18))`.

Background: tile `assets/ui/bg-kraft-tile.svg` as a repeating `background-image` on the app root.

## 2. Layout
### Global
Top bar (height 64): logo (small, left), mode tabs (Match / Tournament / Evolution / Story), `btn-info`, `btn-settings` (right). Content area below. Max content width 1200.

### Match Arena (desktop >= 1024)
```
+--------------------------------------------------------------+
| Round counter (center)                       [Noise toggle]  |
|                                                              |
|  [Character A 300x500]   [Banker + chest]   [Character B]    |
|   score + coin-stack      payoff matrix       score + coin   |
|   bubble above head       (live highlight)    bubble above   |
|                                                              |
|  History strip A: row of icon-cooperate / icon-defect        |
|  History strip B: same                                       |
|  Controls: Reset  Step  Play/Pause  Fast   Speed slider      |
+--------------------------------------------------------------+
```
- Characters face the centre; mirror Character B with `transform: scaleX(-1)` (flip any text labels back or hide the label).
- Banker stands centre-back at ~60% scale; chest sits at his feet. Payoff matrix panel (`payoff-matrix` as visual reference; render live version in HTML/SVG from `PAYOFFS`) sits below him and highlights the active cell.
- Mobile (<720): stack vertically: counter, both characters side by side at 45% scale, banker + matrix collapsed to a compact 2x2, history strips scroll horizontally, controls pinned to bottom.

### Tournament
Left: character picker (checkbox portraits at 40% scale). Centre: `panel-scoreboard` with leaderboard rows (rebuild `leaderboard-row` dynamically; bar fill proportional to score). Right/below: heat-map grid (rows vs columns, colour from `--defect-bg` (low) through `--neutral-bg` to `--coop-bg` (high), number inside). Winner: `icon-trophy` drops onto the top row, winner character plays its `bob` animation at 120% scale in a corner.

### Evolution
Large stacked-area chart (x: generation, y: share 0-100%), colour per strategy = that character's tie colour. Below the chart: row of character thumbnails with live % labels; extinct ones get `icon-extinct` overlay and 40% opacity. Timeline scrubber + play/pause.

### Story
Full-screen cards (one idea each) with a character or banker illustration, 1-2 sentences, `Next` button, progress dots. Copy in section 7.

### Info drawer
Slides from the right (width 380): payoff matrix, four qualities, strategy list with portraits. Close on Esc.

## 3. Component to asset map
| Component | Assets |
|---|---|
| Logo / Home title | `ui/logo.svg` |
| App background | `ui/bg-kraft-tile.svg` |
| Character | `characters/<id>.transparent.svg` (inline) |
| Banker | `characters/banker.transparent.svg`, `ui/chest-closed.svg`, `ui/chest-open.svg` |
| Move card (reveal) | `ui/card-cooperate.svg`, `ui/card-defect.svg` |
| History strip item | `ui/icon-cooperate.svg`, `ui/icon-defect.svg` (24-28 px) |
| Speech bubble | `ui/bubble-empty.svg` + `icon-*`; or `bubble-cooperate/defect.svg` |
| Coins | `ui/coin.svg` (flying), `ui/coin-stack.svg` (score pile) |
| Controls | `btn-play/pause/step/fast/reset/settings/info.svg` (48-56 px) |
| Toggle | `ui/toggle-on.svg`, `toggle-off.svg` |
| Noise flash | `ui/icon-noise.svg` |
| Panels | `ui/panel-frame.svg`, `ui/panel-scoreboard.svg` (use as CSS `border-image` or an absolutely positioned background) |
| Leaderboard | `ui/leaderboard-row.svg` as the template, rebuilt in HTML/SVG |
| Round counter | `ui/round-counter.svg` (template; render text dynamically) |
| Progress | `ui/progress-track.svg` as the template |
| Winner | `ui/icon-trophy.svg` |
| Eliminated | `ui/icon-extinct.svg` |

Template assets (payoff-matrix, leaderboard-row, round-counter, progress-track, panel-*) show the intended look; they contain placeholder text. Rebuild them dynamically in code, matching colours, radii and stroke widths.

## 4. Character rendering rules
- Inline the SVG (not `<img>`) so internal groups can be addressed. Each SVG has ids: `legL legR torso tie body-prop armL armR head eyes brows mouth shadow` and the root group id equals the character id. **IDs repeat when several characters share one HTML document; always query within the character's own `<svg>` element** (`svg.querySelector('#mouth')`), never `document.getElementById`.
- Embedded `<style>` defines idle animations (`bob`, `bobFast`, `float`, `swing`, `wave`, `jab`, head `tilt`, eye `blink`). Class names are generic; scope or rename them if they clash with app CSS.
- Expressions: import `EXPRESSIONS` and `setExpression(svgEl, name)` from `characters.js` (names: `happy`, `hurt`, `angry`, `smug`, `neutral`). See `04-character-bible.md` for when to use each.
- Reaction animations (add in app CSS/WAAPI on the character wrapper): *cheer* = scale 1 -> 1.06 -> 1, 300 ms; *hurt* = translateX shake +/-6 px x3, 300 ms; *smug* = slow tilt; *noise-oops* = rotate -4/+4 deg, 400 ms.
- Sizes: full character 300x500 viewBox; render at 220-300 px wide on desktop. Keep aspect ratio.

## 5. Round animation timeline (at 1x speed; divide by speed multiplier)
| t (ms) | Event |
|---|---|
| 0 | Round counter increments; both characters idle. |
| 0-300 | Move cards slide up from each character, face-down. |
| 400-700 | Both cards flip simultaneously (scaleX 1 -> 0 -> 1, swap to face-up). Ease `--ease-pop`. |
| 700 | Highlight the matching cell in the payoff matrix (gold outline pulse). Characters apply expressions: cooperate -> `happy`; defect -> `smug` for a winner, `hurt` for a sucker, `angry` after mutual defection. |
| 800-1300 | `coin.svg` sprites fly from the chest/Banker to each character's score pile along a curved path (stagger 80 ms); 5 coins max visual, show the number as a `+N` pop. |
| 1300 | Score numbers tick up; history icon appended with a small pop. |
| 1500 | Cards fade out; reset expressions to `neutral`. Total 1.5 s per round at 1x. |

Speeds: 1x = 1.5 s/round; 4x = 0.4 s; at >= 8x skip card flips and coin flights and just tick numbers; at 16x update every frame in batches. Pause finishes the current frame, Step runs one full round, Reset clears everything.

Noise: if `noisy[i]`, before the reveal show `icon-noise` over that character for 400 ms and a bubble "Oops!" (copy below), then continue with the flipped card.

Idle loops pause when the tab is hidden or `prefers-reduced-motion` is set.

## 6. Interaction details
- Buttons: hover = translateY(-2px) + shadow; active = translateY(1px); focus ring 3px `--gold`.
- Toggle (noise): swap `toggle-on/off`; reveal a noise-percentage slider (0-20%, step 1) underneath when ON.
- Slider: custom styled with `--gold` thumb and ink track outline.
- Tooltips on strategy portraits: name + one-line rule + "nice/nasty" tag.
- Heat-map cell hover: "A vs B: 2.8 avg points per round".
- Human play: after choosing, your card flips with the opponent's; opponent identity hidden (`?` silhouette) until the game ends.

## 7. Copy (keep short and playful)
- Home tagline: "Can selfish players learn to cooperate?"
- Banker line before a match: "Cooperate or defect. Choose wisely."
- Noise bubble: "Oops! That was not what I meant."
- Echo detected: "Echo effect! One mistake started a chain of payback."
- Tournament winner: "<Name> wins! Nice guys finish first." (only if the winner is `nice`; otherwise "<Name> wins. Nasty can pay, for a while.")
- Take-away card: "Winning is not about beating the other player. The coins come from the banker."
- Story cards: (1) "1949: the Soviets test a nuclear bomb." (2) "Both sides build more weapons, though both would be safer cooperating." (3) "Impalas groom each other. Grooming costs, but ticks kill." (4) "Play it once and defecting wins. Play it again and again... what is the best strategy?"

## 8. Accessibility & responsive checklist
- Contrast: ink on paper passes AA; never rely on colour alone (cooperate = heart icon + blue, defect = bolt + red).
- All controls have text labels via `aria-label`; announce results via `aria-live="polite"`: "Round 12: Tit for Tat cooperated, Joss defected. Tit for Tat +0, Joss +5."
- Touch targets >= 44 px. Layout breakpoints: 360, 720, 1024, 1440.
