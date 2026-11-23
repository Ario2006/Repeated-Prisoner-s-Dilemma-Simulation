# 05. Instructions for the AI Coding Agent

## Goal
Build the web app specified in `02-app-spec.md`, styled per `03-ui-spec.md`, populated with the characters in `04-character-bible.md`, using only the art in `assets/` and the logic in `engine/engine.reference.js`.

## Ground rules
1. **Do not redraw or restyle assets.** Compose and animate them. If an asset is missing, say so in `ASSUMPTIONS.md` and use a simple placeholder with the same size.
2. **Engine first, UI second.** Engine has zero DOM dependency and is unit-tested before any UI exists.
3. **One source of truth** for payoffs (`PAYOFFS`) and strategy rules; the UI reads from them.
4. **Determinism:** same seed + settings = identical results.
5. **No secret knowledge of the end:** strategies never receive total rounds.
6. Prefer the recommended stack (React + TS + Vite). Keep dependencies few.
7. When the docs are silent, choose the simplest reasonable option and log it in `ASSUMPTIONS.md`. Don't stop to ask.

## Milestones (do in order; each ends with a runnable state)
**M0. Scaffold.** Vite + React + TS; copy `references/assets` into `src/assets`; load Patrick Hand font; `tokens.css`; kraft background. *Done when:* app opens with logo on kraft paper.

**M1. Engine.** Port `engine.reference.js` to TS (`src/engine`). Tests:
- `playMatch('tit-for-tat','tit-for-tat',{rounds:200})` -> 600 points each, all `CC`.
- `always-defect` vs `always-cooperate`, 200 rounds -> 1000 vs 0.
- `tit-for-tat` vs `always-defect` -> TFT 199, AD 204 (0+199*1 vs 5+199*1).
- `friedman` vs `joss` ends in permanent `DD` after Joss's first sneaky defection.
- `tit-for-two-tats` does not retaliate to a single defection.
- Same seed twice -> identical rows; noise 0 -> no `noisy` flags; noise 1 -> every executed move is flipped.
- `randomLength` games average near `rounds` over many seeds (within ~10%).
- Round robin ranking sanity (qualitative): with all strategies and 0% noise, `always-defect` is in the bottom 2 and a Tit-for-Tat-family strategy is in the top 3. At ~5% noise plain `tit-for-tat` falls and `generous-tit-for-tat` ranks higher than it.
- Evolution shares sum to 1 every generation.

**M2. Character component.** `<Character id expression? flip? />` inlines the transparent SVG, exposes `setExpression`, plays idle loops. A gallery page shows all 9 characters. *Done when:* expressions switch and nothing is clipped.

**M3. Match Arena (core).** Layout, controls, playback timeline (UI spec section 5), move cards, bubbles, coins, scores, history strips, payoff highlight, speed control, step/pause/reset, noise toggle + flash. *Done when:* TFT vs Joss plays 200 rounds smoothly at 1x, 4x and 16x and the final scores match the engine.

**M4. Tournament.** Picker, run, animated leaderboard, heat-map, trophy, "run 5 times". *Done when:* default 6 characters produce a sensible ranking in < 1 s and the "Why?" lines appear.

**M5. Evolution.** Chart + thumbnails + scrubber + extinct markers. *Done when:* shares evolve as per engine, with extinct strategies marked.

**M6. Noise Lab + presets + Human play.** One-click presets from FR-6; human vs strategy with hidden identity and reveal.

**M7. Story intro + Info drawer + copy pass.** Use copy from the UI spec.

**M8. Polish.** Responsive layouts, reduced motion, keyboard navigation, aria-live, localStorage settings, share-link hash, favicon (use `coin.svg`). Optional: Island mode, sound, strategy builder.

## Definition of done
- All MUST items in `02-app-spec.md` section 2 work, on desktop and a 390 px phone.
- Engine tests pass (`npm test`); `npm run build` succeeds with no TS errors.
- `README.md` in the app root explains install, run, build, and the folder structure.
- No console errors; no network requests except the font.
- `ASSUMPTIONS.md` lists every deviation or guess.

## Known pitfalls
- **Duplicate SVG ids** when several characters render in one page: scope lookups to each `<svg>`; if using `dangerouslySetInnerHTML`, don't rely on `document.getElementById`.
- **Mirroring** Character B with `scaleX(-1)` also flips text; use `.transparent.svg` (no label) and draw the name label in HTML.
- **Embedded `<style>` in SVGs** applies globally once inlined; generic class names (`.head`, `.bob`) could collide with app CSS. Rename or wrap in a namespace.
- **Animations & transform-origin:** arm/leg pivots use `transform-origin` in user units on SVG elements; they work when inlined. If you change to `<img>`, idle animations still run but you lose part access.
- **Perf:** do not re-inline SVG strings every render; memoize them. Batch updates at high speed.
- **Tester / Graaskamp** in the engine are approximations of the video's description; label them "simplified" in the Info drawer.
- **Noise definition** is a design choice (execution error by default); keep it consistent between engine, UI flash, and "Why?" insights.
- **The end of a random-length game** must not be signalled to strategies or to the human player.

## Deliverables
Runnable app source, passing tests, `README.md`, `ASSUMPTIONS.md`. Optional: deployed static build.
