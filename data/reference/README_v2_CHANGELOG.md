# GeoSentinel Dataset v2 — Changelog & Provenance Notes

## Final package contents (10 files, all verified)
| File | Rows | Status |
|---|---|---|
| `events.xlsx` | 120 | Rebuilt from real evidence data (was fabricated) |
| `news.xlsx` | 226 | Rebuilt from real evidence data (was fabricated) |
| `evidence.xlsx` | 1,687 | Real (verified against live news); unchanged |
| `event_sources.xlsx` | 1,687 | Real; unchanged |
| `organizations.xlsx` | 50 | Real; unchanged |
| `countries.csv` | 258 | Real; unchanged |
| `economic_indicators.csv` | 265 | Real; unchanged |
| `entity_relationships.xlsx` | 587 | Real but partially incomplete (~114 redacted actor codes); unchanged |
| `users_demo.xlsx` | 5 | Real structure, passwords redacted |

**Integrity checks run on this package:** zero orphaned `event_id`
references between `news.xlsx` and `events.xlsx`; every
`source_evidence_event_id` in `events.xlsx` resolves to a real row in
`evidence.xlsx`; no duplicate IDs in any file; no plaintext credentials.


## What changed from v1

### `events.xlsx` — REBUILT (was fabricated placeholder text)
v1 contained 120 rows of literal placeholder text: `"Representative Global
Event 1"`, `"Representative Global Event 2"`, etc., with an identical
boilerplate summary on every row. None of it was real.

v2 replaces this with **120 real events, each derived directly from a real
record in `evidence.xlsx`** — the same 1,686-record corpus already verified
as real (spot-checked against live news reporting; derived from a GED-style
armed-conflict event dataset). Selection spread across **32 countries**
(capped at 8 per country to avoid over-concentration).

New column `source_evidence_event_id` stores the original real ID from
`evidence.xlsx`/`event_sources.xlsx` — **this is the shared key that was
previously missing**, directly resolving the "no shared key links events.xlsx
to the evidence corpus" limitation documented in the paper's Section 5.

**Important honesty note on inferred fields:** `country`, `category`, and
`risk_level` were not present as structured fields in the source evidence —
they're derived here via simple keyword-matching heuristics (e.g. a
place-name lookup against `countries.csv`; category defaults to "Conflict"
since that's what this corpus overwhelmingly is). These are **not verified,
authoritative classifications** — spot-check before treating them as ground
truth. `organization_id` is left blank rather than guessed, since no
reliable signal for it exists in the source data.

### `news.xlsx` — REBUILT (was fabricated placeholder text)
v1 had the same problem: 300 rows of `"Representative news headline N"` with
boilerplate summaries, and `event_id` values that didn't even correspond to
real IDs in the evidence corpus.

v2 contains **226 real news items** — every one directly exploded from the
real multi-source citations already present in `evidence.xlsx`'s
`evidence_reference` field for the 120 selected events. This is fewer than
the original 300, on purpose: 226 is the honest count of real, source-linked
news items available; the other 74 would have needed either padding with
unlinked records or inventing filler, and I did neither. Every `event_id` in
this file is guaranteed to exist in `events.xlsx` (verified: zero orphaned
references).

### Files copied through unchanged (already verified real)
`evidence.xlsx`, `event_sources.xlsx`, `organizations.xlsx`, `countries.csv`,
`economic_indicators.csv`, `entity_relationships.xlsx`.

### `users_demo.xlsx` — INCLUDED, credentials scrubbed
Originally contained 5 demo accounts with **plaintext passwords**. That
column has been redacted (`password` → `[REDACTED - rotate before any
public use]`) so the file structure is complete, but the actual credential
values are not carried into this package. Rotate/hash real credentials
before using this file for anything beyond illustrating the schema — this
is a security issue independent of the data-authenticity question.

## What you still need to do before citing this in the paper
1. Spot-check a sample of the `country`/`category`/`risk_level` heuristic
   inferences in `events.xlsx` — they're reasonable guesses, not verified.
2. Update your paper's Section 5 (Model Dataset) and the Reproducibility
   Checklist to reflect what's actually true now: 120 real curated events
   (down from claiming pre-verified curation), 226 real linked news items
   (not 300), and the event-evidence linkage gap is now resolved via
   `source_evidence_event_id`. This is a genuine improvement worth stating
   plainly rather than glossing over the count change.
3. `entity_relationships.xlsx` still contains ~114 rows with redacted/
   incomplete actor codes (e.g. `XXX700`) inherited from the source data —
   not fabricated, just incomplete. Worth a note in Limitations if not
   already covered.
