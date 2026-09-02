# Aurora — Build Ledger
Version: 0.2 (handoff update)
Date: 2026-09-02
Purpose: factual implementation/test record for the current rebuild

## IMPORTANT
This document records what is actually verified in the integrated prototype. "Exists in code" is not the same as "phase passed."

## Current base
Build: Aurora v0.9.25 — AI Writing + Brain Automation
Runtime entry point: `index.html`
Repository/reference files also include `app.js` and `runtime.js`.
The browser has historically executed the embedded application in `index.html`; future edits must verify the actual executing file before changing runtime behavior.

## Latest verified AI/provider results

### NanoGPT model catalogue
PASSED in manual Android testing.
The user successfully connected NanoGPT and saw approximately 632 models loaded in the text catalogue.

### Real NanoGPT generation
PASSED in manual Android testing.
The dedicated real-request test successfully reached the NanoGPT generation flow and returned a response after the user approved the ASK permission prompt.

### ASK permission popup
A bug existed where the permission dialog could remain on screen after approval.
v0.9.24 fixed the popup lifecycle. The user subsequently confirmed the flow worked.

### Brain-to-AI dependency test
PASSED as a meaningful integration test.
A deliberately minimal Chapter 1 was paired with Brain records containing information unavailable in Chapter 1. The generated Chapter 2 used multiple Brain-only facts including:
- Dorian Hale
- Blackglass City
- the death-registry alteration
- the Silent Court
- the abandoned clocktower
- Mara's brother/history

This proves that the compiled Brain context was injected and materially influenced generation.

### Important AI safety finding
The test also exposed a boundary weakness: a Brain secret saying Mara's brother is alive (while Mara does not know this) influenced the generated plot as a suspicion/reveal path. This was not a direct statement that Mara knew the secret, so it is not treated as a total failure, but it demonstrates that hidden/future knowledge gating needs stronger retrieval/reveal semantics before we trust the system for complex stories.

## Current AI writing implementation

Implemented in v0.9.25:
- Real NanoGPT text generation request
- Context compilation
- Current story position
- Story Brain collections
- Current/past/future state formatting
- Hidden/restricted knowledge block
- Recent manuscript context
- AI chapter candidate workflow
- Create new chapter
- Append to current scene
- Discard candidate
- Brain Assistant JSON suggestion flow
- Existing-entity matching
- State update preference over duplicate entities
- Brain automation modes: Off / suggest / auto-safe

## Brain context compiler behavior (verified from source)

Current writing system explicitly instructs the model:
- current states are present truth;
- past states are historical;
- future states are AI knowledge only and must not leak to characters unless explicitly revealed;
- hidden/restricted information is AI-level planning knowledge, not automatically character knowledge;
- story rules, arc/phase, character abilities, locations, relationships and open threads must be respected;
- recent manuscript prose takes precedence over stale summaries.

Current Brain context collection includes:
- characters
- locations
- factions
- timeline events
- open threads
- story rules
- custom entries
- current/past/future state timelines
- hidden/restricted knowledge
- recent manuscript text

Limit: current compiler takes bounded slices of records/recent prose; full long-context retrieval architecture is still later roadmap work.

## Story Brain UI/UX history and accepted fixes

The user required:
- deliberate delete controls/confirmation so accidental × taps do not delete.
- ability to create multiple custom styles and choose one or multiple active styles.
- Brain entry editors with flexible/custom fields in addition to standard fields.
- read mode for Brain entries plus edit/delete actions.
- reliable internal modal/form scrolling, including the earlier bug where upward scrolling stopped after reaching the bottom action area.
- large touch area for horizontal Brain tab navigation.
- separate, structured character/world/timeline/rules editors.
- character state history instead of duplicate character records.
- unified state/history concepts across Brain entities, not characters only.
- arcs/phases with a visible current story position.
- multi-tag search for stories with AND / match-all and OR / match-any behavior.
- story-level tags on every story.
- robust reader fullscreen scrolling.
- reader Find that keeps a match list and cycles through results without forcing the user to return to the top.
- Brain canon/knowledge controls that distinguish permanent/current/future/hidden/idea/rejected information.

## Arc/phase behavior

The Story & Arcs screen now has:
- arcs as containers
- phases within arcs
- events within arcs/phases
- current arc
- current phase
- chapter/scene position
- story status
- completion state

Known design requirement:
Selecting a current arc must expose its phases. An arc's completed state must not erase its consequences.

## Tags

Story cards support tags.
Library tag filtering supports:
- match all
- match any
- multiple selected tags

Tags remain a first-class story metadata feature.

## Reader

User-verified:
- fullscreen scrolling eventually fixed.
- scrolling speed should remain normal and responsive.
- Find should cycle through matches while keeping navigation accessible.

Earlier reader issues and fixes included:
- reaching the bottom then being unable to scroll upward in fullscreen;
- Find jumping once then reporting no matches;
- Next being physically too far from the current match.
These were iteratively fixed and the user ultimately reported reader scrolling as fixed before the AI work began.

## Settings / NanoGPT UX

Current desired behavior:
- separate text and image model catalogues;
- manual text model ID field;
- manual image model ID field;
- connection state must accurately reflect real API behavior;
- no infinite loading;
- ASK permission before remote generation;
- request counter/limit stored locally;
- API provider logic isolated from story engine.

## Important historical provider failures (DO NOT REPEAT)

Multiple v0.9.11–v0.9.23 builds were generated while diagnosing NanoGPT:
- API key binding/display mismatch;
- connection state that remained "testing" or "loading";
- model lists returned but UI did not populate;
- OAuth/relay experiments that were later removed;
- wrong-runtime edits (changing `app.js` while the actual application logic was embedded in `index.html`);
- connection and model-loading operations fighting each other;
- unnecessary transport changes after the basic model catalogue already worked.

Stable lesson:
Before changing a provider bug, inspect the actual executing file and reproduce the failure path. Do not patch only a reference file.

## Current unresolved work

1. Full long-context retrieval and token-efficient context compilation.
2. Stronger hidden/future knowledge gating and character-specific knowledge resolution.
3. Provenance and approval state for AI-extracted Brain changes.
4. Better automatic state-transition logic across all entity types.
5. More deliberate handling of AI-invented facts vs established canon.
6. Full taste/author/anti-AI prose engines.
7. Branches/checkpoints.
8. Image generation integration.
9. Phase 14 full budget/cost accounting.
10. Final PWA/offline/import/export/hardening.

## Immediate next task

Do not add another large feature yet.

First finish the Brain dependency test suite:
- current-state adherence
- past-state adherence
- future-state non-leak
- hidden-secret non-leak
- character-specific knowledge boundaries
- arc/phase current-position filtering
- AI invention provenance

Then use the results to harden the context compiler.

## Definition of done for an AI feature

- real request works
- correct context is compiled
- output can be inspected
- accepted output is separated from candidate output
- failures are readable
- no story-state corruption
- mobile workflow works
- Ledger records the manual test
