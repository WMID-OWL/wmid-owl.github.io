# OWL Media Production Guide

**Status:** Active internal production guide  
**Last revised:** August 3, 2026  
**Applies to:** OWL match presentation, commentary, audio production, event graphics, OWL Media programming, and platform publishing

---

## 1. Purpose

This document is the internal source of truth for OWL Wrestling media production and publishing.

It governs:

- Standard match presentation
- Commentary and audio production
- Platform-specific publishing
- Event and match-card graphics
- OWL After Dark
- Sunday Disservice
- The Innanet
- Tournament-specific presentation formats
- Future media-production revisions

This guide does not govern:

- Fire Pro simulation settings
- Wrestler ratings
- Championship progression
- Injuries
- Endurance
- Booking eligibility
- Generator procedures

Those systems remain governed by:

```text
docs/OWL-SIMULATION-RULEBOOK.md
```

Technical website and Control Room implementation procedures should eventually be documented in a separate operations guide.

---

## 2. Standard Match Presentation

Normal OWL matches should retain their approved full-match presentation unless a specific show, tournament, or media format has an approved exception.

A special social-media edit must not silently replace the standard presentation for:

- Ascension
- Revolt
- Monthly PPVs
- Championship matches
- Signature Series matches
- Regular YouTube match uploads

Any approved presentation exception must be documented in this guide.

### OWL After Dark

OWL After Dark is OWL’s weekly post-show program.

It releases Wednesday night after Revolt and covers both completed weekly shows:

```text
Tuesday — Ascension
Wednesday — Revolt
```

The program should:

- Cover Ascension and Revolt together
- Remain focused entirely on OWL
- Highlight the most important results, developments, and consequences
- Avoid becoming a full match-by-match replay
- Feel like a polished post-show and sports recap
- Remain shorter than a full podcast

OWL After Dark uses two consistent AI hosts with distinct personalities and speaking roles.

Their identities, perspectives, and voices should remain consistent between episodes.

The written-content automation is complete.

Final voice and video production may continue through the approved external production workflow.

### OWL After Dark Live Broadcast Graphics

OWL After Dark includes a standalone lower-third ticker system for live broadcast presentation.

The ticker is independent from individual After Dark episode records.

It may exist, be edited, published, replaced, or deleted whether or not a manual After Dark episode record currently exists.

The approved ticker presentation is:

```text
Continuous crawl

The full title is:

```text
Sunday Disservice: The Gospel According to Trey Wise
```

Sunday Disservice releases on Sunday after the completed OWL week.

An episode may cover:

- Ascension
- Revolt
- That week’s PPV, when applicable
- Major ongoing OWL stories
- Narratives leading into the following week

Sunday Disservice is an audio-first program presented publicly with static show artwork and playable episode audio.

The host is:

```text
Trey Wise
```

Trey Wise is:

- Polished
- Confident
- Opinionated
- Comfortable challenging popular narratives
- Willing to criticize conventional wisdom
- Capable of having favorites and blind spots
- Reluctant to admit when he is wrong

He presents his opinions as authoritative and treats the audience as his congregation.

His writing should not be reduced to neutral match recaps.

The written-content pipeline is complete.

The ElevenLabs audio-production workflow and final end-to-end audio validation are currently:

```text
BACK-BURNERED / BLOCKED
```

The audio feature is not failed or abandoned.

Final production and validation will resume after the required paid ElevenLabs workflow becomes available.

### The Innanet

The Innanet is currently a primarily text-based social platform.

Active capabilities include:

- Text posts
- Account identities
- Account branding
- Account icons
- Profile pictures
- Profile-picture uploads
- Canon social reactions and discussions

The following capabilities remain deliberately back-burnered:

- Photo posts
- Meme posts
- GIF posts
- Other embedded visual media

Those features are not required for the current weekly OWL workflow.

Their absence should not block normal Innanet publishing.

Development may resume after the required source images, memes, GIFs, and related media have been gathered.

When visual-media support is eventually developed, it should extend the existing text feed rather than replace it.

---

## 3. Commentary and Audio Production

Normal OWL match presentation may use the established ElevenLabs commentary workflow.

OWL uses trained announcer voices rather than requiring live commentary recording.

Commentary should support the match rather than overpower it.

It should:

- Identify major story developments
- Reinforce character and rivalry context
- Highlight meaningful momentum shifts
- Treat major moves and finishes with appropriate importance
- Avoid unnecessary repetition
- Avoid narrating every minor action when the match footage already communicates it clearly

Not every media format requires full commentary.

Music, original match audio, narration, or abbreviated commentary may replace full play-by-play when an approved format calls for it.

### OWL After Dark Audio

OWL After Dark uses two consistent host voices.

The hosts should remain distinguishable through:

- Different perspectives
- Different speaking rhythms
- Different reactions
- Clearly assigned discussion roles
- Consistent personalities between episodes

### Sunday Disservice Audio

Trey Wise should use one consistent ElevenLabs voice.

The final performance should sound like an opinion program rather than traditional wrestling commentary.

Sunday Disservice audio validation remains blocked until the paid ElevenLabs production workflow can be completed and tested end to end.

---

## 4. Platform Publishing Guidelines

OWL content may require different edits depending on the destination platform.

### X / Twitter

X may be used for:

- Short match edits
- Compilation-style videos
- Major match moments
- Promotional clips
- Tournament-specific edits
- Character-focused moments

Videos should reach the important material quickly and avoid unnecessary lead-in time.

### Instagram

Instagram Reels may be used for:

- Short match edits
- Highlight compilations
- Promotional clips
- Character-focused moments
- Tournament-specific edits

Vertical formatting may be created when it improves presentation without making the match difficult to follow.

### YouTube

OWL’s official YouTube channel is:

```text
https://www.youtube.com/@WeAreTheOWLefed
```

YouTube may be used for:

- Full matches
- Longer match edits
- OWL programming
- Audio programs presented with static artwork
- Promotional videos
- YouTube Shorts when appropriate

YouTube must be handled separately when copyrighted music is involved.

Copyrighted music may trigger:

- Content ID claims
- Monetization claims
- Regional restrictions
- Audio muting
- Video blocking
- Copyright strikes

Adding an original introduction before copyrighted music does not guarantee that automated detection will be avoided.

Any music-based YouTube upload must be treated as a test rather than a proven copyright workaround.

---

## 5. Event and Match-Card Graphics

OWL uses two separate event-page graphic types.

### Event poster

The event poster represents the overall identity of the weekly event or PPV.

It appears in the event-page header.

The event poster may use portrait or other approved promotional dimensions.

### Match-card graphic

A match-card graphic promotes one specific match.

It appears with that match inside the event page’s card or results section.

The event poster and match-card graphic serve different purposes and must not replace one another.

### Approved use

Custom match-card graphics may be used for:

- Ascension
- Revolt
- Monthly PPVs
- Championship matches
- Signature Series matches
- Tournament matches
- Other announced matches with approved artwork

A custom match-card graphic is optional.

A match without custom artwork must continue to use the normal text-based match presentation.

The system must not create:

- Empty artwork frames
- “Graphic coming soon” placeholders
- Blank columns
- Mandatory image requirements

### Match attachment

Each match-card graphic must attach to a specific match record.

The graphic must remain connected to the match when the record moves from:

```text
Announced match
```

to:

```text
Completed result
```

The match’s stable database ID is the attachment source.

Wrestler names alone must not be used as the permanent attachment key because participants, titles, or stipulations may be edited.

### Upcoming-event display

Before an event is completed, the graphic appears with its match inside:

```text
What’s on the Card
```

The match information remains the primary written source for:

- Competitors
- Match type
- Championship
- Stipulation
- Status
- Status note

### Completed-event display

After results are recorded, the same graphic remains attached and appears beside the completed match result.

It becomes part of the permanent event archive.

The graphic must not be discarded merely because the match is no longer upcoming.

### Supported orientations

The system supports:

```text
Landscape
Portrait
Square / Adaptive
```

The Control Room automatically detects the image orientation from its original dimensions.

A manual display-layout override may be used when the artwork should use a different presentation frame.

### No-cropping rule

Match-card graphics must display the complete image.

The public site and Control Room preview must use contain-style presentation rather than cropping.

The display must preserve:

- Wrestler names
- Faces and bodies
- Event logos
- Dates
- Match labels
- Championship graphics
- Text near image edges
- Other intentional artwork details

Unused space inside the presentation frame may use the approved dark OWL background.

The system must not use a crop merely to force every image into identical dimensions.

### Responsive presentation

On larger desktop screens:

- The graphic appears beside the match information
- Landscape images may use a wider frame
- Portrait images use a narrower, taller frame
- Square images use a controlled square frame
- The artwork must not dominate the entire event page

On mobile and narrow screens:

- The graphic stacks beneath the match information
- The graphic is centered
- The full image remains visible
- Portrait images use a controlled maximum width and height
- Landscape images use the available content width
- Horizontal page scrolling must not be introduced

### Full-image view

A displayed match-card graphic may be opened in a full-image lightbox.

The lightbox must:

- Preserve the image’s natural orientation
- Display the complete image
- Avoid horizontal scrolling
- Allow vertical scrolling on shorter desktop browser windows
- Keep the close control accessible
- Close through the close button
- Close through the Escape key
- Close when the user selects the dark background

### Image optimization

The Control Room Match Card Graphic uploader is the approved import method.

The uploader automatically:

- Reads the source dimensions
- Detects portrait, landscape, or square orientation
- Preserves the original aspect ratio
- Resizes overly large source files
- Avoids enlarging smaller source files
- Converts the site version to WebP
- Creates a predictable event-and-match destination path
- Stores the final dimensions and orientation
- Attaches the graphic to the selected match
- Supports replacement
- Supports removal

The optimized website copy does not replace the creator’s original design master.

Full technical storage, browser-processing, and repository-writing procedures belong in the future OWL Website and Control Room Operations Guide.

---

## 6. Tournament-Specific Presentation Formats

Tournament-specific media formats may be approved when they give an event a distinct identity or substantially reduce unnecessary production work.

An approved format applies only to the tournament named in its section.

It must not automatically carry over to other OWL shows, PPVs, tournaments, or Signature Series events.

### Bragging Rights Match Edit Posts

For the Bragging Rights tournament only, each match may be presented as a fast-paced, music-driven compilation rather than a full-length match upload.

#### Target Length

Condense each match to approximately:

```text
2–3 minutes
```

The exact length may vary when a match requires slightly more or less time to communicate its story clearly.

#### Editing Style

The edit should resemble a strong wrestling compilation created for social media.

Prioritize:

- The strongest action
- Major momentum shifts
- Signature sequences
- Important counters
- Meaningful near falls
- Character moments
- The finish
- Immediate aftermath when relevant

The match action should be allowed to tell the story without requiring full play-by-play commentary.

#### Music and Commentary

Use the selected music as the primary audio bed.

Full match commentary is not required for this format.

This approach is intended to:

- Reduce production time
- Give Bragging Rights a distinct presentation
- Keep each edit moving quickly
- Allow the match footage to carry the story
- Produce content suited to social platforms

Original match audio may remain when it strengthens the edit.

#### Primary platforms

The main publishing destinations are:

```text
X / Twitter
Instagram Reels
```

Each version may be adapted to the dimensions and length requirements of its platform.

#### YouTube handling

YouTube must be treated as a separate version because copyrighted music may be detected.

A test version may include:

```text
Approximately 30 seconds of original match introduction
followed by the music-driven match edit
```

The introduction may help establish the match and tournament presentation.

It must not be treated as reliable protection against Content ID detection, copyright claims, restrictions, or strikes.

When the selected music creates unacceptable copyright problems, the YouTube version may require:

- Different music
- Licensed music
- Copyright-safe music
- More original match audio
- A substantially different edit
- No YouTube upload

#### Scope restriction

This presentation format applies only to:

```text
Bragging Rights
```

It does not replace OWL’s normal match-production format.

---

## 7. Current Production Status

As of August 12, 2026:

| System | Status |
|---|---|
| OWL After Dark written automation | Complete |
| OWL After Dark live broadcast crawl ticker | Complete |
| Sunday Disservice written automation | Complete |
| Sunday Disservice audio production and validation | Back-burnered / Blocked pending paid ElevenLabs workflow |
| Innanet text publishing | Complete |
| Innanet Account Manager | Complete |
| Innanet branding and icons | Complete |
| Innanet profile-picture uploads | Complete |
| Innanet image, meme, and GIF posts | Back-burnered pending source-media collection |
| Event-poster uploader | Complete |
| Match-card graphic uploader | Complete |
| Match-card orientation detection | Complete |
| Match-card WebP resizing and optimization | Complete |
| Match-card upcoming-event display | Complete |
| Match-card completed-result display | Complete |
| Match-card mobile presentation | Complete |
| Match-card full-image lightbox | Complete |
| Match-card short-window desktop scrolling | Complete |
| Bragging Rights social-edit format | Approved |
| Official OWL YouTube channel update | Complete |

---

## 8. Change-Control Rule

Media-production standards must not be silently changed inside automation scripts.

Every meaningful production-format change should follow this order:

```text
1. Approve the production decision
2. Update this guide
3. Add a revision-log entry
4. Update the affected templates or automation
5. Test the production workflow
```

The automation should implement the approved production guide.

The automation should not privately redefine OWL’s media format.

---

## 9. Future Documentation

The following subjects belong in a future OWL Website and Control Room Operations Guide rather than this document:

- Control Room file-writing procedures
- Database connection procedures
- Weekly Runbook interface behavior
- Mobile wrestler portrait-framing controls
- Live portrait previews
- Homepage responsive-layout fixes
- Trophy Room implementation
- Annual video-game cover implementation
- Account Manager technical behavior
- Media upload technical procedures
- Match-card WebP processing
- Match-card destination-folder creation
- Match-record media attachment
- Match-card replacement and removal behavior
- Event-page lightbox implementation
- GitHub Pages publishing checks
- Custom-domain deployment procedures

---

## 10. Revision Log

### August 12, 2026

Updated the OWL After Dark production standards to reflect the completed Live Broadcast Graphics system.

Documented:

- Standalone After Dark lower-third ticker
- Continuous-crawl presentation as the approved active format
- Independence between ticker publishing and episode records
- Separate Control Room review, publish, and delete actions
- Desktop and mobile broadcast presentation
- Current production status of the completed ticker system

### August 3, 2026

Synchronized the production guide with the completed Match Card Graphics system and current OWL Media priorities.

Documented:

- Match-card graphics as an approved event-page presentation feature
- Separation between event posters and match-specific graphics
- Match-level database attachment
- Preservation from announced cards into completed results
- Landscape, portrait, and square support
- Automatic orientation detection
- Manual display-layout override
- No-cropping presentation rule
- Desktop and mobile display behavior
- Full-image lightbox behavior
- Vertical lightbox scrolling on shorter desktop windows
- Automatic WebP resizing and optimization
- Optional artwork behavior
- Current Match Card Graphics implementation status
- Sunday Disservice audio remaining back-burnered until the paid ElevenLabs workflow is available
- Innanet visual media remaining back-burnered until source media is gathered
- Technical Match Card Graphics subjects reserved for the future operations guide

### August 2, 2026

Created and expanded the OWL Media Production Guide.

Documented:

- Standard OWL match-presentation boundaries
- OWL After Dark format and production status
- Sunday Disservice format and Trey Wise’s host identity
- Blocked Sunday Disservice audio validation
- Innanet active production capabilities
- Back-burnered Innanet image, meme, and GIF support
- ElevenLabs commentary and audio-production standards
- Platform-specific publishing guidelines
- Official OWL YouTube channel
- Copyright limitations for music-driven YouTube uploads
- Bragging Rights music-driven match-edit format
- Bragging Rights social-platform priorities
- Current OWL Media production status
- Separation between production rules and technical operations
