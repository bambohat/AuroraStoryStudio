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

## v0.9.26 candidate — AI Idea Enhancement
Date: 2026-09-02
Status: Candidate; pending user Android verification.

Added to the actual runtime `index.html` only:
- Create → Step 1 → `Your idea` now has `✨ Enhance my idea`.
- Uses the existing NanoGPT `nanoChatCompletion()` transport and existing ASK/access/request-limit checks; no provider/auth architecture was changed.
- Shows `YOUR IDEA` and `ENHANCED IDEA` in a mobile-friendly review modal.
- The original idea is not overwritten until the user taps `Use enhanced idea`.
- `Keep my original` closes without changing the draft.
- `Enhance again` runs another enhancement from the current idea.
- Enhanced output is constrained to the existing 2000-character `Your idea` field.
- Prompt instructs NanoGPT to preserve explicit intent, avoid inventing important facts, and return a concept brief rather than manuscript prose.

Validation performed:
- `node --check` passed against the extracted executable JavaScript from `index.html`.
- Source review confirmed the feature calls the already verified NanoGPT path rather than introducing another transport.
- Automated browser execution was attempted in the container, but the environment blocks local document/network navigation; therefore no claim of real NanoGPT success is made here.

Manual Android acceptance test:
1. Configure NanoGPT exactly as in the existing v0.9.25 build.
2. Open Create → Step 1 → Your idea.
3. Enter a deliberately rough idea with several constraints.
4. Tap `✨ Enhance my idea`.
5. Approve the existing NanoGPT request if ASK mode appears.
6. Confirm the modal shows the original and a substantially clearer enhanced idea.
7. Confirm the original text is unchanged until `Use enhanced idea` is tapped.
8. Tap `Use enhanced idea`; confirm the Step 1 box now contains the enhanced result and the 2000-character limit is respected.
9. Move to `Next: Format →` and confirm normal builder navigation still works.
10. Close/re-enter Create before building if desired and confirm no accidental story/project was created by the enhancement request.



## v0.9.31 candidate — Writing Assist Core controls + custom Core library
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

Implemented in `index.html`:
- Separated Writing Assist into two explicit layers: `System core` and `Writing instruction`.
- Added four protected built-in Cores, including the current standard/default core plus strict field, Brain continuity, and creative-development variants.
- Added per-field Core selection memory in localStorage.
- Added `Core instructions` mode to the existing Instruction Library.
- Added `＋ New core`, personal Core edit/update/delete, Copy from built-in, and protected built-in fallback behavior.
- Added a recommended Core-structure tips panel in the Core editor.
- Built-in Core `Edit core` creates a personal copy instead of attempting to overwrite the protected built-in.
- Writing Assist requests now send only the selected Core as `system`; the selected Writing instruction and source text are sent in the `user` message.
- Idea enhancement now uses the same Core/Writing split.
- ASK request preview now explains SYSTEM vs USER and shows both message contents plus the exact request body.
- Existing NanoGPT transport, authentication, request permission, request accounting, Brain compiler, manuscript, and storage architecture remain unchanged.

Validation:
- `node --check` PASSED against JavaScript extracted from the actual runtime `index.html`.
- Static assertions PASSED for Core persistence, field selection, protected built-ins, new/edit/copy/delete flows, Core/Writing request composition, and request-preview transparency.
- No alternate runtime file was edited.
- Real Android/NanoGPT verification: PENDING.

Manual Android acceptance:
1. Open any supported writing field and expand `⚙ Instructions`.
2. Confirm separate `System core` and `Writing instruction` selectors appear.
3. Select another built-in Core and verify its full text changes.
4. Tap `Edit core` on the built-in default; verify Aurora opens a personal copy rather than editing the built-in.
5. Open `📚 Library`, switch to `Core instructions`, tap `＋ New core`, and verify the editor is empty and the recommended Core tips are visible.
6. Save the new Core and verify it appears as `Personal` and becomes selected for the originating field.
7. Edit, use, copy, and delete a personal Core.
8. Run `✨ Enhance`; in the ASK dialog open `⌄ View exact request sent to NanoGPT — 100% payload`. Verify SYSTEM is the Core you selected and USER contains the Writing instruction plus source text.
9. Cancel the request and verify the source field remains unchanged.
10. Approve one request and verify the existing enhancement result/review flow still works.

## v0.9.30 candidate — Instruction Library modal lifecycle and navigation fix
Date: 2026-09-02
Status: Candidate; pending user Android verification.

Implemented in `index.html`:
- Fixed stale Writing Assist and Instruction Library overlays that could remain mounted on `<body>` after a render.
- `×` now reliably closes the shared Instruction Library after create/edit/save/delete flows.
- Added `‹ Back` inside the new/edit instruction screen so the user can return to the Instruction Library list without leaving the library.
- Kept the shared behavior global across all supported writing-assistance fields.
- Kept built-in protection, personal instruction persistence, and existing NanoGPT request flow unchanged.

Validation:
- `node --check` PASSED against extracted executable JavaScript from `index.html`.
- Static wiring checks PASSED for modal cleanup, library close, editor back navigation, and existing library CRUD/select actions.
- No provider/authentication/Brain compiler/manuscript architecture changes.
- Real Android verification: PENDING.

Manual Android acceptance:
1. Open `⚙ Instructions` from Create → Your idea.
2. Open `📚 Library`, tap `＋ New instruction`, and verify the empty editor opens.
3. Tap `‹ Back`; verify you return to the library list.
4. Open `＋ New instruction` again, create and save an instruction; verify the list is shown.
5. Tap `Edit`, then `‹ Back`; verify the list returns without closing the whole library.
6. Tap `Edit`, change the instruction, use `Update instruction`, and verify the list is shown.
7. Tap `×`; verify the Instruction Library disappears completely.
8. Reopen the library from another writing field and repeat the close test to confirm the fix is global.

## v0.9.29 candidate — Mobile request preview + instruction library refinement
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

Refined the v0.9.28 Writing Assist UX after Android testing.
- Fixed the NanoGPT ASK preview layout so the exact request body wraps inside the mobile dialog instead of extending beyond the viewport. The preview remains collapsible and vertically scrollable.
- Changed the visible inline instruction action set so the duplicate `Save as new` controls are removed; one control is now `＋ New instruction`.
- `＋ New instruction` opens an empty Instruction Library editor with a blank name and blank instruction body.
- Saving a new instruction adds it to the personal instruction library and applies it to the originating field when launched from that field.
- Instruction Library continues to expose Use / Edit / Delete for personal instructions and Copy for built-ins; built-ins remain protected.
- Exact request preview is explicitly labeled as the 100% payload and remains free of API keys/authentication headers.

Validation performed:
- `node --check` passed against the executable JavaScript extracted from `index.html`.
- Static source assertions passed for mobile request-preview wrapping, viewport containment, new-instruction creation flow, library persistence/application, and personal-instruction deletion.
- NanoGPT transport and authentication architecture were not modified.

Manual Android acceptance test:
1. Open the v0.9.29 candidate on Android.
2. Open Create → Your idea → `⚙ Instructions`.
3. Confirm `＋ New instruction` appears only once among the create/save actions.
4. Tap `＋ New instruction`; confirm the Instruction Library editor opens with an empty name and empty instruction body.
5. Enter a name and instruction, save it, and confirm it appears in the library and becomes selected for the originating field.
6. Open the same field's Instructions again and confirm the new instruction can be Edit / Use / Delete.
7. Start `✨ Enhance`, open `⌄ View exact request sent to NanoGPT — 100% payload`, and verify the full request stays within the screen with wrapping and internal scrolling.
8. Confirm the displayed payload matches what Aurora is about to send, excluding only the API key/authentication headers.
9. Confirm Cancel leaves the original field untouched and Allow request proceeds through the existing NanoGPT path.

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


## v0.9.33 candidate — Legacy Writing Assist restored as protected default + dedicated instruction page + experimental custom Cores
Date: 2026-09-02
Status: Candidate; pending user Android verification.

Added to the actual runtime `index.html` only:
- Generalized AI enhancement beyond the Create → Your idea field.
- Supported long-form writing fields now expose `✨ Enhance` plus collapsible `⚙ Instructions`.
- The instruction panel shows the exact instruction text used for the request.
- Added protected built-in defaults: `Preserve intent — Default`, `Deepen & clarify`, `Canon-safe Brain`, `Style & voice refiner`.
- Added local personal instruction storage with edit, save-as-new, update, delete, and per-field selection memory.
- Built-in instructions cannot be deleted; editing a built-in saves a personal copy.
- Enhancement remains review-first and writes back only after `Use enhanced text`.
- The existing NanoGPT transport, ASK permission flow, and request counter are reused unchanged.
- Supported contexts include the Create idea, custom style description/sample/direction, Brain long-text fields, custom Brain fields, and state detail fields.

Validation performed:
- `node --check` passed against the extracted executable JavaScript from `index.html`.
- Static source review confirmed the enhancement path still uses `nanoChatCompletion()` and does not introduce a second provider or authentication architecture.
- Static source review confirmed the exact instruction sent is visible in the enhancement review modal.
- Static source review confirmed original text is preserved until explicit apply.
- Static source review confirmed built-in instructions are protected and personal instructions persist through localStorage.
- Real Android/NanoGPT verification is still pending and is not claimed here.

Manual Android acceptance test:
1. Open the candidate build and configure NanoGPT exactly as in v0.9.25.
2. Create → Step 1 → `Your idea`. Enter rough notes.
3. Confirm `✨ Enhance` and `⚙ Instructions` are visible together.
4. Expand `⚙ Instructions`; confirm the default instruction is readable.
5. Switch to `Deepen & clarify`; confirm the displayed instruction changes.
6. Tap `Edit`; change the instruction text and the instruction name, then `Save as new`. Confirm the new instruction appears in the selector.
7. Select the new instruction, collapse the panel, and tap `✨ Enhance`. Approve the normal ASK request if enabled.
8. Confirm the review modal shows `YOUR TEXT`, `ENHANCED TEXT`, and `INSTRUCTION SENT` containing the exact instruction used.
9. Confirm `Use enhanced text` is required before the field changes.
10. Open a Brain Character long-text field and repeat the same two-button workflow. Confirm the appropriate `Canon-safe Brain` default appears initially.
11. Confirm a saved personal instruction can be updated and deleted, while built-in instructions cannot be deleted.
12. Confirm moving between Create and Brain does not corrupt the existing project or Brain data.

## v0.9.28 candidate — Unified AI request preview + Writing Assist refinement
Date: 2026-09-02
Status: Candidate; pending user Android verification.

Implemented in `index.html`:
- Replaced weak writing-assist defaults with stronger professional, style-aware built-ins.
- Restored the earlier high-quality concept-enhancement behavior as the `Professional enhancer — Default` base, while preserving the generalized field-assist architecture.
- Added `Instruction Library` modal with `＋ New custom instruction` creation.
- Added library edit/update, copy-from-built-in, select-for-current-field, and delete actions.
- Kept built-in instructions protected.
- Added fallback loading of prior v0.9.27 instruction-selection preferences.
- Unified the ASK permission dialog with an expandable exact request-body preview.
- Preview occurs before the user approves the remote request and excludes API keys/authentication headers.
- Preview mechanism is shared by text and image provider requests.

Validation:
- `node --check` PASSED against the extracted JavaScript from `index.html`.
- Static wiring review PASSED for Instruction Library actions, preview capture, and NanoGPT transport reuse.
- Real Android/NanoGPT request verification: PENDING.

Acceptance test:
1. Open any supported long text field and open `⚙ Instructions`.
2. Confirm `📚 Library` exists.
3. Open Library and create a new custom instruction without browser prompts.
4. Reopen a field, select the custom instruction, and verify it becomes the selected instruction for that field.
5. Tap `✨ Enhance`.
6. In the NanoGPT ASK popup, expand `View exact request sent to NanoGPT`.
7. Confirm the request body contains the exact instruction and source text and does not expose the API key.
8. Cancel the request and verify no text changed.
9. Approve the request and verify the existing enhancement flow still returns a reviewable result.
10. Test the `Professional enhancer — Default` on a deliberately rough idea and compare its depth to the earlier v0.9.26 behavior.


## v0.9.33 candidate — Restore legacy Writing Assist SYSTEM core + dedicated Instruction Library page

### Objective
Restore the exact pre-Core-control Writing Assist SYSTEM instruction as the protected default while retaining experimental custom Core support, and move the Writing/Core instruction library into a normal in-app page.

### Changes
- Restored the original Writing Assist SYSTEM composition used before v0.9.31 as the protected `Aurora standard core — Default` compatibility Core. The legacy SYSTEM text is composed from the exact prior wrapper, selected Writing instruction, the style-sample exception, Brain guidance, and the final output rule.
- Custom Cores continue to act as the SYSTEM message, while the selected Writing instruction and source remain in the USER message.
- The default Core now displays the exact legacy SYSTEM text that will actually be sent for the selected Writing instruction; no placeholder text is shown as the active request instruction.
- Idea enhancement uses the same legacy default SYSTEM composition when the default Core is selected.
- Added a dedicated `Writing Instructions` route/page inside Aurora. The page contains separate `Writing instructions` and `Core instructions` views, new/edit/save/copy/use/delete flows, and the existing recommended Core-structure tips.
- Opening `📚 Library` from a writing field now navigates to the dedicated page while retaining the originating field so `Use` can return to that field.
- Existing modal library remains available only for legacy/non-page invocation paths and is not mounted over the dedicated page.
- NanoGPT provider transport, request permission flow, Brain compiler, and manuscript logic were not changed.

### Validation
- Actual executable remains `index.html`.
- Extracted runtime JavaScript passes `node --check`.
- Static assertions pass for legacy SYSTEM composition, default Core wiring, Idea enhancer wiring, dedicated route/page, field-to-library navigation, and exact Core preview.
- Live Android/NanoGPT execution remains pending user verification.


### v0.9.34 candidate — Exact legacy SYSTEM restored + Instructions bottom navigation
Date: 2026-09-02
Status: Candidate; pending user Android verification.

Changes:
- Restored `Aurora standard core — Default` to the exact pre-Core-control Writing Assist SYSTEM composition used in v0.9.27, including the full selected Professional Enhancer instruction and the legacy field/Brain safeguards.
- The legacy default is not reconstructed from the newer Core wording; it uses the prior proven Writing Assist composition as the compatibility baseline.
- Added `Instructions` as a fifth first-class item in Aurora's fixed bottom navigation. It opens the existing dedicated `Writing Instructions` page directly instead of requiring More → Settings.
- The dedicated page remains the same Writing instructions / Core instructions library with create, use, copy, edit, update, and delete flows.
- No NanoGPT transport, authentication, Brain compiler, manuscript, or provider architecture was changed.

Validation:
- Actual executable remains `index.html`.
- Extracted executable JavaScript passes `node --check`.
- Static checks confirm the legacy default system composition matches the v0.9.27 Writing Assist composition.
- Static checks confirm the `Instructions` route is present in the bottom navigation and the dedicated page uses it as its active route.
- ZIP integrity verified.
- Live Android/NanoGPT execution remains pending.


## v0.9.35 candidate — Full instruction reader
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

Objective:
Let the user read the full Writing instruction or Core instruction text directly from the dedicated Instructions page before deciding to use, edit, copy, or delete it.

Changes:
- Added `Read` to every instruction card in both `Writing instructions` and `Core instructions`.
- Added a mobile-safe full-text reader overlay showing the complete stored instruction with wrapping and internal scrolling.
- Personal entries can move from `Read` to `Edit`; built-ins can move from `Read` to `Copy to personal`.
- Existing `Use`, `Edit`, `Copy`, and `Delete` behaviors remain intact.
- No provider transport, authentication, Brain compiler, manuscript, or data model changes.

Validation:
- Runtime `index.html` extracted JavaScript passes `node --check`.
- Static source assertions confirm Read buttons, reader rendering, close action, and personal/built-in follow-up actions.
- ZIP integrity verified.
- Real Android/NanoGPT execution remains pending.


## v0.9.36 candidate — Full legacy Core visible in Library
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

Problem fixed:
- The built-in `Aurora standard core — Default` appeared as the placeholder `LEGACY_OLD_SYSTEM_INSTRUCTION` inside the dedicated Core Instructions Library, even though the writing-field preview correctly rendered the legacy SYSTEM instruction.

Changes:
- Core Library `Read` now renders the complete legacy Aurora SYSTEM instruction for the built-in default instead of exposing its internal compatibility placeholder.
- `Copy` on the built-in legacy Core now creates a personal Core containing the rendered legacy SYSTEM instruction, so the copied Core is editable and functional rather than containing the placeholder.
- The Library reader explains that the displayed legacy default uses `Professional enhancer — Default`; when used from an actual field, the legacy Core is rendered with that field's selected Writing instruction.
- No NanoGPT transport, authentication, Brain compiler, manuscript, or provider architecture changed.

Validation:
- Actual executable remains `index.html`.
- Extracted runtime JavaScript passes `node --check`.
- Static checks confirm the legacy default no longer exposes `LEGACY_OLD_SYSTEM_INSTRUCTION` through the Library read/copy path.
- ZIP integrity verified.
- Live Android/NanoGPT execution remains pending.


## v0.9.36 candidate — Full legacy Core visible in Library
Date: 2026-09-03
Status: Candidate; pending manual Android verification.

Fix:
- The built-in `Aurora standard core — Default` previously stored the compatibility marker `LEGACY_OLD_SYSTEM_INSTRUCTION`, so its Library `Read` view showed only that marker even though the actual writing-field request rendered the full legacy system instruction.

Changes:
- Library `Read` for the built-in legacy Core now renders the complete legacy Aurora Writing Assist SYSTEM instruction using `Professional enhancer — Default`, matching the default field behavior.
- `Copy` of the built-in legacy Core now creates a personal Core containing the full rendered legacy SYSTEM instruction instead of the internal marker.
- The explanatory note makes the context dependency explicit: field usage combines the legacy Core with the Writing instruction selected for that field.
- No NanoGPT transport, authentication, Brain compiler, manuscript, or story logic was changed.

Validation:
- Actual runtime remains `index.html`.
- Runtime JavaScript passes `node --check`.
- Static checks confirm Library Read/Copy never expose `LEGACY_OLD_SYSTEM_INSTRUCTION` for the built-in standard Core.
- ZIP integrity verified.
- Live Android/NanoGPT execution remains pending.
