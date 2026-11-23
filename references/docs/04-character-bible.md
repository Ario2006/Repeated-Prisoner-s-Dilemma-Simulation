# 04. Character Bible

Nine characters, all from one rig (same proportions, line weight, rig groups). Files: `assets/characters/<id>.svg` (with background and label) and `<id>.transparent.svg` (use this in the app).

## Strategy characters
| Character | Asset id | Tie | Role | Rule (engine id) | Personality & look |
|---|---|---|---|---|---|
| Tit for Tat | `tit-for-tat` | gold `#e0a526` | **Hero** | `tit-for-tat`: C first, then copy opponent's last move. | Gentle, fair, slightly worried smile. Raised hand waving. Mirror-arrow badge. |
| Always Defect | `always-defect` | red `#c8312b` | **Bully** | `always-defect` | Smug, arms crossed, spiky hair, coin purse. Greedy, never cooperates. |
| Always Cooperate | `always-cooperate` | blue `#4aa3df` | **Pushover** | `always-cooperate` | Wide-eyed, innocent, offers a coin, bandage on arm. Endlessly trusting. |
| Friedman | `friedman` | green `#2f7d4a` | **Grudge-holder** | `friedman`: C until the first defection, then D forever. | Stern frown, slicked hair, wagging finger, notebook of tally marks. |
| Joss | `joss` | purple `#7a4bb5` | **Trickster** | `joss`: TFT but ~10% sneaky defections. | Sly half-smile, narrowed eyes, waves with one hand, hides a red "D" card behind his back. |
| Tit for Two Tats | `tit-for-two-tats` | orange `#f08a24` | **Saint** | `tit-for-two-tats`: D only after two opponent D in a row. | Serene closed-eye smile, round glasses, halo, bruises (he's been wronged twice). |
| Generous TFT | `generous-tit-for-tat` | light gold `#f2c14e` | **Noise-proof hero** | `generous-tit-for-tat`: TFT but forgives ~10% of defections. | Tit for Tat's kinder twin; heart badge instead of arrows. Use in noise mode. |
| Random | `random` | grey `#8c8c8c` | **Wildcard** | `random`: 50/50. | Wild eyes, wavy mouth, holds a die. Bobs fast and unpredictably. |

## NPC
| Character | Asset id | Role |
|---|---|---|
| The Banker | `banker` | Hosts the game: top hat, gold monocle, holds a coin. Stands by the chest, announces rounds, pays out coins. Not a strategy. |

Strategies without a dedicated sprite yet (`tester`, `graaskamp`): the engine supports them. To add sprites, append a config to `CHARS` in `characters.js` (fields: `id,name,tie,hair,eyes,brows,mouth,armL,armR,body,head,bob`) and re-export. Suggestions: Tester holds a magnifying glass; Graaskamp is a detective with a clipboard.

## Expression system
`setExpression(svgEl, name)` swaps the `#mouth` and `#brows` paths.

| Situation | Expression |
|---|---|
| Idle / between rounds | `neutral` (or the character's native face; store it and restore after each round) |
| Got 3 coins (mutual cooperation) | `happy` |
| Got 5 coins (successful defection) | `smug` |
| Got 0 coins (was the sucker) | `hurt` |
| Got 1 coin (mutual defection) | `angry` |
| Noise flipped my move | `hurt` + "Oops!" bubble |
| Strategy reveal (end of match) | native face |

## Idle animation hooks (built in)
Tit for Tat: wave. Always Defect: head tilt only (smug stillness). Always Cooperate: bob + arm swing. Friedman: stiff, finger jab. Joss: fast bob (tiptoe) + wave. Tit for Two Tats: floating, halo float. Generous TFT: wave. Random: fast bob. Banker: gentle bob. All characters blink.

## Voice (for bubbles, tooltips, strategy reveal)
- Tit for Tat: "I'll be nice first. Then I'll do what you did."
- Always Defect: "Coins are for taking."
- Always Cooperate: "Friends share! ... Ow."
- Friedman: "Cross me once and we're done. Forever."
- Joss: "Who, me? Never." (then defects)
- Tit for Two Tats: "Once is an accident. Twice, I'll notice."
- Generous TFT: "I'll hit back, but I forgive easily."
- Random: "Heads... or tails?"
- Banker: "Cooperate or defect. Choose wisely."

## Rig reference (for animation)
Canvas 300x500. Shoulders at (104,184) left and (196,184) right; hips at (128,300) and (172,300); head centre (150,100) r62, head pivot (150,165). Arms: `#armL`/`#armR` outer group carries the static pose rotation; the inner group has the idle animation, pivot at the shoulder. Props (coins, notebook, die, card) live inside the arm's inner group and move with the hand.
