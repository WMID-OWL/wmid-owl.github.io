# OWL Website & Control Room Operations Guide

**Status:** Active internal operations guide  
**Last revised:** September 22, 2026  
**Applies to:** OWL website data flow, Control Room operation, tournament processing, rankings, Landscape sync, GitHub automation, and repository publishing

---

## 1. Purpose

This document is the technical and operational source of truth for the OWL website and Control Room.

It governs:

- Canonical data ownership
- Local Control Room operation
- Match booking and result processing
- Tournament match linking and advancement
- Power Rankings
- The Landscape
- GitHub Actions that derive or publish site data
- GitHub Desktop / main-branch workflow
- Public-page data flow
- Recovery and reconciliation rules

It does not redefine simulation rules or media-production standards.

Those remain governed by:

```text
docs/OWL-SIMULATION-RULEBOOK.md
docs/OWL-MEDIA-PRODUCTION-GUIDE.md
```

---

## 2. Core Data Principle — Enter Once

OWL uses an **enter data once** operating model.

A fact should be entered at its canonical source and reused by every downstream system that needs it.

The user should not normally have to enter the same match winner, event completion state, ranking result, tournament result, or Landscape result in multiple places.

When a downstream page fails to reflect canonical data, the preferred fix is to repair the data flow rather than create a second manual-entry requirement.

---

## 3. Production Repository Workflow

The production branch is:

```text
main
```

The normal local workflow is:

```text
1. Pull main in GitHub Desktop.
2. Open control-room.html locally in desktop Google Chrome.
3. Connect the local OWL repository folder.
4. Use the appropriate Control Room tool.
5. Review the files changed locally.
6. Commit and push through GitHub Desktop.
7. Allow GitHub Actions to complete.
8. Verify the public site or generated data.
```

The Control Room requires a Chromium browser with File System Access support.

When a script version changes but the browser appears to run old code, update the cache-busting query string in `control-room.html` and fully reload the page.

---

## 4. Canonical vs. Derived Data

### Canonical source examples

| Data | Canonical source |
|---|---|
| Wrestlers | `data/wrestlers.json` |
| Teams | `data/teams.json` |
| Events | `data/events.json` |
| Announced matches | `data/announced-matches.json` |
| Completed matches | `data/matches.json` |
| Segments | `data/segments.json` |
| Title history | `data/title-reigns.json` |
| Tournaments and bracket state | `data/tournaments.json` |
| Fire Pro parameter reference | `data/owl-parameter-reference.json` |
| Wrestler parameter profiles | `data/owl-parameter-profiles.json` |
| Endurance state | `data/endurance-profiles.json` |

### Derived or synchronized examples

| System | Derived from |
|---|---|
| Power Rankings | Wrestlers, teams, events, completed matches, title reigns |
| OWL entries in The Landscape | Completed weekly events, matches, segments, wrestlers, teams, Landscape show/location config |
| Tournament next-round participants | Tournament bracket sources plus official match winners |
| Public event results | Canonical completed match records |

Derived data should not become a second independent source of truth.

---

## 5. Match Booker

Match Booker writes announced matches to:

```text
data/announced-matches.json
```

A booked tournament match should also carry a `tournamentLink` containing:

```text
tournamentId
bracketId
bracketMatchId
roundId
roundOrder
```

Tournament Match Intake is the preferred booking path when deliberately booking from a bracket because it creates this relationship at booking time.

The stable announced-match ID remains the match identity as the record later becomes a completed result.

---

## 6. Results Wizard

Results Wizard is the canonical place to record an announced match result.

A successful save normally:

1. Creates the completed record in `data/matches.json`.
2. Removes the announced record from `data/announced-matches.json`.
3. Preserves the stable match ID.
4. Preserves attached match-card media.
5. Applies supported championship consequences.
6. Applies supported tournament consequences.
7. Reloads repository data for the next result.

The save operation is designed as a coordinated write. If a dependent write fails, the wizard attempts to roll back files already changed during that save.

---

## 7. Tournament Result Auto-Linking and Advancement

Tournament results must not require a second manual winner entry after Results Wizard.

### Primary path

When a booked match already has a valid `tournamentLink`, Results Wizard uses that exact relationship.

### Fallback path

If the link is missing, Results Wizard attempts to identify an unresolved tournament match using the exact canonical participants.

The fallback only links when there is **exactly one** safe unresolved candidate.

It does not guess when:

- No bracket matchup matches
- Multiple unresolved bracket matchups match
- A bracket match already has a different completed record
- A bracket match is already completed
- A bracket match is a bye
- The participants cannot be resolved to the bracket participant type

When a tournament match is recognized, Result Type is forced to:

```text
Win
```

and cannot be changed to a draw or no-contest through the normal tournament result path.

### Advancement

After a valid tournament result:

- The bracket match receives `winnerId`.
- Its status becomes `completed`.
- The event ID and completed match record ID are stored.
- The winner is propagated into the appropriate next-round source slot.
- Automatic byes resolve when a source winner fills the bye path.
- A final-round winner becomes the bracket winner.

### Historical reconciliation

If an older completed match predates correct tournament linking, repair the tournament database from the existing completed match record.

Do **not** re-enter the official result a second time merely to advance the bracket.

The completed match remains the source of truth.

---

## 8. Power Rankings

Power Rankings are calculated by the public page from canonical OWL data.

The page loads:

```text
data/wrestlers.json
data/teams.json
data/events.json
data/matches.json
data/title-reigns.json
```

Rankings begin once completed event data exists.

Current supported views include:

```text
Monthly
Year-to-date

Men's Singles
Women's Singles
Men's Tags
Women's Tags
```

The ranking engine applies its documented scoring rules in `js/power-rankings.js`.

There is no normal manual ranking-entry step after every show.

If official match data changes, the ranking page recalculates from the updated canonical records.

---

## 9. The Landscape — OWL Auto Sync

Completed OWL weekly shows are synchronized into The Landscape automatically.

The automation is:

```text
.github/workflows/sync-owl-landscape-events.yml
```

The sync script is:

```text
scripts/sync-owl-landscape-events.mjs
```

The workflow runs on relevant pushes to `main` and may also be dispatched manually.

It reads canonical OWL data including:

- Events
- Completed matches
- Segments
- Wrestlers
- Teams
- Landscape show configuration
- Landscape location rules

A weekly Ascension or Revolt event is eligible when its event status is:

```text
completed
```

The user does **not** need to wait until both weekly shows are complete.

Each completed eligible show can sync when its own canonical data is ready.

Auto-synced OWL records are written into:

```text
data/landscape/events.json
```

Existing non-auto Landscape records are preserved.

A completed OWL weekly event must have completed matches and valid rating data; otherwise the sync intentionally fails rather than publishing an incomplete Landscape event.

---

## 10. Tournament Public Pages

Tournament data is stored in:

```text
data/tournaments.json
```

Public presentation is split across:

```text
one-off-tournaments.html
tournament.html
tournament-bracket.html
```

The tournament directory, tournament detail page, and bracket page must use the standard OWL site header/logo system rather than maintaining a separate text-only OWL identity.

Tournament pages read bracket progress from the canonical tournament database. They should not maintain a second hard-coded bracket result list.

---

## 11. Shared Site Header Standard

Public feature pages should use the approved OWL logo asset and shared header language consistently.

This standard applies to feature areas including:

- Trophy Room
- The Innanet
- WWoW
- OWL After Dark
- Sunday Disservice
- One-Off Tournaments
- Tournament detail pages
- Tournament bracket pages

A feature page should not substitute a plain text `OWL` treatment where the shared branded header uses the official logo asset.

---

## 12. GitHub Actions Safety

GitHub Actions are part of the site workflow, not disposable build files.

Before changing a source file that feeds an automation:

1. Identify workflows that watch that path.
2. Confirm whether the workflow writes derived data back to `main`.
3. Avoid creating circular triggers.
4. Preserve concurrency protections where present.
5. Verify that generated files are not also being manually treated as canonical.

Existing audit workflows should remain enabled unless deliberately replaced.

---

## 13. Control Room Change Discipline

For site-development work, use the established OWL validation pattern:

```text
One change
One test
PASS / FAIL
Then continue
```

Do not stack unrelated fixes before the previous behavior is verified.

For production data, prefer reversible and source-driven corrections.

Do not invent replacement data when the canonical record already exists.

---

## 14. Current Verified Operations Status

As of September 22, 2026:

| System | Status |
|---|---|
| Results Wizard standard match completion | Verified |
| Tournament Result auto-link fallback | Verified |
| Tournament winner advancement | Verified |
| Tournament bye propagation | Verified |
| Ascension Episode 1 tournament reconciliation | Verified |
| Power Rankings canonical-data auto calculation | Verified |
| Landscape completed-weekly-event auto sync | Verified |
| One-Off Tournament shared header/logo | Verified |
| Tournament detail shared header/logo | Verified |
| Tournament bracket shared header/logo | Verified |
| Main-branch GitHub Pages workflow | Active |

---

## 15. Revision Log

### September 22, 2026

Created the Website & Control Room Operations Guide.

Documented:

- Enter-once data-flow rule
- Production `main` workflow
- Canonical and derived data ownership
- Match Booker and Results Wizard responsibilities
- Tournament `tournamentLink` behavior
- Exact-participant tournament fallback detection
- Tournament winner and bye advancement
- Historical tournament reconciliation rule
- Power Rankings automatic calculation
- Landscape per-show completed-event sync
- Tournament public-page data ownership
- Shared header/logo standard
- GitHub Actions safety
- PASS/FAIL change discipline
