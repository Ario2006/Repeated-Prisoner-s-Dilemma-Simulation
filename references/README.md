# References: Repeated Prisoner's Dilemma Simulation

Everything an AI coding agent needs to build an interactive, animated simulation of the repeated prisoner's dilemma (Axelrod-style tournaments), with hand-drawn stick-figure characters.

## Folder map
```
references/
├── README.md                      <- you are here
├── docs/
│   ├── 01-simulation-context.md   WHY: game theory background + source-video summary
│   ├── 02-app-spec.md             WHAT: features, modes, data model, engine rules, tech stack
│   ├── 03-ui-spec.md              LOOK & FEEL: layout, tokens, components, animations, asset mapping
│   ├── 04-character-bible.md      WHO: each strategy character (rules, personality, expressions)
│   └── 05-agent-instructions.md   HOW: build order, acceptance criteria, pitfalls
├── engine/
│   └── engine.reference.js        Working reference engine (payoffs, strategies, match, tournament, evolution)
└── assets/
    ├── manifest.json              Every asset: file, category, size, usage note
    ├── characters/                9 characters (6 core + Generous TFT, Random, Banker) as .svg + .transparent.svg
    │   └── characters.js          SVG generator + EXPRESSIONS + setExpression()
    └── ui/                        32 UI SVGs (coins, chest, cards, buttons, bubbles, panels, icons, bg, logo)
```

## Reading order for the agent
1. `docs/05-agent-instructions.md` (build plan) -> 2. `01` -> 3. `02` -> 4. `03` -> 5. `04` -> 6. `engine/engine.reference.js` -> 7. `assets/manifest.json`.

## Kickoff prompt (paste this to your agent, with the `references/` folder attached)
> Build the simulation described in `references/`. Start with `docs/05-agent-instructions.md` and follow its milestones in order. Treat `engine/engine.reference.js` as the source of truth for game logic, and `assets/` as the only art (do not redraw characters or UI). Where the docs are silent, choose the simplest option, note the assumption in `ASSUMPTIONS.md`, and keep going. Deliver a runnable app plus a short README on how to run it.
