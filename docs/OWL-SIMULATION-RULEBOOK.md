# OWL Simulation Rulebook

**Status:** Active internal rulebook  
**Last revised:** July 30, 2026  
**Applies to:** OWL Wrestling simulation, progression, injuries, recovery, and Control Room automation

---

## 1. Purpose

This document is the permanent internal source of truth for OWL Wrestling’s simulation rules.

It governs:

- Fire Pro Wrestling World match settings
- Wrestler rating baselines
- Championship rating bonuses
- Permanent progression points
- Injury triggers
- Injury absence rolls
- Diagnosis and body-part selection
- Post-injury recovery
- Fire Pro endurance changes
- Reinjury handling
- Control Room generator procedures
- Public injury wording
- Future simulation-system revisions

When a rule in this document conflicts with an older chat, note, or temporary implementation, this document takes priority after the conflict is reviewed and the rulebook is updated.

---

## 2. Simulation Engine

OWL matches are simulated using a modified version of:

```text
Fire Pro Wrestling World
```

Official downloadable content may be used.

### Standard simulation settings

```text
CPU Level: 8
Match Speed: 125
KO Setting: Low / Random
```

These are the standard OWL settings unless a specific match type requires an approved exception.

Any future exception must be documented in this rulebook.

---

## 3. Wrestler Rating Baseline

Every active OWL wrestler begins at:

```text
180 points
```

A wrestler’s permanent base rating may never fall below:

```text
180 points
```

OWL does not use permanent negative rating penalties that reduce a wrestler below the company baseline.

Temporary changes caused by championships, injuries, recovery, or special match conditions do not alter this permanent minimum.

---

## 4. Championship Rating Bonus

A current champion receives:

```text
+20 points
```

while holding the championship.

Example:

```text
Permanent rating: 184
Championship bonus: +20
Active champion rating: 204
```

When the championship is lost, the temporary `+20` bonus is removed.

The wrestler keeps all permanent progression points earned before and during the reign.

---

## 5. Permanent Progression Points

Permanent progression points represent accomplishments that remain part of a wrestler’s career rating.

### Approved permanent bonuses

| Accomplishment | Permanent Bonus |
|---|---:|
| PPV victory | +1 |
| Championship victory | +1 |
| Successful championship defense | +1 |
| Designated major competition or Signature Series victory | +1 |
| Competitively earned official future title opportunity | +1 |

Bonuses may stack when one result satisfies multiple approved categories.

### Examples

#### Standard PPV victory

```text
PPV victory: +1
Total earned: +1
```

#### PPV championship victory

```text
PPV victory: +1
Championship victory: +1
Total earned: +2
```

#### Successful PPV title defense

```text
PPV victory: +1
Successful title defense: +1
Total earned: +2
```

#### Overthrow Rumble victory

```text
Signature Series victory: +1
Official future title opportunity: +1
Total earned: +2
```

#### Proving Ground block victory

```text
Block victory: +1
```

A PPV final may award additional points when it qualifies under the normal progression categories.

### Withdrawn rule

OWL does not award a permanent point merely for becoming the standard number-one contender.

A title opportunity must be competitively earned through an approved system or accomplishment.

---

## 6. Championship Defense Retention

Every successful championship defense grants:

```text
+1 permanent point
```

That point remains after the wrestler loses the championship.

The temporary championship bonus and permanent defense bonus are separate:

```text
Temporary champion bonus: +20
Permanent successful defense: +1
```

---

## 7. Injury Evaluation Trigger

An injury evaluation occurs only when a match ends with:

```text
CRIT
```

A normal pinfall, submission, knockout, count-out, disqualification, draw, or other result does not automatically trigger an injury roll.

The CRIT result begins the injury process. It does not guarantee that the wrestler will miss time.

---

## 8. Primary Injury Roll

After a CRIT result, roll one ten-sided result:

| Roll | Standard Outcome |
|---:|---|
| 1–3 | No injury absence |
| 4–6 | 1 week unavailable |
| 7–9 | 2 weeks unavailable |
| 10 | 3 weeks unavailable |

OWL tracks injury absence in weeks rather than days.

An injury absence may continue across a PPV or other major event.

A wrestler is unavailable for booking during the full absence period.

---

## 9. Severe Injury Check

A severe injury may occur only after the primary injury roll produces:

```text
10
```

The severe-injury probability should remain rare:

```text
Approximately 2%–3%
```

A severe injury may create a substantially longer absence than the standard three-week result.

The exact severe-injury diagnosis and absence must be produced by the approved injury generator.

### Championship handling

A severe injury affecting a champion may require:

- Championship vacancy
- Interim championship
- Another commissioner-approved title solution

The Control Room must flag the situation for a decision.

The system must not automatically vacate a championship without confirmation.

---

## 10. Affected Body Part

The affected Fire Pro body part must be based on the cause of the CRIT whenever the match data makes that connection reasonably clear.

Approved body-part categories will correspond to Fire Pro endurance areas.

The system must not randomly assign an unrelated body part when the CRIT cause provides usable evidence.

When the CRIT cause is unclear, the generator may use an approved weighted random selection.

### Body-part mapping status

The final move-category-to-body-part table is still pending.

Until that table is approved, the injury generator must not invent permanent mapping rules.

---

## 11. Diagnosis Selection

The injury diagnosis must match:

- Affected body part
- Standard or severe injury classification
- Rolled absence duration
- Available CRIT information

The diagnosis is presentation and tracking language. It does not replace the rolled absence rule.

A diagnosis should sound medically plausible without becoming excessively graphic.

### Diagnosis table status

The complete diagnosis library is still pending.

It will be added before the injury generator is considered production-ready.

---

## 12. Two-Stage Recovery System

OWL uses a two-stage injury and recovery process.

### Stage One — Injured and unavailable

During the rolled absence period, the wrestler is:

```text
INJURED
```

The wrestler:

- Cannot be booked
- Does not appear in normal booking selections
- Remains visible on public roster pages
- Displays an injury indicator
- Has an expected return week

### Stage Two — Active but recovering

After serving the full absence, the wrestler returns to active competition.

The affected Fire Pro body part is then set to:

```text
Low endurance
```

The wrestler’s status becomes:

```text
RECOVERING
```

The wrestler may be booked during this period.

---

## 13. Post-Return Low-Endurance Window

The post-return Low-endurance period normally equals the standard injury absence.

| Standard Absence | Post-Return Low Period |
|---:|---:|
| 1 week | 1 week |
| 2 weeks | 2 weeks |
| 3 weeks | 3 weeks |

For major or severe injuries, the post-return Low period is capped at:

```text
4 weeks
```

Example:

```text
Severe absence: 12 weeks
Post-return Low period: 4 weeks
```

---

## 14. Prior Endurance State

Before changing the affected body part to Low, the tracker must store its previous endurance state.

Possible examples include:

```text
Low
Medium
High
```

When the recovery window ends, the tracker restores the body part to its saved prior state.

Example:

```text
Prior state: Medium
Recovery state: Low
Cleared state: Medium
```

The tracker must never assume that every wrestler returns to Medium.

---

## 15. High Endurance Restriction

Healing from an injury can never increase a body part to:

```text
High endurance
```

High endurance must be earned through a separate approved progression system, such as:

- Longevity
- Match experience
- Career milestones
- Durability accomplishments
- Another future approved rule

The final High-endurance milestone rules are still pending.

Until those rules are approved, the injury system may only restore the saved prior endurance state.

---

## 16. Injury Statuses

The Control Room uses three primary injury statuses.

### INJURED

```text
Unavailable for booking
```

The wrestler is serving the rolled absence.

### RECOVERING

```text
Active, but the affected body part remains at Low endurance
```

The wrestler may be booked.

### CLEARED

```text
Recovery window complete
```

The affected body part has been restored to its previous endurance state.

A cleared record may remain in injury history but should no longer appear as an active injury.

---

## 17. Required Injury Record

Each official injury record must contain:

```text
Injury ID
Wrestler ID
Match ID
Event ID
CRIT cause
Diagnosis
Affected Fire Pro body part
Primary injury roll
Standard or severe classification
Absence duration
Injury start week
Expected return week
Post-return Low duration
Recovery start week
Expected clearance week
Prior endurance state
Current endurance state
Current injury status
Championship status at time of injury
Created timestamp
Updated timestamp
```

Optional fields may include:

```text
Commissioner note
Title decision
Reinjury reference
Manual correction note
```

---

## 18. Control Room Prompts

The future injury tracker must prompt the user at the correct points.

### Return prompt

When the absence ends:

```text
This wrestler is eligible to return.

Set the affected Fire Pro body part to Low endurance and change the injury status to RECOVERING.
```

### Clearance prompt

When the recovery period ends:

```text
This wrestler has completed the post-return recovery window.

Restore the affected body part to its prior endurance state and change the injury status to CLEARED.
```

The tracker must not claim that a Fire Pro edit was completed until the user confirms it.

---

## 19. Booking Availability

### Injured wrestlers

A wrestler with active `INJURED` status must be removed from normal:

- Match Booker wrestler selections
- Tournament eligibility
- Random wrestler drawings
- Other active-competition selection tools

The wrestler remains in the permanent roster database.

### Recovering wrestlers

A wrestler with active `RECOVERING` status remains eligible for:

- Match booking
- Tournaments
- Rankings
- Championship opportunities
- Other normal competition

The affected body part remains at Low endurance until clearance.

---

## 20. Public Injury Presentation

Public roster cards and wrestler profiles should distinguish injury stages.

### Unavailable injury

Recommended presentation:

```text
Red injury indicator
```

Public details may include:

- Diagnosis
- Affected body part
- Weeks unavailable
- Expected return week
- Recovery period after return

### Active recovery

Recommended presentation:

```text
Amber recovery indicator
```

Public details may include:

- Returned to active competition
- Affected body part remains at Low endurance
- Expected full-clearance week

The public site should not display private Control Room notes, roll mechanics, or administrative correction details unless intentionally approved.

---

## 21. Reinjury Rules

Reinjury mechanics are not yet finalized.

The future rule must address:

- CRIT to the same body part while recovering
- CRIT to a different body part while recovering
- Whether the new absence replaces or extends the current recovery
- Whether prior endurance restoration is delayed
- How multiple active injuries are displayed
- Whether reinjury alters severe-injury probability

Until this section is approved, the tracker must not automatically calculate reinjury consequences.

It should instead flag the case for commissioner review.

---

## 22. Generator Hub Procedures

The future Control Room Generator Hub will support:

- Canon mode
- Test mode
- Animated result presentation
- Official result confirmation
- Result history
- Injury rolls
- Diagnosis selection
- Body-part selection
- Severe-injury checks
- Fate’s Wheel cases
- Hex-Cell entry order
- Wildcard Play-In selections
- Other approved random decisions

### Canon mode

Canon mode creates an official result that may be written to OWL data after confirmation.

### Test mode

Test mode demonstrates the generator without changing official data.

A test result must never enter official history or alter the roster.

### Confirmation requirement

Randomized results should not become canon until the user confirms them.

---

## 23. Generator History

Each confirmed generator result should record:

```text
Generator type
Mode
Result
Eligible pool
Excluded entries
Date and time
Related event or match
User confirmation
```

Injury results should additionally link to the official injury record.

Test-mode results should either:

- Remain outside the official history
- Or be stored in a clearly separated temporary test history

---

## 24. Public-Site Boundaries

Internal simulation information should be separated from public presentation.

### Internal-only examples

- Raw injury rolls
- Severe-injury probability
- Generator seed or randomization details
- Prior Fire Pro endurance values
- Manual correction notes
- Administrative confirmation history

### Public examples

- Injury diagnosis
- Current status
- Expected return
- Recovery status
- Affected body part
- Expected clearance

---

## 25. Change-Control Rule

Simulation rules must not be silently changed inside JavaScript.

Any meaningful rule change must follow this order:

```text
1. Approve the rule
2. Update this rulebook
3. Add a revision-log entry
4. Update the affected scripts and interfaces
5. Test the implementation
```

The code should implement the rulebook—not become the only place where the rule exists.

---

## 26. Pending Rule Decisions

The following items remain unresolved:

- Final CRIT move-category-to-body-part mapping
- Complete diagnosis library
- Exact severe-injury absence table
- High-endurance milestone system
- Reinjury calculations
- Multiple simultaneous injury handling
- Detailed championship vacancy/interim decision procedure
- Final public injury wording and visual styling
- Generator animation style
- Generator result-history retention rules

These items must be approved before their related systems are considered complete.

---

## 27. Revision Log

### July 30, 2026

Initial rulebook created.

Documented:

- Fire Pro simulation settings
- 180-point rating baseline
- Temporary championship bonus
- Permanent progression categories
- Successful-defense retention
- CRIT-only injury trigger
- Standard injury roll
- Rare severe-injury check
- Two-stage recovery system
- Post-return Low-endurance window
- Four-week major-injury recovery cap
- Prior endurance restoration
- High-endurance restriction
- Injury statuses
- Control Room prompt requirements
- Booking eligibility rules
- Public injury-status boundaries
- Generator canon/test mode requirements
- Pending reinjury and diagnosis decisions
