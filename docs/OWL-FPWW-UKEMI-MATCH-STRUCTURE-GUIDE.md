# OWL Fire Pro Wrestling World — Ukemi & Match-Structure Guide

**Status:** Current OWL standard  
**Scope:** FPWW CPU Logic / sim pacing  
**OWL environment:** Vanilla-compatible logic; Extended Movelists are **not** assumed.

---

## Quick Reference

Ukemi is treated as a **match-structure control**, not a simple toughness rating.

The three values are:

**Small Damage / Medium Damage / Large Damage**

They help determine **when a wrestler is more willing to accept sustained offense instead of reversing it**, which shapes control periods, comebacks, and match rhythm.

### OWL Decision Order

1. **Match archetype** — what kind of match does this wrestler actually wrestle?
2. **Card level / rank** — S, A, B, or C influences how much sustained offense they generally give.
3. **Alignment** — face/heel helps determine where the control period tends to sit.
4. **Individual style** — monster, shooter, bully, dramatic face, luchador, underdog, etc.
5. **Moveset + parameters** — Ukemi must work with Fight Style, move damage, offense/defense, and CPU Logic.
6. **Sim results** — adjust only after watching the edit work.

**Priority rule:**  
**Match archetype > Rank > Individual adjustment**

Do **not** assign Ukemi only because someone is a face, heel, technician, Japanese wrestler, etc.

---

# 1. OWL Baseline Philosophy

OWL uses the newer **Gui / dnmt / DevilDeVille** approach to Ukemi.

- **Gui / dnmt:** primary conceptual model for match architecture and stronger/extreme archetypes.
- **DevilDeVille:** primary practical baseline for OWL because his lower-amplitude values better fit OWL's preferred match lengths and are safer without Extended Movelists.

OWL should generally **start closer to DevilDeVille and move toward Gui only when the wrestler needs a more dramatic structure.**

Example tuning ladder:

- Start: `20 / 50 / 30`
- Needs stronger middle heat: `20 / 60 / 35`
- Needs a much stronger dramatic comeback structure: `25 / 70 / 40`
- Only push into `80–100` territory when the wrestler genuinely calls for it and testing supports it.

---

# 2. Western / Modern TV Structure

These values are the practical OWL starting point for wrestlers whose matches follow a more obvious face/heel control pattern.

| Rank | Face | Heel |
|---|---:|---:|
| **S / Legend** | `15 / 40 / 30` | Individualize |
| **A** | `17–25 / 40–50 / 28–35` | `40–50 / 17–25 / 28–35` |
| **B** | `20–30 / 50–60 / 30–40` | `50–60 / 20–30 / 30–40` |
| **C** | `25–35 / 60–70 / 35–45` | `60–70 / 25–35 / 35–45` |

### Face structure

Lower early Ukemi → higher middle Ukemi → moderate late Ukemi.

Typical rhythm:

**Competitive opening → opponent heat/control period → babyface comeback → competitive finish**

### Heel structure

Higher early Ukemi → lower middle Ukemi → moderate late Ukemi.

Typical rhythm:

**Opponent starts well → heel takes control → late match opens back up**

---

# 3. Eastern / Puro-Style Structure

Use a tighter, more balanced spread than Western TV structure.

| Rank | Face | Heel |
|---|---:|---:|
| **S / Ace** | `25 / 31 / 28` | Individualize |
| **A** | `25 / 35 / 25` | `35 / 25 / 25` |
| **B** | `23–30 / 41–50 / 28–35` | `41–50 / 23–30 / 28–35` |
| **C** | `28–35 / 53–60 / 33–40` | `53–60 / 28–35 / 33–40` |

**Important:** "Western" and "Eastern" describe **match architecture**, not nationality.

A Japanese wrestler can use a Western structure. An American wrestler can use a Puro-style structure.

---

# 4. Special Archetypes

## Monster / Monster Heel

**OWL starting range:** `10–25 / 10–30 / 40–60`

Structure:

- difficult to establish sustained offense against early
- dominates much of the early/middle match
- opponent increasingly earns offense late

Gui reference: `20 / 25 / 60`

---

## Heavy Babyface / Hoss Face

**OWL starting range:** `10–25 / 20–35 / 35–50`

Structure:

- physically difficult to control
- still allows a meaningful late-match comeback
- should not feel identical to a monster heel

DevilDeVille reference: `10 / 20 / 35`

---

## Shooter

**OWL starting range:** `10–20 / 10–20 / 15–25`

Structure:

- low Ukemi overall
- more likely to stop or counter sustained offense
- opponent should have difficulty stringing long sequences together

Gui reference: `15–20 / 15–20 / 20`  
DevilDeVille reference: `10 / 10 / 15`

---

## Dominator / Bully

**OWL starting range:** `15–30 / 20–35 / 25–45`

Use when the wrestler's match structure is built around prolonged control or bullying, regardless of whether that bullying comes through power, striking, submissions, or technical manipulation.

Gui high-intensity reference: `30–40 / 35–40 / 62–70`

**Example:** Zack Sabre Jr. can fit a bully/control structure even though his offense is technical and submission-heavy. The moveset determines **how** he bullies; Ukemi determines the **shape** of the control period.

---

## Dramatic Babyface

**OWL starting range:** `25–40 / 60–80 / 35–55`

Use for wrestlers whose identity strongly features:

- extended selling
- comeback wrestling
- surviving punishment
- dramatic momentum swings

Gui reference: `40–45 / 75–82 / 50–55`

---

## Underdog Brawler

**OWL starting range:** `30–45 / 65–80 / 45–60`

Should take substantial punishment but remain capable of fighting back late.

Gui reference: `40–45 / 75–82 / 60`

---

## True Underdog

Gui reference: `100 / 100 / 20–40`

OWL should use extreme values **very carefully** until Extended Movelists and tighter finisher conditions are actually in use.

High early/middle Ukemi can help an underdog eat long stretches of offense, but OWL cannot currently rely on modded opponent-tier finisher restrictions to keep match hierarchy under control.

---

## Luchador Face

**OWL baseline:** `15–30 / 50–65 / 25–40`

DevilDeVille reference: `15 / 50 / 25`  
Gui reference: `30 / 100 / 50`

---

## Luchador Heel

**OWL baseline:** `50–65 / 15–30 / 25–40`

DevilDeVille reference: `50 / 15 / 25`  
Gui reference: `100 / 30 / 50`

---

## Rookie / Enhancement

Very high Ukemi can be used to make a rookie eat sustained offense and lose more naturally.

Reference values:

- DevilDeVille Rookie: `90 / 70 / 85`
- Gui Young Lion concept: roughly `100 / 100 / 40–45`

**OWL rule:** do not copy these wholesale until finish access can be controlled more precisely through Extended Movelists / opponent conditions.

---

# 5. Gui / dnmt High-Intensity Reference Table

These values are **reference points, not automatic OWL defaults**.

| Archetype | S / M / L |
|---|---:|
| Puro Main Event Face | `50 / 70 / 50` |
| Puro Main Event Heel | `70 / 50 / 50` |
| Puro Ace | `50 / 62 / 55` |
| Dramatic Main Event / Midcard Face | `40–45 / 75–82 / 50–55` |
| Underdog Brawler | `40–45 / 75–82 / 60` |
| Midcard Heel | `75–82 / 40–45 / 50–55` |
| American Face | `35 / 90 / 55` |
| American Heel | `90 / 35 / 55` |
| Lucha Tecnico | `30 / 100 / 50` |
| Lucha Rudo | `100 / 30 / 50` |
| Underdog | `100 / 100 / 20–40` |
| Monster | `20 / 25 / 60` |
| Dominator / Bully | `30–40 / 35–40 / 62–70` |
| Shooter | `15–20 / 15–20 / 20` |

Use these when an OWL edit needs a stronger version of the intended match architecture.

---

# 6. Vanilla OWL Safety Rules

OWL currently does **not** assume:

- Extended Movelists
- opponent edit-point finisher restrictions
- alternate finisher versions by opponent tier
- zero-random-pin systems
- custom finisher-condition logic

Therefore:

- avoid routine `90–100` Ukemi values
- keep some organic pin logic
- do not assume finishers can be prevented against higher-tier opponents
- use Priority Chains carefully
- test extreme archetypes before applying them roster-wide

---

# 7. Related CPU Logic Rules

## Discretion

Do **not** default everyone to 50 anymore.

Suggested OWL ranges:

| Wrestler type | Discretion |
|---|---:|
| Experienced / technically smart veteran | `80–100` |
| Normal established wrestler | `70–90` |
| Young / reckless | `45–70` |
| Wild / chaotic / reckless brawler | Lower intentionally |

Higher Discretion can:

- heavily suppress Tree of Woe behavior
- improve ring positioning
- move opponents toward ring center from front headlock
- make breathing/rest decisions occur earlier

Use lower Discretion deliberately for wild, reckless, or self-destructive wrestlers rather than as a default.

---

## Opponent Outside Ring

Do **not** automatically set `100% Leave Ring`.

For a non-diver/non-brawler, a useful starting point is:

- **Do Nothing:** `70–80%`
- **Leave Ring:** `20–30%`

Divers should receive appropriate dive logic. Brawlers/chaotic wrestlers can pursue outside more often.

---

## Roll Opponent

**Face Down Roll Opponent:** normally `0%`.

Only use it when a specific setup absolutely requires it.

Face-up repositioning can still be used where it serves a legitimate move or finish setup.

---

## Limb Work

Do not give CPU logic to every available limb attack.

**Moveset availability does not equal CPU usage.**

Only emphasize limb work that matches the wrestler's actual strategy.

---

## Pins

Until OWL uses Extended Movelists:

- keep modest organic pin percentages
- use Priority Chains after finishers and major signatures
- do not copy the `0% random pin` approach wholesale

---

## Disable Ukemi After Boost

**OWL default: OFF / unchecked.**

Current community testing suggests the actual Ukemi values have a much larger visible effect than this option.

---

# 8. Modified Damage Scale

Do **not** automatically copy another creator's damage scale.

Current community references:

- Gui: `70 / 15`
- dnmt: testing `70 / 20`
- DevilDeVille: `75 / 20`

Modified damage scale changes **when Medium and Large CPU Logic become active**. It does **not** inherently fix move spam.

OWL treats damage scale as a **separate global calibration decision**.

Do not change damage scale at the same time as major Ukemi changes unless there is a specific reason. First test the new Ukemi structure, then adjust global damage thresholds only if OWL match lengths consistently become too long or too short.

---

# 9. Standard OWL Wrestler Output

Every wrestler going forward should receive an Ukemi recommendation alongside Skills / Parameters.

```text
UKEMI
Archetype:
Rank / Card Role:
Alignment:
Style Notes:

Small Damage:
Medium Damage:
Large Damage:

Reason:
[1–2 sentences describing the intended match structure.]
```

Example:

```text
UKEMI
Archetype: Heavy Babyface / Monster-Adjacent
Rank / Card Role: Upper Card
Alignment: Face

Small Damage: XX
Medium Damage: XX
Large Damage: XX

Reason:
Controls most of the opening and middle match through physical dominance,
but increasingly gives sustained offense once the opponent survives into
the finishing stretch.
```

---

# OWL Master Rule

> **Ukemi should answer: "Who controls each phase of this wrestler's typical match?"**
>
> It should not simply answer: "How tough is this wrestler?"

Build the match structure first. Then use rank, alignment, moveset, parameters, Fight Style, CPU Logic, and sim testing to fine-tune the edit.
