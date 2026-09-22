# OWL Wrestling Website

Official repository for the OWL Wrestling website and Control Room.

Public site: https://wmid-owl.github.io/

## Internal Documentation

The repository uses three active internal source-of-truth documents:

- [OWL Simulation Rulebook](docs/OWL-SIMULATION-RULEBOOK.md) — Fire Pro settings, rating/progression rules, injuries, endurance, parameter balance, and Generator rules.
- [OWL Media Production Guide](docs/OWL-MEDIA-PRODUCTION-GUIDE.md) — match presentation, graphics, commentary, OWL Media, and publishing standards.
- [OWL Website & Control Room Operations Guide](docs/OWL-WEBSITE-CONTROL-ROOM-OPERATIONS-GUIDE.md) — repository workflow, Control Room data ownership, Results Wizard consequences, tournaments, Power Rankings, Landscape sync, automation, and publishing operations.

## Core Operating Rule

OWL follows an **enter data once** workflow.

Canonical information should be entered at its proper source and reused downstream rather than manually re-entered in multiple systems.

Examples:

- Match results are entered through Results Wizard.
- Tournament advancement is derived from the official result.
- Power Rankings calculate from canonical match/event/title data.
- Completed weekly OWL events are synced into The Landscape automatically.
- Public pages read the canonical JSON databases rather than maintaining duplicate manual copies.

## Repository Workflow

The production branch is:

```text
main
```

Normal local workflow:

```text
Pull main
Open the local Control Room in desktop Chrome
Connect the OWL repository folder
Make the approved change
Review changed files in GitHub Desktop
Commit and push
Verify the public site / automation result
```

Do not manually edit derived data unless the Operations Guide explicitly identifies a recovery or reconciliation procedure.
