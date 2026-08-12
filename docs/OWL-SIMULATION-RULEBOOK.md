# OWL Simulation Rulebook

**Status:** Active internal rulebook  
**Last revised:** August 12, 2026  
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
- Control Room Generator procedures
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
160 points
```

A wrestler’s permanent base rating may never fall below:

```text
160 points
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
Permanent rating: 164
Championship bonus: +20
Active champion rating: 184
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

A severe-injury check occurs only when the primary injury roll produces:

```text
10
```

After rolling `10`, perform a second roll from `1–100`.

| Severe Check | Outcome |
|---:|---|
| 1–95 | Standard 3-week injury |
| 96–100 | Severe injury |

This creates a:

```text
5% severe-injury chance after a primary roll of 10
```

A severe outcome replaces the normal three-week absence.

---

## 10. Severe Injury Duration

When the severe-injury check succeeds, roll again from `1–100`.

| Duration Roll | Severe Absence |
|---:|---:|
| 1–60 | 8 weeks |
| 61–90 | 12 weeks |
| 91–100 | 16 weeks |

All severe injuries use a four-week post-return Low-endurance period.

| Severe Absence | Post-Return Low Period |
|---:|---:|
| 8 weeks | 4 weeks |
| 12 weeks | 4 weeks |
| 16 weeks | 4 weeks |

A severe injury record must preserve:

- Primary injury roll
- Severe-check roll
- Severe-duration roll
- Final absence length
- Diagnosis
- Affected Fire Pro endurance area
- Specific anatomical sub-area
- Championship status
- Required championship action

---

## 11. Championship Handling for Severe Injuries

A severe injury affecting a current champion uses the following rules.

### Eight-week absence

```text
Interim championship optional
```

The commissioner may:

- Allow the champion to retain the title without an interim champion
- Create an interim championship
- Vacate the title when circumstances warrant it

### Twelve-week absence

```text
Interim championship or vacancy required
```

The title cannot remain completely inactive for the full absence.

The commissioner must choose:

- Create an interim championship
- Vacate the championship

### Sixteen-week absence

```text
Championship automatically vacated
```

The rule outcome is mandatory.

The Control Room must still require confirmation that the related championship database changes have been completed.

It must not silently rewrite championship history without user confirmation.

---

## 12. CRIT Cause-to-Body-Part Hierarchy

The affected body area is determined from the CRIT cause using this priority order:

```text
1. Submission target
2. Explicitly targeted attack
3. Primary landing or impact area
4. Equal ambiguity resolved by a 50/50 Generator choice
```

### Submission target

When the CRIT comes from a submission, use the body area directly targeted by that submission.

Examples include:

- Arm submission → Arms
- Leg submission → Legs
- Neck submission → Neck
- Back or torso submission → Back

### Explicitly targeted attack

When the move or sequence clearly targets a specific area, use that area even when another part of the body also contacts the mat.

### Primary landing or impact area

When there is no submission target or explicit attack target, use the body area that absorbs the primary impact.

### Equal ambiguity

When two body areas are equally plausible, the Generator performs a 50/50 selection between those areas.

The system must preserve the two eligible areas and the randomly selected result in Generator History.

---

## 13. Fire Pro Endurance Areas

OWL uses four Fire Pro endurance areas.

### Neck

Includes:

```text
Head
Face
Neck
```

### Arms

Includes:

```text
Shoulder
Upper Arm
Elbow
Forearm
Wrist / Hand
```

### Back

Includes:

```text
Chest
Ribs
Abdomen / Core
Upper Back
Lower Back
```

### Legs

Includes:

```text
Hip
Thigh
Knee
Lower Leg
Ankle
Foot
```

The diagnosis may name the specific anatomical sub-area.

The actual Fire Pro edit uses the corresponding broader endurance area:

```text
Head / Face / Neck → Neck
Shoulder through Wrist / Hand → Arms
Chest through Lower Back → Back
Hip through Foot → Legs
```

---

## 14. Diagnosis Library

OWL uses a finalized duration-based diagnosis library.

Diagnosis options are organized by:

- Fire Pro endurance area
- Specific anatomical sub-area
- Standard or severe classification
- Final absence length

Approved absence lengths are:

```text
1 week
2 weeks
3 weeks
8 weeks
12 weeks
16 weeks
```

The Generator may only choose a diagnosis approved for:

```text
Selected Fire Pro area
Selected anatomical sub-area
Final absence duration
```

A diagnosis from a different body area or duration cannot be used.

The complete approved diagnosis catalog is stored in:

```text
data/injury-diagnoses.json
```

That catalog is part of this rulebook system.

JavaScript must read from the catalog rather than containing a separate hidden list of diagnoses.

### Required wording rule

OWL must never use the medical term:

```text
contusion
```

Use:

```text
bruise
```

in every diagnosis, Control Room display, public status, and generated record.

---

## 15. Standard Two-Stage Recovery

OWL uses a two-stage injury and recovery process.

### Stage One — INJURED

During the absence period, the wrestler is:

```text
INJURED
```

The wrestler:

- Is unavailable for competition
- Cannot be selected in Match Booker
- Cannot enter a tournament field
- Cannot be selected by active-competition generators
- Remains visible on public roster pages
- Displays a red public injury status

### Stage Two — RECOVERING

After the full absence has been served, the wrestler may return.

The affected Fire Pro area is set to:

```text
Low endurance
```

The status becomes:

```text
RECOVERING
```

The wrestler:

- Is active
- May be booked
- May enter tournaments
- May appear in rankings
- May compete for championships
- Displays an amber public recovery status

---

## 16. Standard Post-Return Low-Endurance Period

For standard injuries, the Low-endurance recovery period equals the absence.

| Standard Absence | Post-Return Low Period |
|---:|---:|
| 1 week | 1 week |
| 2 weeks | 2 weeks |
| 3 weeks | 3 weeks |

For severe injuries:

```text
Post-return Low period: 4 weeks
```

The four-week severe recovery period applies regardless of whether the absence was 8, 12, or 16 weeks.

---

## 17. Endurance States

The OWL Fire Pro endurance states are:

```text
Low
Normal
High
```

Use `Normal`, not `Medium`, in all new databases, forms, generators, and public or internal wording.

Existing temporary implementation fields using `Medium` must be migrated to `Normal`.

---

## 18. Prior Endurance State

Before an affected area is changed, the tracker must store its prior endurance state.

Possible values are:

```text
Low
Normal
High
```

The saved value determines what happens after the Low-endurance recovery period.

### Prior state was Low

The area remains:

```text
Low
```

unless another approved progression rule changes it later.

### Prior state was Normal

At full clearance, restore the area to:

```text
Normal
```

### Prior state was High

High is not restored immediately when the normal recovery window ends.

The area initially returns to:

```text
Normal
```

The wrestler must then satisfy the separate High-restoration requirements documented below.

---

## 19. Injury Statuses

The Control Room uses three primary injury statuses.

### INJURED

```text
Unavailable for competition
```

### RECOVERING

```text
Active, affected area remains at Low endurance
```

### CLEARED

```text
Standard recovery window complete
```

A wrestler may be medically `CLEARED` while still waiting to regain a previously held High endurance setting.

That separate state must be tracked as:

```text
HIGH RESTORATION PENDING
```

The injury record remains part of permanent history after clearance.

---

## 20. Required Injury Record

Each official injury record must contain:

```text
Injury ID
Wrestler ID
Wrestler name
Generator result ID
Match ID
Event ID
CRIT cause
CRIT determination method
Specific anatomical sub-area
Affected Fire Pro endurance area
Diagnosis
Primary injury roll
Severe-check roll when applicable
Severe-duration roll when applicable
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
Championship status at injury
Required championship action
Title decision
Created timestamp
Updated timestamp
```

When applicable, also record:

```text
Parent injury ID
Reinjury type
Same-area or different-area classification
First reinjury d10
Second reinjury d10
Used reinjury result
Low-endurance extension
High-restoration status
High-restoration healthy-week requirement
High-restoration match requirement
```

Optional fields may include:

```text
Commissioner note
Manual correction note
Public note
```

---

## 21. Return Prompt

When the absence period ends, the Control Room must prompt:

```text
This wrestler has completed the injury absence.

Set the affected Fire Pro endurance area to Low and confirm the wrestler’s return to active competition.
```

The system must not mark the wrestler `RECOVERING` until the user confirms that the Fire Pro edit has been completed.

---

## 22. Clearance Prompt

When the Low-endurance recovery period ends, the Control Room must prompt:

```text
This wrestler has completed the post-return recovery period.
```

The required Fire Pro action depends on the prior endurance state.

| Prior State | Clearance Action |
|---|---|
| Low | Leave the area at Low |
| Normal | Restore the area to Normal |
| High | Restore the area to Normal and begin High Restoration Pending |

The system must not claim that the edit was completed until the user confirms it.

---

## 23. Reinjury Evaluation

A new CRIT involving a wrestler who is currently `RECOVERING` requires a reinjury evaluation.

The process depends on whether the CRIT affects the same Fire Pro endurance area or a different area.

---

## 24. Same-Area Reinjury

When the new CRIT affects the same endurance area that is currently at Low:

```text
Roll two d10s
Use the higher result
```

Both rolls must be preserved in Generator History.

Example:

```text
First d10: 4
Second d10: 8
Used result: 8
```

The used result follows the standard injury table:

| Used Roll | Outcome |
|---:|---|
| 1–3 | No new absence |
| 4–6 | 1 week unavailable |
| 7–9 | 2 weeks unavailable |
| 10 | 3 weeks unavailable plus severe-injury check |

When the used result is `10`, perform the normal severe-injury check.

---

## 25. Same-Area Aggravation Without New Absence

When the higher same-area reinjury roll is `1–3`:

```text
No new absence
```

However, the existing Low-endurance recovery period gains:

```text
+1 week
```

The total remaining or recalculated Low-endurance window may never exceed:

```text
4 weeks
```

The wrestler remains active and `RECOVERING`.

The aggravation must be recorded in the existing injury history.

---

## 26. Same-Area Reinjury With a New Absence

When the higher same-area roll produces a new absence:

- The wrestler returns to `INJURED`
- The new absence begins
- The affected area remains Low
- The affected area’s recovery timeline resets
- A new post-return Low period is calculated from the new result
- The new injury record links to the earlier injury record

A standard new injury uses the normal one-, two-, or three-week Low period.

A severe new injury uses the four-week Low period.

---

## 27. Different-Area Reinjury

When the new CRIT affects a different Fire Pro endurance area:

```text
Use one normal d10 injury roll
```

The existing recovering area continues on its own timeline.

The new area receives its own independent evaluation and record.

A wrestler may therefore have:

- One area recovering while another is injured
- Two areas recovering simultaneously
- Multiple historical injury records with different clearance dates

The tracker must preserve each area independently.

One injury must never silently overwrite another injury affecting a different area.

---

## 28. Multiple Active Injury Handling

Overall wrestler availability follows the most restrictive active status.

### At least one active INJURED record

```text
Overall public status: INJURED
Booking availability: unavailable
```

### No INJURED record but at least one RECOVERING record

```text
Overall public status: RECOVERING
Booking availability: active
```

### All injury records CLEARED

```text
No active public injury status
Booking availability: active
```

The wrestler profile may display multiple active body-area cards when necessary.

---

## 29. High Endurance Purpose

High endurance represents proven durability through OWL match experience.

It is not awarded for:

- Wins
- Championships
- Rankings
- Rating points
- Awards
- Inactivity
- Manually chosen favoritism

Only completed official OWL matches count toward High-endurance milestones.

---

## 30. High Endurance Milestones

A wrestler becomes eligible for the first High endurance area after:

```text
30 completed OWL matches
```

A wrestler becomes eligible for the second High endurance area after:

```text
75 completed OWL matches
```

A wrestler may have no more than:

```text
2 High endurance areas
```

Any High endurance settings that already exist count toward the maximum.

Example:

```text
Wrestler already has one High area
30-match milestone does not create a third opportunity
75-match milestone may create only one additional High area
```

---

## 31. High Endurance Eligibility Conditions

A High milestone does not activate merely because the match-count threshold was reached.

The wrestler must also:

```text
Not be INJURED
Not be RECOVERING
Have completed at least 4 matches since the most recent injury
Have gone at least 8 calendar weeks without another injury
```

When the match milestone is reached while any requirement is unmet, the milestone becomes:

```text
PENDING
```

It remains pending until every activation requirement is satisfied.

Inactivity alone does not earn High endurance.

---

## 32. High Endurance Area Selection

When a milestone activates, the Generator randomly selects from eligible:

```text
Normal endurance areas
```

The Generator cannot select:

- An area currently at Low
- An area already at High
- An area blocked by active injury recovery
- An area that would exceed the wrestler’s two-High maximum

The eligible pool and selected area must be preserved in Generator History.

If no eligible Normal area exists, the milestone remains pending.

---

## 33. High Endurance Restoration After Injury

When an injury affects an area that was previously High, the area does not return directly to High at normal clearance.

At the end of the Low-endurance recovery period:

```text
Restore the affected area to Normal
```

Then begin a High-restoration eligibility period.

### Standard injury restoration

High may return after both requirements are satisfied:

```text
8 healthy calendar weeks
4 completed OWL matches
```

### Severe injury restoration

High may return after both requirements are satisfied:

```text
12 healthy calendar weeks
8 completed OWL matches
```

The High-restoration eligibility period begins when the wrestler is fully `CLEARED`, the affected area is restored from Low to Normal, and the High-restoration record is created.

Only completed official OWL matches after that full-clearance timestamp count toward the restoration requirement.

If another injury occurs before High is restored:

- High restoration remains pending while the wrestler is `INJURED` or `RECOVERING`
- The healthy-week count restarts from the wrestler’s latest full-clearance timestamp
- Completed qualifying matches already earned toward the restoration requirement remain counted

The healthy-week requirement measures uninterrupted healthy time.

The completed-match requirement measures proven post-clearance durability.

Until both requirements are satisfied, the affected area remains:

```text
Normal
```

Restoring a previously earned High setting does not count as a new High milestone and does not increase the wrestler beyond the two-area maximum.

---

## 34. Generator Hub Procedures

The current Control Room Generator Hub supports:

- Canon Mode
- Test Mode
- Custom Pool Draw
- Injury Evaluation
- Primary injury d10
- Severe-injury check
- Severe-duration roll
- CRIT body-area ambiguity resolution
- Duration-based diagnosis selection
- Same-area reinjury advantage roll
- High-endurance milestone selection
- Fate’s Wheel case assignment and outcomes
- Hex-Cell entry-order generation
- Wildcard Play-In selection
- Ranking-position selection
- JoW private booking-style selection

Other approved one-time or recurring random decisions may use Custom Pool Draw when no dedicated preset exists.

A Custom Pool Draw must preserve:

- The complete eligible pool
- Any excluded entries
- The selected draw method
- The final result
- Canon or Test Mode
- Confirmation status when applicable

### New Beginnings Brand Refresh

When a Fate’s Wheel Remorse outcome causes a roster firing, the resulting vacancy may be filled through the New Beginnings Invitational.

Once the resulting new hire or hires are finalized, OWL enters a mandatory Brand Refresh.

The Brand Refresh consists of exactly:

```text
2 wrestlers moving from Ascension to Revolt
2 wrestlers moving from Revolt to Ascension
4 total brand changes

Canon Mode creates a pending official result.

It becomes official only after confirmation.

A confirmed result enters Generator History.

A confirmed Generator result does not automatically perform a related Fire Pro, injury, endurance, championship, booking, or scheduling edit unless that specific workflow explicitly supports the edit and requires the appropriate confirmation.

### Test Mode

Test Mode demonstrates the Generator without changing official data.

Test results must never:

- Enter official Generator History
- Create an injury
- Change endurance
- Change availability
- Trigger a milestone
- Alter championship data
- Change booking data
- Change tournament data
- Create canon consequences

---

## 35. Generator History

Each confirmed Generator result must record:

```text
Generator result ID
Generator type
Mode
Eligible pool
Excluded entries
Individual rolls
Used roll
Final result
Date and time
Related wrestler
Related event or match
User confirmation
```

Injury results must additionally record:

```text
Primary injury roll
Severe-check roll
Severe-duration roll
Body-area determination method
Diagnosis pool
Selected diagnosis
Reinjury relationship when applicable
```

High-endurance results must additionally record:

```text
Completed-match milestone
Existing High areas
Eligible Normal areas
Selected area
Activation requirements
```

Dedicated Signature Series and ranking presets must preserve their relevant:

- Entrant or candidate pool
- Placement or selection order
- Case or outcome pool
- Exclusions
- Final assignments
- Canon confirmation

---

## 36. Public Injury Presentation

Public roster cards and wrestler profiles distinguish active medical states.

### INJURED

Recommended presentation:

```text
Red status
```

Public details may include:

- Diagnosis
- Affected anatomical sub-area
- Fire Pro endurance area
- Absence duration
- Expected return
- Post-return recovery duration

### RECOVERING

Recommended presentation:

```text
Amber status
```

Public details may include:

- Active competition status
- Affected area
- Low-endurance recovery period
- Expected full-clearance week

### CLEARED

A cleared injury remains in internal history but does not display an active public warning.

### Internal-only information

Do not publicly display:

- Raw rolls
- Severe-check percentages
- Generator eligible pools
- Prior endurance state
- Reinjury advantage mechanics
- Manual correction notes
- High-restoration administrative counters

---

## 37. Booking Availability

### INJURED

An injured wrestler is removed from:

- Match Booker selections
- Tournament eligibility
- Active wrestler drawings
- Championship-match booking
- Other competition-selection systems

A team containing an injured member is unavailable.

### RECOVERING

A recovering wrestler remains eligible for:

- Match booking
- Tournaments
- Rankings
- Championships
- Generator selections that permit active wrestlers

### CLEARED

A cleared wrestler has no injury-related booking restriction.

---

## 38. Change-Control Rule

Simulation rules must not be silently changed inside JavaScript.

Every meaningful change follows this order:

```text
1. Approve the rule
2. Update this rulebook
3. Add a revision-log entry
4. Update the data catalogs
5. Update the affected scripts and interfaces
6. Test the implementation
```

The code implements the rulebook.

The code does not privately redefine it.

---

## 39. Implementation Status

As of August 3, 2026, the approved OWL injury, endurance, and Generator systems have been implemented.

Completed components include:

- CRIT-only injury evaluation
- Standard one-, two-, and three-week injury outcomes
- Severe-injury checks
- Eight-, twelve-, and sixteen-week severe durations
- Severe championship-action requirements
- Severe champion title-decision confirmation
- CRIT cause-to-body-area determination
- Fire Pro Neck, Arms, Back, and Legs mapping
- Duration-based diagnosis generation from `data/injury-diagnoses.json`
- Required use of “bruise” instead of “contusion”
- Official injury-record creation
- INJURED, RECOVERING, and CLEARED status transitions
- Return and clearance Fire Pro confirmations
- Standard and severe Low-endurance recovery periods
- Match Booker injury protection
- Tournament injury protection
- Public roster and wrestler-profile medical statuses
- Same-area two-d10 reinjury evaluation
- Same-area Low-period aggravation
- Independent different-area injuries
- Multiple-active-injury handling
- Global Normal endurance baseline
- Individual endurance overrides and history
- Thirty- and seventy-five-match High milestones
- Two-area High maximum
- High milestone eligibility holds
- Random eligible Normal-area selection
- High-restoration tracking
- Healthy-week restoration resets after later injuries
- Standard and severe High-restoration requirements
- Test and Canon Generator boundaries
- Permanent Generator History
- Fate’s Wheel Generator preset
- Hex-Cell entry-order Generator preset
- Wildcard Play-In Generator preset
- Ranking-position Generator preset
- JoW private booking-style Generator preset

### Final launch validation

Before the public launch is declared clean, the repository must confirm:

```text
All required Control Room databases are healthy
All permanent roster records use valid endurance values
All individual endurance overrides are intentional
No temporary test matches remain
No temporary test match graphics remain
No fake injuries remain
No fake milestone activations remain
No fake Generator History entries remain
No temporary test tournament records remain
```

Fixed database totals must not be written into this rulebook because the number of managed files may legitimately increase as approved systems are added.

---

## 40. Revision Log

### August 12, 2026

Changed OWL’s universal wrestler rating baseline from 180 points to 160 points.

The 160-point baseline is now both:

- The starting rating for every active OWL wrestler
- The permanent minimum base rating before temporary bonuses

Championship bonuses and permanent progression rules remain unchanged.

Also documented the New Beginnings Brand Refresh process following a Fate’s Wheel Remorse firing.

The Brand Refresh requires:

- 2 wrestlers moving from Ascension to Revolt
- 2 wrestlers moving from Revolt to Ascension
- 4 total brand changes across the overall refresh window

The rule intentionally leaves wrestler-selection method, champion eligibility, and team/faction handling undefined until separately approved.

### August 1, 2026

Synchronized the Simulation Rulebook with the completed Control Room and Generator implementation.

Updated or corrected:

- Fate’s Wheel case assignment and outcome preset
- Hex-Cell entry-order preset
- Wildcard Play-In selection preset
- Ranking-position selection preset
- JoW private booking-style preset
- Removal of obsolete Generator “future work” language
- Current diagnosis-catalog implementation wording
- Canon and Test Mode consequence boundaries
- Generator History requirements for dedicated presets
- Future-proof Control Room database-health wording
- Final launch-cleanup validation requirements
- Broken Markdown code-block closure in the implementation-status section
- Current revision date

### August 1, 2026

Completed the Control Room implementation of the OWL injury and endurance system.

Added or finalized:

- Severe-injury Generator rolls and durations
- Championship-action classification and confirmation
- CRIT body-area mapping
- Duration-based diagnosis catalog integration
- Official injury-record creation
- Injury return and clearance actions
- Match Booker and tournament availability protection
- Public INJURED and RECOVERING presentation
- Same-area and different-area reinjury handling
- Global Normal endurance baseline
- Thirty- and seventy-five-match High milestones
- Generator-based High-area selection
- High-restoration tracking
- Healthy-week restoration resets after later injuries
- Complete module-order and empty-state validation
- Removal of obsolete implementation-pending language

### July 31, 2026

Finalized the complete OWL injury and endurance rules.

Added:

- Five-percent severe check after a primary roll of 10
- Eight-, twelve-, and sixteen-week severe durations
- Severe championship handling
- Four-week severe post-return Low period
- CRIT cause-to-body-part hierarchy
- Fire Pro Neck, Arms, Back, and Legs mappings
- Duration-based diagnosis catalog requirements
- Mandatory use of “bruise” instead of “contusion”
- Low, Normal, and High endurance terminology
- Same-area two-d10 reinjury rule
- Same-area aggravation extension
- Independent different-area injuries
- Multiple active injury handling
- Thirty- and seventy-five-match High milestones
- Two-area High maximum
- High milestone activation safeguards
- Standard and severe High-restoration requirements
- Expanded Generator History requirements

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
- Two-stage recovery foundation
- Booking eligibility foundation
- Public injury-status foundation
- Generator Canon and Test Mode boundaries
