# Aurora — Build Ledger
Version: 0.1
Purpose: Permanent implementation and testing record

## How to use this document

This ledger is the operational memory of the Aurora rebuild.

The Master Blueprint describes what Aurora should become.

This document describes what has actually been built.

Never mark a feature complete because its screen exists. A feature is complete only when its behavior has been implemented and manually tested.

Every phase records:

- What was changed
- What works
- What was tested
- What failed
- What remains
- How the user should test it
- The Git checkpoint
- Important architectural decisions

## Status vocabulary

PLANNED — Defined but not implemented.

IN PROGRESS — Currently being implemented.

TESTING — Implemented and being manually tested.

PASSED — Tested successfully against the phase acceptance tests.

BLOCKED — Cannot proceed because of a known blocker.

DEFERRED — Intentionally postponed.

REPLACED — Superseded by a better design.

## Global rules

1. Do not add major features while a previous phase is unstable.
2. Do not hide broken behavior behind decorative UI.
3. Do not use browser alert/prompt dialogs for application editing.
4. Do not allow reader settings to modify interface settings.
5. Do not let individual pages invent their own navigation system.
6. Do not put AI provider logic directly inside UI components.
7. Do not make the manuscript depend on generated summaries.
8. Do not overwrite canonical story state automatically without a deliberate update.
9. Every destructive operation must have confirmation and recovery where possible.
10. Every completed phase must have a manual Android test.

# Phase 0 — Blueprint and foundation

Status: PASSED only when project documentation and repository structure are established.

Deliverables:

- Master Blueprint
- Build Ledger
- Repository structure
- Versioning strategy
- Basic architecture decision record
- Development/test procedure

Acceptance:

- Documents exist.
- Project can be checked out.
- A clean baseline can be identified.
- No old broken MVP behavior is treated as the new foundation.

Git checkpoint:
`v0.1-foundation`

# Phase 1 — Visual shell

Status: PLANNED

Build only:

- Aurora header
- Back button
- Bottom navigation
- Home shell
- Story shell
- Codex shell
- More/settings shell
- Cards
- Buttons
- Theme tokens
- Accent tokens
- Responsive mobile layout

Do not build AI.

Do not build story logic.

Do not build fake content interactions.

Acceptance tests:

- Every primary navigation button changes to the correct page.
- Back returns to the previous page.
- No button sends the user unexpectedly to Home.
- Layout works on Android phone widths.
- Theme changes do not crash.
- Accent changes do not crash.
- Loading states are visible.
- Disabled controls look disabled.

User tutorial:

The user learns the four primary destinations and the global Back behavior.

Git checkpoint:
`v0.2-shell`

# Phase 2 — Navigation architecture

Status: PLANNED

Build:

- Central route system
- History stack
- Nested navigation
- Modal/sheet system only where appropriate
- Back handling
- Route restoration
- Page transition behavior

Acceptance test:

Library → Story → Plan → Chapter → Scene → Reader → Editor

Back must reverse exactly through that path.

Opening Settings from any location and closing Settings must return to the exact previous location.

Git checkpoint:
`v0.3-navigation`

# Phase 3 — Library

Status: PLANNED

Build:

- Story cards
- Create
- Open
- Rename
- Edit metadata
- Delete
- Favorites
- Folders
- Move
- Search
- Sort
- Filters
- Recent
- Novel/comic categories

Acceptance:

Create a test story.

Find it.

Favorite it.

Move it into a folder.

Open it.

Return.

Search it.

Delete it.

Restore it from backup.

Git checkpoint:
`v0.4-library`

# Phase 4 — Concept Builder

Status: PLANNED

Build:

- New Concept
- Novel/comic choice
- Idea input
- Style choice
- Custom style
- My Taste choice
- AI concept generation
- Component regeneration
- Approval flow

Acceptance:

The user can enter one sentence and generate a concept without manually creating a prompt.

No action may unexpectedly navigate to Home.

Git checkpoint:
`v0.5-concepts`

# Phase 5 — Codex and Story Brain

Status: PLANNED

Build:

- Characters
- Locations
- Factions
- Items
- Rules
- Concepts
- Relationships
- Events
- Search
- Filters
- AI extraction
- Manual editing
- Entity linking

Acceptance:

Paste a sample chapter.

Extract entities.

Open each entity.

Edit it.

Return to manuscript.

Verify that the entity persists.

Git checkpoint:
`v0.6-codex`

# Phase 6 — Reader

Status: PLANNED

Build:

- Reader route
- Chapter navigation
- Progress
- TOC
- Fonts
- Font size
- Line height
- Paragraph spacing
- Margins
- Padding
- Width
- Themes
- Full screen
- Exit full screen
- Find
- Bookmarks

Critical architecture test:

Changing reader font size must not change any application UI text.

Acceptance:

Open chapter → reader → change font size → exit → application remains unchanged.

Enter full screen → exit → return to same position.

Git checkpoint:
`v0.7-reader`

# Phase 7 — Editor

Status: PLANNED

Build rich manuscript editing.

Acceptance:

Select text.

Bold.

Italic.

Underline.

Change font.

Change size.

Change color.

Highlight.

Insert image.

Find.

Replace.

Undo.

Redo.

Save.

Reload.

Verify persistence.

Git checkpoint:
`v0.8-editor`

# Phase 8 — Writing workflow

Status: PLANNED

Build:

- Write
- Continue
- Swipe
- Regenerate
- Rewrite
- Guide
- User direction
- Writing control modes

Acceptance:

Generate three alternatives.

Switch between them.

Accept one.

Verify only accepted text becomes manuscript canon.

Git checkpoint:
`v0.9-writing`

# Phase 9 — Memory and long context

Status: PLANNED

Build:

- Scene summaries
- Chapter summaries
- Arc summaries
- Character state
- Timeline
- Open threads
- Retrieval
- Context compiler

Acceptance:

Create a synthetic long story.

Generate enough chapters to simulate a very large work.

Verify that relevant old information can be retrieved without sending the entire manuscript.

Git checkpoint:
`v0.10-memory`

# Phase 10 — Branches and checkpoints

Status: PLANNED

Build:

- Branch
- Checkpoint
- Restore
- Compare
- Alternate generation
- Branch deletion
- Branch naming

Acceptance:

Create branch.

Change plot.

Return to main.

Verify main story is unchanged.

Git checkpoint:
`v0.11-branches`

# Phase 11 — Personal Taste Engine

Status: PLANNED

Build:

- Likes
- Dislikes
- Examples
- Preference strength
- Scope
- Snapshots
- Reset
- Edit
- Disable
- Learning from accepted/rejected generations

Acceptance:

Teach a deliberately artificial preference.

Generate text.

Verify preference influences output.

Reset snapshot.

Verify behavior returns to previous state.

Git checkpoint:
`v0.12-taste`

# Phase 12 — Author Library

Status: PLANNED

Build:

- Built-in profiles
- Preview samples
- Custom author creation
- Sample upload/paste
- Style analysis
- Save profile
- Rename
- Delete
- Per-story style selection

Acceptance:

Create a custom profile from sample text.

Save it.

Select it in a story.

Generate text.

Change profile.

Generate again.

Verify story preference remains intact.

Git checkpoint:
`v0.13-authors`

# Phase 13 — Anti-AI prose engine

Status: PLANNED

Build:

- Pattern evaluator
- User-specific disliked-pattern library
- Rewrite pass
- Before/after comparison
- Severity
- Disable/enable
- Learning from edits

Acceptance:

Provide known undesirable sample.

Run cleanup.

Verify unwanted patterns are reduced without destroying meaning or voice.

Git checkpoint:
`v0.14-prose`

# Phase 14 — NanoGPT orchestration

Status: PLANNED

Build:

- Provider abstraction
- NanoGPT connection
- Model selection
- Connection test
- Prompt compiler
- Context compiler
- Memory retrieval
- Style injection
- Cost estimation
- Token tracking
- Spending limit

Acceptance:

Connection succeeds.

Generation succeeds.

Provider errors are readable.

A failed request does not corrupt story state.

Cost is recorded.

Git checkpoint:
`v0.15-ai`

# Phase 15 — Comic Studio

Status: PLANNED

Build:

- Visual character bible
- Visual locations
- Page planning
- Panel planning
- Camera
- Composition
- Dialogue
- Image prompts
- Reference images
- Visual continuity

Acceptance:

Create character.

Generate visual specification.

Create page.

Create panels.

Verify the same character data is reused.

Git checkpoint:
`v0.16-comics`

# Phase 16 — Hardening

Status: PLANNED

Build:

- Offline behavior
- PWA install
- Performance optimization
- Error recovery
- Backup validation
- Import/export
- Storage migration
- Accessibility
- Mobile polish
- Crash/error logging
- Final cleanup

Acceptance:

Install PWA.

Reload.

Close browser.

Reopen.

Verify data persists.

Export.

Reset test copy.

Restore.

Verify story integrity.

Git checkpoint:
`v1.0`

## Current known issues from the abandoned MVP

These are recorded as lessons, not requirements to preserve the old implementation.

- Settings could become stuck.
- Settings could throw `Cannot read properties of null (reading 'readerFont')`.
- Reader could throw `renderSceneContent is not defined`.
- Reader font size affected global UI sizing.
- Settings lacked reliable navigation and scrolling.
- Browser-style editing prompts were too small and ugly.
- Many visible controls were nonfunctional.
- Some pages behaved as decorative content instead of real routes.
- Navigation could unexpectedly return to Home.
- The application did not make the workflow clear.
- The user could not easily understand what features did.
- The visible interface exposed concepts without enough contextual guidance.

These problems must not be carried into the rebuild.

## Test protocol

For every phase:

1. Build the smallest feature.
2. Test on the target Android phone.
3. Test normal flow.
4. Test Back.
5. Test reload.
6. Test accidental/rapid taps.
7. Test empty state.
8. Test invalid input.
9. Test persistence.
10. Test failure recovery.
11. Record results.
12. Only then expand the feature.

## User tutorial protocol

After every successful phase, provide the user:

- What was added.
- What each new control does.
- What should be tested.
- The best way to use it.
- Known limitations.
- What comes next.

Do not teach implementation details unless requested.

## Change-control rule

If a new idea conflicts with the Blueprint, do not silently implement it.

First classify it:

- Bug fix
- UX improvement
- New requirement
- Architecture change
- Experimental feature

Then update the Blueprint and Ledger before implementing it if the change affects the overall architecture.

## Final principle

Aurora is not finished when it has many features.

Aurora is finished when the user can create sophisticated stories and comics without needing to become an expert in prompt engineering, context management, lorebooks, presets, memory systems, or AI configuration.


# v0.9.25 — AI writing + Brain automation
Status: TESTING

Note: This is a vertical AI integration slice. It does not mark the full Phase 8/9/14 acceptance criteria as complete.

What changed:
- Restored the permanent project documents in the distribution package.
- Added a real NanoGPT-backed manuscript chapter generation action.
- Added centralized context compilation from Story Brain + current story position + recent manuscript.
- Added non-destructive Brain Assistant extraction and optional conservative automation.

What works by implementation inspection:
- NanoGPT chat request uses the existing working provider adapter.
- Generated prose remains a candidate until accepted.
- Brain Assistant produces review suggestions rather than silently overwriting memory.
- Safe auto-apply can create/update ordinary records but never deletes or promotes future/hidden information.

What is not yet verified:
- Live chapter-generation result quality on the user's NanoGPT account.
- Whether the model consistently respects all time/knowledge restrictions.
- Whether AI extraction is accurate enough for unattended use.

Manual Android acceptance test:
1. Generate a test chapter from a controlled Story Brain scenario.
2. Verify current facts are respected.
3. Verify future and hidden facts do not leak into character knowledge.
4. Accept chapter.
5. Run Brain Assistant.
6. Verify no duplicate entity is created.
7. Apply a safe suggestion and verify persistence.
8. Reject a bad suggestion and verify the manuscript is unchanged.

Next task after acceptance:
- Add a dedicated context inspector / "Why Aurora used this" view and then move into broader Phase 8 writing workflow and Phase 9 long-context retrieval only after this acceptance test passes.
