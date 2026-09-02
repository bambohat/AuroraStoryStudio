# AURORA AI STATE

## Current checkpoint — v0.6.0 — Story Brain Memory Redesign

- Reworked the confusing Phase 5.6 canon UI into a simpler Story Memory model.
- Normal records default to Established fact; Current State, Idea, Rejected, time scope, knowledge scope, reveal lock, and protected fact are advanced controls.
- Added story-position data: current arc, phase, chapter/scene, and arc status.
- Added a first lightweight Arc registry so completed arcs can be distinguished from the current arc.
- Story Brain Overview now surfaces current story position and hidden-knowledge count.
- Legacy canon fields remain readable for migration/compatibility; new saves write the new memory fields too.
- This build is still data/UI foundation only: the actual AI retrieval, knowledge filtering, reveal gating, state-transition automation, and output leak checker are NOT connected yet.

### Test focus for v0.6.0
1. Open Story Brain and create/edit a Character, Location, Event, Thread, Rule, and Custom entry.
2. Confirm normal editing no longer forces Permanent Canon.
3. Open Story Memory and test Established / Current State / Idea / Rejected.
4. Test Who can know this, Hidden until unlocked, and Protect this information.
5. Open Story position, save an arc/phase/chapter, and add an arc.
6. Return to Overview and confirm the current position and hidden-knowledge count display.
7. Confirm scrolling, Back, Read, Edit, Delete, and existing custom fields still work.


Version: 0.5.40
Checkpoint: v0.6.0-phase-5.6-canon-protection
Status: PHASE 5.6 — CANON PROTECTION TESTING

## What Aurora is

Aurora is a private, mobile-first PWA for creating, developing, writing, reading, and eventually illustrating novels and comics with AI. It is designed to hide prompt/context complexity and let the user express creative intent naturally.

The user strongly dislikes cluttered interfaces, manual prompt engineering, complicated character cards, unreliable navigation, and features that look implemented but do not work.

The application must be beautiful, modern, smooth, mobile-first, and easy enough that the user never needs to understand the underlying AI machinery.

## User's core requirements

- Extremely simple normal UI.
- Advanced systems exist but are hidden under Advanced.
- Contextual tips should explain unfamiliar controls.
- Clear hierarchical Back navigation; never use Home as a substitute for Back.
- High-quality reader with independent reader settings.
- Rich editor.
- Library/archive with search, filters, folders, favorites, sorting and organization.
- Concept-first creation.
- AI should turn a vague idea into concept → characters/world → outline → chapters.
- Automatic/progressive character and Codex creation.
- Persistent long-term story memory.
- Branches/checkpoints/versions.
- Swipe/regenerate candidates without polluting canon.
- Personal Taste Engine that learns from edits, choices and feedback.
- Author/style library and custom style analysis.
- Anti-AI/slop prose system based on the user's actual taste.
- NanoGPT integration with strict cost awareness.
- Novel and comic workflows sharing a common Story Brain.
- Local/private-first data.

## Important style/taste requirements

The user does not want a universal preset forced on them.

They may want:
- AI to write the user's actions and dialogue, or not.
- First, second, third, or multiple POVs.
- Different behavior per story/chapter/scene.
- Author style plus personal taste modifications.
- Low decorative sensory detail.
- Low unwanted purple prose and figures of speech.
- Avoid generic LLM sensory descriptions such as automatic ozone/diesel/spice atmosphere.
- Concrete, purposeful prose.
- The system must learn exceptions instead of treating preferences as absolute rules.

## Phase 1 scope

Phase 1 is ONLY the visual shell.

Implemented:
- Aurora mobile shell.
- Home is intentionally focused; primary destinations are accessed through the bottom navigation instead of duplicate Home cards.
- Tapping the Aurora logo/brand in the top bar always resets navigation to Home.
- Settings has an explicit Save & Close control; visual settings persist locally on the device.
- Android Chrome pull-to-refresh is disabled for the app shell while normal scrolling remains available.
- Home.
- Library placeholder.
- Create placeholder.
- Settings.
- Bottom navigation.
- Hierarchical Back.
- Help modal.
- Contextual tips.
- Dark/light appearance.
- Accent color themes.
- Responsive mobile layout.
- No AI.
- No fake story generation.
- No fake persistence claims.

Not implemented yet:
- Real story database.
- Library search/folders/favorites.
- Concept generation.
- Codex.
- Outline.
- Reader.
- Editor.
- Memory.
- Branching.
- Taste Engine.
- Author Engine.
- Anti-slop engine.
- NanoGPT.

## Architecture rules already established

1. Reader settings must be isolated from interface settings.
2. Navigation must be centralized and hierarchical.
3. No browser prompt()/alert() for important editing.
4. Visible controls must work or clearly state that they are planned.
5. AI provider logic must be isolated from UI.
6. Story truth is separate from generated prose.
7. Do not send the entire novel to the model.
8. User's explicit current instruction outranks learned taste.
9. Learned taste can have scopes and exceptions.
10. Every stable phase gets a checkpoint.
11. Every phase gets a user tutorial.
12. Do not patch a broken architecture repeatedly; rebuild the affected subsystem when necessary.

## Current implementation

Single-file local prototype:
- index.html

This is intentionally easy to run locally on Android before GitHub/PWA deployment.

## Current testing target

Android phone browser.

Phase 1 acceptance tests:

1. Open index.html.
2. Home loads without errors.
3. Tap Library → Library opens.
4. Tap Back → Home.
5. Tap Create → Create opens.
6. Tap Back → Home.
7. Tap More → Settings opens.
8. Tap Back → Home.
9. Open Settings from Home → change Dark/Light → interface remains usable.
10. Change every accent → no navigation and no crash.
11. Open Help → close with × → same page remains.
12. Toggle Help tips → tips appear/disappear.
13. Rapidly tap navigation and Back → no unexpected jump to Home except when Home is actually the previous route.
14. Rotate/resize browser if possible → layout remains usable.
15. In Settings, change theme/accent/help → tap Save & Close → settings are saved and the previous page opens.
16. Reload the page → saved theme/accent/help remain.
17. At the very top of a long page, drag downward → no browser pull-to-refresh occurs; normal upward/downward page scrolling still works.
18. From Library/Create/Settings, tap the Aurora logo → Home opens and navigation history is cleared.
19. Confirm Home no longer contains duplicate Library/Create/Settings destination cards; use the bottom navigation for those destinations.

## Phase 2 current refinement (v0.3.4)

User identified a settings behavior bug: changing theme, accent, or help immediately changed the committed application state before Save & Close. That violated the intended settings contract.

Fixed by separating committed settings from an in-settings draft:
- Opening Settings creates a draft copy of the current saved/committed settings.
- Theme selection changes only the draft; the rest of Aurora does not change.
- Accent selection changes only the draft; the rest of Aurora does not change.
- Help-tip toggle changes only the draft.
- Back, Aurora/Home, or another navigation action without Save & Close discards the draft.
- Save & Close writes the draft to localStorage first, then commits it and returns to the previous route.
- If persistence fails, committed settings remain unchanged and Settings stays open.
- Settings text explicitly says changes are staged until Save & Close.

This is the intended settings behavior going forward: **no setting applies globally until the user explicitly saves.**

## User verification history

v0.3.1 navigation was manually verified by the user as working as intended.
v0.3.2 introduced worse startup delay and was rejected.
v0.3.3 removed that regression and restored fast startup; user approved it.
v0.3.4 addresses the newly reported unsaved-settings behavior. It is awaiting user verification.

## Known limitations

- Library/Create screens are deliberately placeholders.
- No service worker/PWA layer yet.
- No NanoGPT connection.
- No story content database.

## Current refinement (v0.2.2)

- Removed redundant Library, Create, and Settings cards from Home because those destinations already exist in the persistent bottom navigation.
- Made the Aurora logo/brand a global Home control. It always returns to Home and clears route history, preventing a later Back action from returning to the previous section.
- Added a real Save & Close control to Settings. It stores theme, accent, and help-tip preference in localStorage and returns to the previous route (or Home).
- Added an Android pull-to-refresh guard using overscroll behavior plus a top-edge touch guard; ordinary page scrolling remains enabled.
- Updated the Settings explanation so it no longer claims there is nothing to save.

## User verification — 2026-09-01

The user manually tested v0.2.2 and reported that everything works great, including navigation and visual design. The user explicitly approved this version as the stable Phase 1 baseline.

Verified by user:
- Navigation/clicking works.
- Visual design is satisfactory.
- Settings Save & Close works.
- Settings persistence works.
- Pull-to-refresh behavior is fixed.

This version is the known-good Phase 1 checkpoint. Do not modify this baseline when starting Phase 2; branch/copy from it and preserve it for rollback.

## Regression history

Old MVP v1-v5 are abandoned reference implementations because they had severe architecture/UI problems including broken settings, reader errors, global font scaling, dead buttons and bad navigation.
- v0.2.0 → v0.2.1: Home navigation refinement requested by user; no known regressions introduced.
- v0.2.1 → v0.2.2: Added local Settings save/close and pull-to-refresh prevention requested by user. User manually tested and approved the version as stable; no known regressions.

Do not copy their architecture.

## Next task after Phase 1 passes

Phase 2 — Navigation architecture.

The navigation shell should then be converted from the Phase 1 prototype into a reusable centralized route/history system before Library data is added.

## How to continue

Read this file first.
Inspect the current code.
Do not assume unimplemented features work.
Do not add AI yet.
Run the Phase 1 acceptance tests before proceeding.


## v0.3.3 correction — 2026-09-01

User reported that v0.3.2 was worse: the app was visibly stuck for several seconds on startup before controls became tappable. Investigation found the v0.3.2 source had accumulated duplicated navigation functions and an unnecessary boot overlay/initialization path.

Correction: rebuilt Phase 2 cleanly from the known-good v0.2.2 stable baseline instead of patching the regressed v0.3.2. Removed the boot overlay and requestAnimationFrame boot sequence. Kept the simple local settings persistence and pull-to-refresh protection from the stable baseline. Implemented exactly one `go`, `back`, and `goHome` function, with a single navigation history stack and session restoration.

Important: v0.3.0 and v0.3.2 are regression candidates, not stable baselines. v0.2.2 remains the last user-verified visual baseline. v0.3.3 is the clean Phase 2 candidate for testing.

### Required Phase 2 tests
- Cold-open: controls should be tappable immediately/without a multi-second artificial startup screen.
- Home → Library → Create → More → Back repeatedly must walk backward through the exact history.
- Settings Save & Close must return to the exact previous route.
- Aurora brand must always return Home and clear history.
- Reload must restore the current root route.
- Pull-to-refresh must remain disabled while normal scrolling works.


## v0.3.5 change — Settings live preview

User requirement:
- Setting changes must be visibly previewed immediately while Settings is open.
- Preview is temporary draft state.
- Save & Close commits the draft.
- Back, Aurora/Home, or navigating away without saving discards the draft.
- The committed settings remain unchanged until Save & Close.

Implemented:
- Theme preview now changes the actual Aurora interface immediately while Settings is open.
- Accent preview now changes the actual Aurora interface immediately while Settings is open.
- Help-tip visibility previews immediately while Settings is open.
- Leaving Settings through navigation discards the draft before the destination renders.
- Settings UI explicitly labels the state as a live preview that is not saved yet.

Regression rule:
- Never allow unsaved Settings drafts to leak into other pages.


## STABLE CHECKPOINT — v0.3.5

User verification:
- User explicitly confirmed v0.3.5 is working great and matches the requested behavior.
- Navigation behavior is accepted.
- Settings live preview is accepted.
- Unsaved Settings changes are discarded when leaving without Save & Close.
- Save & Close commits Settings.
- Pull-to-refresh protection is accepted.
- Startup responsiveness from v0.3.3 clean rebuild is accepted.

This version is now the authoritative Phase 2 baseline.

Do not modify this stable checkpoint directly.
Future work must branch from/copy v0.3.5-STABLE so rollback remains possible.

Next phase:
- Phase 3 — Library / Archive foundation.


## v0.4.0 Library foundation — current candidate

Built directly from the user-accepted v0.3.5-STABLE baseline after a previous malformed Phase 3 patch caused a blank page.

Implementation is intentionally simple and self-contained:
- Local Library storage in localStorage.
- Create Novel/Comic.
- Open/detail.
- Back from detail to Library.
- Rename using in-app modal.
- Delete using in-app modal.
- Favorite.
- Search.
- Filters.
- Sorting.
- Empty state.

No AI, Concept Builder, Codex, folders, backup/restore, reader/editor, or memory yet.

Regression warning:
- Do not reuse the malformed v0.4.0 patch attempt that produced a blank page.
- v0.3.5-STABLE remains the rollback baseline.


## v0.4.1 Create UI regression fix

User found the Create page visually broken:
- Native browser text input styling.
- Novel/Comic controls looked like unstyled browser buttons.
- Spacing and visual hierarchy did not match Aurora.

Fix:
- Added Aurora-styled field/input.
- Added Aurora-styled segmented Novel/Comic selector.
- Added focus states.
- Added helper text.
- Kept existing local Create behavior unchanged.


## v0.4.2 — Library sorting expansion

User feedback:
- Existing sorting appeared not to change the Library.
- Library sorting was too barebones.

Implemented:
- Recently opened.
- Recently added.
- Recently changed.
- Oldest added.
- Title A–Z.
- Title Z–A.
- Progress high → low.
- Progress low → high.
- Favorites first.
- Type.
- Deterministic title tie-breaking.
- Explicit sort-change feedback toast.

The sort state is now a real, persisted-in-session UI state and re-renders the Library immediately when changed.


## STABLE CHECKPOINT — v0.4.2

User explicitly confirmed v0.4.2 is impressive and everything is good.

Verified/accepted:
- Phase 1 visual shell baseline.
- Phase 2 navigation architecture.
- Settings live-preview/draft behavior.
- Hierarchical Back.
- Aurora brand → Home/reset.
- Pull-to-refresh protection.
- Startup responsiveness.
- Phase 3 Create UI.
- Real local Library items.
- Novel/Comic types.
- Open/detail.
- Rename.
- Delete.
- Favorites.
- Search.
- Filters.
- Expanded sorting:
  - Recently opened
  - Recently added
  - Recently changed
  - Oldest added
  - Title A–Z
  - Title Z–A
  - Progress high → low
  - Progress low → high
  - Favorites first
  - Type

This is now the authoritative stable Phase 3 baseline.

Future work must branch from v0.4.2-STABLE.
Do not modify this checkpoint directly.


## v0.4.1 Concept Builder UI

Built from the user-accepted `v0.4.2-STABLE` Library baseline.

Implemented only the user workflow:
- Four-step Idea → Format → Style → Review builder.
- Natural-language idea box.
- Novel/Comic selection.
- My Taste, Natural, Cinematic, Literary, Light Novel starting styles.
- Optional custom direction.
- Local staged state while moving between steps.
- Review screen.
- No AI calls.
- Build action only confirms the staged brief.

The full AI Concept Builder, character generation, world generation, outline creation, and project persistence come later.


## v0.4.2 — Concept Builder refinement

User feedback:
- Build should actually create the project and go to Library.
- Style choices need more substance than one-line labels.
- User needs a way to define a custom/reusable style.

Implemented:
- Review now requires a project title.
- Build & Open in Library creates a real local Library record containing the concept brief.
- Build navigates to Library and opens the newly created project.
- Built-in styles now expose concrete style traits.
- Added Create my own style.
- Custom style profile includes name, detailed style definition, and optional sample.
- Non-custom styles also allow extra project-specific direction.
- No AI calls yet; style sample analysis is planned for the later Author/Style phase.


## v0.4.3 — Style and Library refinement

User feedback:
- Custom styles need an explicit choice between temporary use and saving.
- The meaning of an optional writing sample was unclear.
- Library cards were too bare and needed useful story context.

Implemented:
- Custom style can be used for the current story only.
- Custom style can be saved to persistent local **My Styles**.
- Saved styles appear alongside the built-in styles for future projects.
- Saved styles can be updated by re-saving the same name.
- Saved styles can be removed.
- Writing sample now has an explicit explanation: it is an optional short sample of the user's own writing that can later help Aurora analyze observable style traits. It can be left empty.
- Library cards now show premise/summary and style when available.
- Story detail shows premise and style.
- Concept Build stores a structured concept summary with the Library item.

No AI calls are made yet.


## v0.4.3.1 technical cleanup

Removed a duplicate HTML field ID in the Style step so built-in style extra direction and custom-style definition are distinct inputs. This prevents ambiguous input handling on mobile.


## v0.4.4 — Custom style management refinement

User feedback:
- Delete was too easy to trigger.
- A saved custom style was effectively forced into edit mode, preventing creation of a separate new custom style.

Implemented:
- Delete now opens a deliberate in-app warning modal with Cancel and explicit Delete style actions.
- Saved style rows now have separate **Use**, **Edit**, and **Delete** actions.
- Added **＋ New custom style** to start a completely separate profile.
- Existing saved styles remain available as reusable choices.
- No browser confirm/alert dialogs are used.


## v0.4.4 — VERIFIED STABLE BASE

User tested the custom-style management refinement and confirmed that everything works.

Verified by user:
- Saved custom styles can be selected with **Use**.
- Saved custom styles can be opened with **Edit**.
- **＋ New custom style** starts a separate custom profile.
- Delete requires an intentional confirmation step.
- Cancel preserves the saved style.
- Confirm Delete removes the saved style.
- Existing Phase 4.1 concept/library workflow remains working.

This version is the current known-good Phase 4.1 base.

### Next phase
Phase 5 — Codex / Story Brain.

Do not add NanoGPT generation yet. First build the local story-brain data model and UI so canonical facts, characters, world information, relationships, timeline, open threads, and project rules have a reliable home before AI calls are connected.


## Phase 5 — v0.5.0 Story Brain + Tags

Built from the accepted `v0.4.4-STABLE` base.

Implemented:
- Per-story Story Brain stored locally.
- Story Brain overview.
- Categories: Characters, Locations, Timeline Events, Open Threads, Story Rules.
- Add/delete records using an in-app modal.
- Per-story tags.
- Add/remove tags from story detail.
- Tag filter in Library.
- Search also matches summaries and tags.
- Tags appear on Library cards.
- Basic Story Brain count visible on story detail.
- Separate Story Brain from manuscript data.

Purpose:
Story Brain is the structured knowledge layer future AI calls will retrieve selectively. It must not become a duplicate of the entire manuscript.

Not yet implemented:
- Automatic AI extraction.
- Relations graph.
- Mention tracking.
- Character state progression.
- Timeline chronology model.
- Semantic retrieval.
- NanoGPT integration.
- Folders/backup.


## v0.5.1 — Story Brain refinement

User feedback addressed:
- Library tag filtering now supports selecting multiple tags.
- **Match all** requires every selected tag.
- **Match any** requires at least one selected tag.
- Tag filters can be cleared.

Story Brain editors are now type-specific instead of one generic two-field popup:
- Characters: identity, role, age/status, appearance, personality, goals, relationships, knowledge/secrets.
- Locations: type, description, rules/conditions, significance.
- Factions: type, purpose/ideology, members, relations.
- Timeline events: when, what happened, consequences.
- Open threads: status, priority, unresolved issue, stakes.
- Story rules: rule, priority, scope, rationale.
- Custom entries: name, category, canonical information, importance.

Every record now has **Edit** and **Delete** controls.

Added a **Custom** Story Brain category so users can create structured information that does not fit the standard categories.

No AI calls yet.


## v0.5.2 — Story Brain stability fix

User reported severe freezing/lag when opening Story Brain.

Root cause addressed:
- Existing stories created before the Custom Brain category could contain Story Brain objects without `customEntries`. The new renderer accessed the category directly, which could throw during render.
- Repeated animated scroll calls could also accumulate while rapidly tapping navigation.

Fixes:
- Migrate/normalize every saved Story Brain object on startup.
- Guarantee all Story Brain arrays exist before rendering.
- Guard render so malformed legacy data safely recovers to Library instead of taking down the UI.
- Use immediate scroll reset for navigation to avoid scroll-animation queue buildup.
- Clear transient Brain editor state before opening a Brain view.

Rollback baseline remains `v0.4.4-STABLE`.


## v0.5.3 — Brain editor and selection refinement

User feedback addressed:
- Story Brain modal is now explicitly scrollable on mobile, with touch scrolling and a sticky save/cancel area.
- Every Brain record can be active/inactive for future AI context.
- Custom Brain supports any number of entries and multiple simultaneous active entries.
- Custom has Activate all / Deactivate all controls.
- All Brain record types now share an Advanced section:
  - Active in Story Brain
  - Instructions for Aurora
  - Prompt / insertion template
  - Custom placeholders
- Existing records are migrated with active=true and empty advanced fields.

The advanced fields are stored now; actual placeholder resolution/injection into NanoGPT is intentionally deferred until the AI orchestration phase.


## v0.5.4 — Brain reading, flexible information, and mobile scrolling

- Every Brain record opens in a read-only full-record view; Edit is a separate action.
- Every Brain type has an optional Additional information field.
- AI controls are collapsed and rewritten in plain language.
- Template and Variables are explicitly marked advanced and optional; normal users can ignore them.
- Background page scrolling is locked while the Brain modal is open, leaving one dedicated mobile scroll container.
- Existing records receive an empty additionalInfo field during migration.


## v0.5.5 — Critical Brain read-modal stability fix

The previous Read implementation appended a fixed modal directly to <body> on each render. Re-rendering after Close/Edit did not remove those overlays, so repeated use could leave stacked invisible intercepting layers and severe lag.

v0.5.5 fixes this by:
- Rendering Read mode inside the Story Brain `#app` tree.
- Removing legacy orphan `.brain-backdrop` elements before every render.
- Clearing Brain read/editor state explicitly during transitions.
- Guarding record clicks so action buttons do not accidentally open Read.

Rollback baseline: v0.4.4-STABLE.


## v0.5.6 — Brain mobile interaction correction

User reported:
- Brain editors still would not scroll reliably on Android.
- Edit/Delete taps were being interpreted as Read.

Fix:
- The Brain modal backdrop is now the native vertical scroll surface; `touch-action:none` was removed.
- The Brain editor itself no longer creates a competing nested scroll container.
- Read is an explicit **Tap to read** button, not the whole record card.
- Edit and Delete are handled before Read in event delegation.
- A record's Edit/Delete buttons can no longer open Read accidentally.

Rollback remains v0.4.4-STABLE.


## v0.5.10 — Brain stability + flexible fields

v0.5.9 had a packaging regression: Story Brain referenced new field-manager UI without the helper being present, causing the Recovery screen immediately when entering Brain.

v0.5.10 was rebuilt from the known-good v0.5.6 source.

Added:
- Fields & defaults tab.
- Reusable custom fields per Brain type.
- Custom field values in Add/Edit and Read.
- Explicit Brain record deletion confirmation.
- Larger horizontal Brain tab swipe area.

First acceptance test is simply entering Story Brain. Do not advance until that works.


## v0.5.11 — Requested Brain refinements

Fixed/refined from v0.5.10 after user testing:
- Brain record Delete now opens an intentional confirmation instead of silently attempting deletion.
- Brain record action buttons remain separate from the record-read target.
- Defaults tab is explicitly a custom-field/schema manager: users can add reusable fields such as Power, Weakness, Rank, Economy, etc. to each Brain type.
- Custom fields continue to coexist with Additional information.
- Field-manager deletion also requires intentional confirmation.
- Brain category swipe rail has a larger touch target and native horizontal scrolling behavior.
- Field-manager and confirmation surfaces use native vertical scrolling.

Acceptance tests for this checkpoint:
1. Brain opens without Recovery.
2. Tap Delete on a record -> confirmation appears; Cancel preserves it; Delete removes it.
3. Defaults -> Characters -> add Power -> Characters Add/Edit shows Power.
4. Defaults -> Locations -> add Economy -> Locations Add/Edit shows Economy.
5. Additional information remains available alongside custom fields.
6. Swipe the Brain category rail from anywhere across its width.


## v0.5.12 — Corrected Brain deletion
The previous v0.5.11 package did contain the new field-manager UI, but the Brain record Delete handler was still the old immediate-delete implementation. v0.5.12 replaces it with an explicit confirmation flow.


## v0.5.13 — Default Brain field packs

Added optional built-in field packs inside Story Brain → Fields & defaults. They are field templates, not automatic records, and can be installed individually or as a pack.

Packs: Worldbuilding; Power & Magic; Artifacts & Species; Fanfiction & Comic Tropes. Existing custom fields and Additional information remain available.


## v0.5.14 — Brain editor bottom-scroll fix

Confirmed root cause of the reported scroll bug: the global Android pull-to-refresh prevention handler was intercepting downward touch gestures even when the finger was inside the Story Brain editor overlay. This was most visible after reaching the very bottom of a long Add/Edit form; upward scrolling from the bottom could then appear unresponsive.

Fix: the global touchmove prevention now explicitly ignores Brain editor/read/field-manager overlays and other app scroll sheets, allowing their native vertical scrolling while continuing to block page-level pull-to-refresh.

Acceptance test: in a long Brain Add/Edit form, scroll all the way to the bottom, then repeatedly swipe downward (finger moves down) to scroll back upward. It must respond immediately without requiring several swipes. Also verify normal page pull-to-refresh remains blocked outside overlays.

## v0.5.14 — Known-good Phase 5 base

User tested the Brain editor scrolling fix and confirmed that everything now works correctly.

Known-good behavior:
- Brain entry editing scrolls normally even after reaching the very bottom of the form.
- Upward scrolling from the bottom no longer becomes unresponsive.
- Pull-to-refresh prevention remains outside Brain editing overlays.
- Brain delete confirmation works.
- Flexible custom fields and Fields & defaults work.
- Brain category swipe area is enlarged.
- Existing Additional information remains available.

This version is the current Phase 5 regression baseline. Do not replace it with an untested build.

## v0.5.20 — Phase 5.2 Character Records

Built from the known-good v0.5.14 baseline.

Added a structured character record grouped into:
- Identity
- Appearance & Voice
- Mind & Behavior
- Motivation & Story Role
- Relationships & Knowledge
- Abilities & Current State

Existing custom fields, Additional information, and Advanced AI controls remain available.
Character list summaries now show useful compact information.

Phase 5.2 only. World, Timeline, Threads/Rules, Canon Protection, and Story Brain Overview remain later subphases.

## v0.5.30 — Phase 5.3–5.5 Brain Records

Implemented the remaining structured entry forms in one pass, as requested:
- 5.3 World & Locations: location identity, hierarchy, tags, visual description, culture/daily life, population, rules, economy/resources, significance, access/travel, internal landmarks.
- Factions are also expanded with identity/status, ideology, leadership/structure, members, resources, relationships, methods/reputation.
- 5.4 Timeline & Events: when/where, event description, participants, cause/trigger, consequences, canon importance.
- 5.5 Open Threads: status/priority, unresolved business, clues/progress, related people, stakes/payoff, possible directions, last touched.
- 5.5 Story Rules: rule, priority/scope, reason, avoidance constraints, allowed exceptions, applicability.
- Custom entries retain their flexible structure and now include when-useful guidance.

Default field packs were expanded into dedicated tabs for Worldbuilding, Fanfiction & Comic Tropes, Comic & Visual Storytelling, Culture & Daily Life, Cosmology & Religion, Economy & Trade, Power & Magic Systems, Artifacts/Gear/Materials, and Species/Races/Lineages.

Roadmap remains mandatory: 5.6 Canon Protection and 5.7 Story Brain Overview are NOT skipped and remain next.

## v0.6.0 — Phase 5.6 Canon Protection

Added Brain-level canon metadata: Permanent Canon, Current State, Draft/Temporary, and Rejected/Alternative, plus a Protect as established fact toggle and optional canon note. Added the initial Story Brain overview data surface for 5.7.

This phase records and displays canon state; full AI context enforcement will be implemented in later AI orchestration.


## v0.7.0 Story Brain 2.0 redesign
- Reworked Story Brain around persistent entities rather than generic memory entries.
- Characters remain one record; evolving state is stored in currentStateData with stateHistory.
- Added structured Story & Arcs view: arcs contain phases, events and completion status.
- Added Secrets with separate knowledge scope and reveal lock.
- Added Ideas as a separate bucket from established story information.
- Story Position now points to an Arc and Phase.
- This is still UI/data architecture only; AI prompt filtering, automatic state extraction and output leak validation are not implemented yet.
- Acceptance focus: one character can change state repeatedly without duplicate records; arcs contain their own phases/events; completed arcs remain history; secrets remain hidden; existing Brain navigation/back/delete/read behavior does not regress.

## v0.8.9

- Fixed Story Brain character State modal backdrop handling: tapping any input/select/textarea inside the modal no longer triggers Cancel/navigation back. Only the Cancel button or tapping the actual backdrop closes it.
- v0.8.0 remains the functional base; no data model changes.


## v0.8.9
- Preserved the complete v0.8.1 Story Brain tabs and rich field sets.
- Added one unified State Timeline to non-character Brain entities without removing their original fields.
- Characters retain their specialized State Timeline.
- State history remains attached to the same entity; Current automatically demotes previous Current to Past.
- Added per-state reveal/knowledge metadata.

## v0.9.4 — Phase 6/7 Reader + Manuscript Editor checkpoint

- Added a separate local manuscript store (`aurora_manuscripts_v1`) so prose is independent from Story Brain.
- Added mobile-first Reader with per-story reader settings, TOC, chapter navigation, find, bookmarks, reading progress, fullscreen and editor handoff.
- Added rich Manuscript Editor with chapters/scenes, real contenteditable surface, formatting, headings, lists, alignment, links, images, find/replace, undo/redo, rename/delete controls and local autosave.
- Reader typography is isolated from global application typography.
- No AI generation is connected yet. This build is intended to validate manuscript persistence and reading/editing UX before AI integration.


## v0.9.11 — NanoGPT API foundation

- Added a real NanoGPT provider configuration surface in Settings.
- Added API access modes: OFF, ASK, and ON.
- Added local maximum-request ceiling and request counter.
- Added NanoGPT endpoint and API-key configuration.
- Added separate **Load Text Models** and **Load Image Models** catalogs using NanoGPT's documented endpoints.
- Text catalog uses `GET /api/v1/models?detailed=true`; image catalog uses `GET /api/v1/image-models?detailed=true`.
- Added selectable text and image models with model metadata retained locally.
- Added Test Connection against the text-model catalog endpoint.
- Added OpenAI-compatible text chat client foundation for `/api/v1/chat/completions`.
- Added OpenAI-compatible image-generation client foundation for `/v1/images/generations`.
- Added optional NanoGPT Context Memory support through the documented `memory: true` header.
- Added custom in-app confirmation for ASK mode; no browser `alert()`/`confirm()` is used.
- Story Brain is still the authoritative Aurora memory layer; NanoGPT provider memory is optional and does not replace it.

### v0.9.11 acceptance focus
1. Open Settings → API access.
2. Enter NanoGPT endpoint and API key.
3. Tap Test Connection.
4. Tap Load Text Models and choose a text model.
5. Tap Load Image Models and choose an image model.
6. Confirm the request counter increments and can be reset.
7. Confirm Back discards unsaved settings and Save & Close persists them.
8. Do not move to full story generation until this provider configuration is verified on-device.

## v0.9.10 Reader Find
Reader Find cycles existing mark elements for repeated Next; it never rescans already-marked text. This fixes the prior 0-match bug after the first result.


## v0.9.13 — NanoGPT API key binding fix
- Fixed NanoGPT Settings API key field: it now participates in the same `data-nano-field` draft binding as the other provider fields.
- Added an explicit DOM-to-draft synchronization before Test Connection, Load Text Models, and Load Image Models so a freshly pasted key is used immediately without requiring a re-render or Save & Close first.
- NanoGPT endpoint paths remain aligned with the documented `/api/v1/models?detailed=true` and `/api/v1/image-models?detailed=true` catalog endpoints.
- This is a bug-fix build only; no Story Brain or writing-pipeline changes.

## v0.9.13 NanoGPT Settings UX/API Fix
- Fixed NanoGPT settings status handling so a successful connection remains visibly Connected instead of being replaced by a stale/loading state.
- Test Connection now tests authenticated access without silently replacing the user's model selection or pretending that model catalogs were loaded.
- Text and image model loading are explicitly separate.
- Added manual Text Model ID and Manual Image Model ID fields with explicit Use Manual buttons.
- Manual model IDs are useful when NanoGPT exposes a callable model that the catalog does not display.
- Text catalog uses GET /api/v1/models?detailed=true; image catalog uses GET /api/v1/image-models?detailed=true.


## v0.9.15 — NanoGPT request/loading reliability fix
- Fixed NanoGPT Settings getting stuck indefinitely on “Testing…” / “Loading…”.
- Added a 15-second request timeout with explicit network/CORS failure messaging.
- GET catalog/connection requests no longer send an unnecessary JSON Content-Type header.
- Added separate busy states so Test Connection, Load Text Models, and Load Image Models show their actual state.
- Connection success now reports the number of text models visible when available.
- Text/image catalog failures now show the actual failure reason in the status card instead of leaving a permanent loading message.
- Manual model entry no longer silently treats a human-readable model name as an ID; if a loaded model name matches, Aurora resolves it to the canonical model ID.
- Model dropdowns remain usable once a catalog is actually loaded; empty catalogs explicitly say no models were returned.
- No NanoGPT key was added to the build.
