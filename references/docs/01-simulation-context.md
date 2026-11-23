# 01. Simulation Context

Background the agent and the end user should share. Source: a ~27-minute explainer video on the repeated prisoner's dilemma and Robert Axelrod's tournaments. This is a paraphrased summary, not a transcript.

## 1. The core idea
Cooperation can emerge among purely self-interested players, with no altruism, trust or conscious thought, as long as the same players meet again and again. The simulation should let a user *discover* this by watching it happen.

## 2. The one-shot prisoner's dilemma
Two players each choose **Cooperate (C)** or **Defect (D)**. A banker pays out coins:

| | Opponent C | Opponent D |
|---|---|---|
| **You C** | You 3, Opp 3 | You 0, Opp 5 |
| **You D** | You 5, Opp 0 | You 1, Opp 1 |

Names: T=5 (temptation), R=3 (reward), P=1 (punishment), S=0 (sucker). Constraint: T > R > P > S and 2R > T + S.

**Logic of one shot:** whatever the opponent does, defecting pays more (5>3, 1>0). A rational opponent reasons the same, so both defect and get 1 each instead of 3 each. Rational selfishness leads to a worse result for everyone.

## 3. Real-world framing (use as story/intro material)
- **Cold War:** After the USSR's first nuclear test (detected Sept 1949 via radioactive traces in air and rainwater samples), some US voices pushed for a first strike. RAND, a think tank, studied the problem with game theory and two RAND mathematicians devised the prisoner's dilemma in 1950. Both superpowers built enormous arsenals (the video cites around $10 trillion spent), though both would have been better off cooperating.
- **Impalas:** They groom each other to remove ticks. Grooming costs saliva, electrolytes, time and attention. Each would prefer to be groomed without paying; but they meet daily, so it is a repeated game.
- Other examples: roommates and chores, cleaner fish and sharks.

## 4. Repeated game
If you meet the same opponent many times, defecting now can be punished later. Strategy becomes a rule: *given the history, what do I do next?* There is **no single best strategy**; it depends on who else is in the population.

**Important:** the number of rounds must be unknown to the players. If the last round is known, both defect in it; then the one before; and so on back to round 1 (backward induction). Axelrod's second tournament used a random game length with mean ~200 rounds.

## 5. Axelrod's tournaments
- **Tournament 1 (1980):** 14 submitted programs + `Random` = 15 strategies. Each plays every other strategy and a copy of itself, 200 rounds per match. The whole tournament was repeated 5 times to rule out flukes. **Tit for Tat** (cooperate first, then copy the opponent's last move) won, and it was the simplest entry.
- **Tournament 2:** 62 entries + Random; same rules except random game length. Entrants knew the round-1 results. Two camps: (a) nice/forgiving entries (one even submitted Tit for Two Tats) and (b) nasty entries trying to exploit the nice ones (e.g. Tester). Tit for Tat won again. Tit for Two Tats, which would have won round 1, placed 24th in round 2.
- In round 1, the top 8 strategies were all nice; even the worst nice one beat the best nasty one. In round 2's top 15 only one strategy was not nice.

### Strategy glossary (from the video)
| Strategy | Rule |
|---|---|
| Tit for Tat | Cooperate first, then copy the opponent's previous move. |
| Tit for Two Tats | Defect only after the opponent defects twice in a row. (Axelrod's "sample" strategy; would have won tournament 1.) |
| Friedman | Cooperate until the opponent defects once; then defect forever. |
| Joss | Tit for Tat, but ~10% of the time defects sneakily instead of cooperating. |
| Graaskamp | Like Tit for Tat but defects at round 50 to probe the opponent for weaknesses. (Simplified in the reference engine.) |
| Tester | Defects on move 1. If the opponent retaliates, apologises and plays Tit for Tat; if not, defects every other move. |
| Random | Cooperates or defects 50/50. |
| Always Defect | Never cooperates. (Never loses a match, yet ranks terribly overall.) |
| Always Cooperate | Never defects. A pushover. |
| Name Withheld | The most elaborate entry (77 lines); not modelled. |
| Harrington | The only nasty strategy in round 2's top 15; thrived by preying on weak strategies, then shrank as its prey went extinct. |

### What winners had in common (Axelrod's four qualities)
1. **Nice**: never the first to defect.
2. **Forgiving**: retaliates but holds no grudge (Friedman is the opposite).
3. **Retaliatory / provokable**: strikes back immediately; not a pushover (Always Cooperate fails here).
4. **Clear**: easy for the opponent to understand, so trust can form. Opaque or random-like programs get treated as "assume this is the last time I'll see you".

## 6. Evolutionary (ecological) simulation
Strategies' population shares grow or shrink according to their success; no mutation. Poor performers go extinct quickly; after ~1000 generations only nice strategies remain, with Tit for Tat on top (the video cites ~14.5% of the population in Axelrod's setup). This tests a strategy against *other successful strategies*, not just weak ones.

**Island of cooperation:** in a world of defectors, a small cluster of Tit for Tat players who mostly meet each other can out-score the defectors, reproduce, and spread until they take over. (Optional spatial mode.)

## 7. Noise
Real systems make errors: a cooperation is executed or perceived as a defection. Example: in 1983 a Soviet early-warning satellite mistook sunlight reflecting off high-altitude clouds for a US missile launch; officer Stanislav Petrov judged it a false alarm.
- Two Tit for Tat players in a noisy world fall into **echo effects**: one error triggers alternating retaliation; a second error leads to permanent mutual defection. In the long run they earn only about a third of what they'd get without noise.
- **Fix:** *Generous* Tit for Tat, which forgives about 10% of the time (retaliates ~9 of 10 defections). It breaks the echoes while staying retaliatory enough to resist exploitation.

## 8. Big takeaways (the "lessons" the UI should surface)
- **Winning is not beating the other player.** Tit for Tat can only draw or lose individual matches yet tops the table; Always Defect can only draw or win yet ranks near the bottom. Most of life is **non-zero-sum**: the reward comes from "the banker" (the world), not from the opponent.
- **Be nice, forgiving, provokable and clear.** Don't be a pushover.
- **In the short run the environment shapes the player; in the long run players shape the environment.**
- **Slow, verified reciprocity beats all-or-nothing deals.** From the late 1980s the US and USSR reduced their nuclear stockpiles gradually, a little each year, checking each other's compliance, which turns one big dilemma into many small repeated ones.
- Researchers have tested many payoff structures, error levels and mutating strategies; Tit for Tat or Generous Tit for Tat doesn't always win but the four qualities hold.

## 9. Learning goals for the simulation
After using it, a user should be able to explain: (1) why one-shot defection is "rational"; (2) why repetition changes it; (3) why the hidden end matters; (4) what makes a strategy succeed; (5) why noise hurts Tit for Tat and how generosity fixes it; (6) why winning is not beating your opponent.
