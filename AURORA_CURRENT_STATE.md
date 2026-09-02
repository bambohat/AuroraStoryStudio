# Aurora — Current Project State
As of 2026-09-02

## Single source of truth for the current handoff

Current base: Aurora v0.9.25 — AI Writing + Brain Automation

Current candidate: v0.9.37 candidate — PWA/GitHub Pages packaging + icons + offline shell (pending manual Android verification)

Use this build as the starting point for future work. Do not silently substitute an older 0.9.x build.

### Runtime
The current executable runtime is `index.html`.
The integrated prototype is substantially self-contained.
`app.js` and `runtime.js` are included in the package as repository/reference artifacts.
Before editing any file, verify which file contains the actual executing implementation.

### Verified working
- Library/navigation shell
- Story Brain UI
- Character state timeline
- World/location records
- Timeline/events
- Story rules/open threads
- Arcs/phases/current position
- Canon/knowledge views
- Reader
- Reader fullscreen scrolling
- Reader Find cycling
- Manuscript editor
- NanoGPT connection/model catalogue
- NanoGPT real generation request
- ASK permission flow
- AI chapter candidate generation
- Basic Brain Assistant
- Basic safe automation modes

### v0.9.28 candidate change — Unified AI request preview + Writing Assist refinement
The existing AI idea enhancement was generalized into a reusable writing-assistance layer. Long-form writing fields now receive two compact controls: `✨ Enhance` and collapsible `⚙ Instructions`.

`⚙ Instructions` exposes the exact instruction text used for that field. The user can switch among built-in defaults, edit the visible instruction, save it as a new personal instruction, update a saved personal instruction, or delete a saved personal instruction. Built-in defaults remain protected.

Built-in instructions currently include `Preserve intent — Default`, `Deepen & clarify`, `Canon-safe Brain`, and `Style & voice refiner`. The recommended default is selected automatically by field type and the user’s choice is remembered locally per field context.

`✨ Enhance` works on Create → Your idea, custom style fields, Brain long-text fields, custom Brain fields, and state detail fields. It uses the existing NanoGPT transport, permission flow, and local request accounting. The source text is shown alongside the enhanced result, and nothing is written back until `Use enhanced text` is chosen.

This feature has been syntax-checked and its UI/apply/navigation path has been statically reviewed, but the real NanoGPT request still requires manual Android verification with the user’s configured provider.




### v0.9.31 candidate change — Writing Assist Core controls and custom Core library
The Writing Assist layer now separates the two instruction layers that reach NanoGPT. The selected `System core` becomes the full system message, while the selected `Writing instruction` remains in the user message alongside the field label and source text.

Four protected built-in Cores are available: `Aurora standard core — Default`, `Strict field editor`, `Brain continuity guardian`, and `Creative development core`. The default remains protected and can be copied into a personal Core.

Each supported Writing Assist field now exposes separate `System core` and `Writing instruction` selectors. `Edit core` can modify a personal Core or create a personal copy when the selected Core is built-in. The Instruction Library now has `Writing instructions` and `Core instructions` modes. Personal Cores support create, edit, update, use, copy-from-built-in, and delete. Core creation includes a recommended-structure tips panel.

The NanoGPT ASK preview now explicitly explains that SYSTEM is the selected Aurora Core and USER contains the selected Writing instruction plus source text, while retaining the exact request body.

No NanoGPT transport, authentication, Brain compiler, manuscript, or provider architecture was changed.

Validation performed:
- Extracted executable JavaScript from `index.html` and passed `node --check`.
- Static checks confirmed the selected Core is used as the system message for Writing Assist and Idea Enhance, while the Writing instruction is passed in the user message.
- Static checks confirmed personal Core persistence, per-field selection, protected built-in behavior, copy/new/edit/delete flows, and Core-library mode switching.
- Static checks confirmed the request preview renders the system and user message content as well as the exact JSON request body.
- Real Android/NanoGPT verification remains pending.

### v0.9.30 candidate change — Instruction Library modal lifecycle and navigation fix
The v0.9.29 Writing Assist/Instruction Library had a modal lifecycle defect because the library and writing-assist overlays are mounted directly on `<body>` while the normal application render replaces only `#app`. Re-rendering could therefore leave stale library overlays in the DOM. Closing the library changed state but could leave the visible stale overlay in place.

The runtime now removes stale Writing Assist and Instruction Library overlays before each render. This makes the `×` close action reliable after creating, editing, saving, or deleting an instruction.

The Instruction Library editor now also provides an explicit `‹ Back` control while creating or editing an instruction, returning to the library list without closing the entire library. The editor remains a separate mobile-safe view inside the same modal. The library close action closes the whole library.

This is a global fix for every supported field that opens the shared Instruction Library, not a field-specific workaround. No NanoGPT provider, request transport, Brain compiler, manuscript, or stored instruction format was changed.

Validation performed:
- Extracted executable JavaScript from `index.html` and passed `node --check`.
- Static checks confirmed stale Writing Assist/Instruction Library body overlays are removed during every render.
- Static checks confirmed `×` closes the library and `‹ Back` returns from the editor to the library list.
- Static checks confirmed the new/edit/save/delete/select handlers remain intact.

Manual Android acceptance remains required.

### v0.9.29 candidate change — Mobile request preview + instruction library refinement
The v0.9.28 Writing Assist layer was refined after Android UI testing feedback. The ASK permission popup now keeps the exact request preview inside a mobile-safe container: long JSON lines wrap instead of overflowing horizontally, the preview has bounded vertical scrolling, and the preview explicitly identifies itself as the 100% request payload being prepared.

The field-level instruction controls no longer present two confusingly similar "Save as new" actions. The secondary creation action is now `＋ New instruction`, which opens a genuinely empty Instruction Library editor. Saving a new instruction adds it to the personal instruction library and, when launched from a field, applies it to that field automatically. Personal instructions keep Edit / Use / Delete actions; built-in instructions remain protected and can be copied into personal instructions.

The Instruction Library editor now uses explicit naming for a new instruction and retains the selected field context when appropriate.

No NanoGPT provider, authentication, request transport, Brain compiler, or manuscript architecture was changed.

Validation performed:
- Extracted executable JavaScript from `index.html` and passed `node --check`.
- Static source checks confirmed the mobile preview CSS wraps long request-body content and keeps it within the modal viewport.
- Static source checks confirmed the inline `＋ New instruction` action opens an empty Instruction Library editor and new saves can be applied to the originating field.
- Static source checks confirmed personal instruction deletion remains available while built-ins remain protected.

Manual Android acceptance remains required before this candidate can be called verified.

### Verified AI behavior
A Brain-dependent test was run with a minimal three-sentence Chapter 1 and extensive Brain records. Generated Chapter 2 used multiple facts that could not have been obtained from Chapter 1 alone. This is strong evidence that Brain context was actually injected and used.

### Important weakness discovered
Hidden/future information protection is not yet strict enough for a mature production system. A hidden secret can influence the plot as a suspicion before its intended reveal. This needs stronger character-specific knowledge filtering and reveal-aware retrieval.

### Product direction
The normal user should be lazy:
- write/describe intent;
- Aurora builds context;
- AI writes candidate;
- user accepts;
- Aurora maintains Brain with minimal manual work.

### What not to do
- Do not ask the user to manually construct large prompts.
- Do not duplicate a character for every state change.
- Do not automatically promote every AI invention to canon.
- Do not let future/hidden information leak into character knowledge.
- Do not add advanced controls to the main UI unless they are necessary.
- Do not make large changes without updating the Ledger.
- Do not claim a fix without manual Android verification.

## Roadmap context

The long-term roadmap is still:
Writing → Memory → Branches → Taste → Authors → Anti-AI → full NanoGPT orchestration → Comics → Hardening.

The current v0.9.25 build is an end-to-end prototype that overlaps multiple roadmap phases specifically so AI can be tested early without pretending later phases are complete.

## v0.9.28 candidate — Unified AI request preview + stronger Writing Assist instructions
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

Refined the v0.9.27 Writing Assist layer without changing the NanoGPT provider architecture.
- Restored a strong professional enhancement default modeled on the earlier v0.9.26 concept-enhancement instruction, while keeping style-of-writing guidance explicit.
- Reworked built-in defaults so each instruction includes concrete writing behavior, not only preservation/safety rules.
- Added an Instruction Library modal reachable from field Instructions controls.
- Added direct creation of new custom instructions inside the Instruction Library.
- Personal instructions can be edited, updated, copied from built-ins, selected for the originating field, and deleted. Built-ins remain protected.
- Existing v0.9.27 instruction-selection preferences are migrated/fallback-loaded where possible.
- Unified the NanoGPT ASK permission popup with a collapsible `View exact request sent to NanoGPT` section.
- The preview shows the exact non-secret request body, including model, messages, stream setting, temperature/max_tokens when present. API keys/authentication headers are never displayed.
- Text and image NanoGPT requests use the same preview mechanism.
- The enhancement review still shows source, result, and selected instruction; no field is modified until explicit acceptance.

Validation performed:
- Extracted executable JavaScript from `index.html` and passed `node --check`.
- Static source checks confirmed the new preview is populated before permission is requested and that existing NanoGPT transport calls remain the execution path.
- Static source checks confirmed Instruction Library creation/edit/delete/select handlers are wired to local persistence.

Manual Android acceptance remains required before this candidate can be called verified.


## v0.9.33 candidate state

The v0.9.33 candidate restores the exact pre-v0.9.31 Writing Assist SYSTEM composition as the protected default compatibility Core. Experimental custom Cores remain supported as separate SYSTEM instructions. The Writing/Core library is also available as a dedicated in-app `Writing Instructions` page rather than only a modal. Runtime syntax and static wiring checks passed; Android live verification remains pending.

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


### v0.9.35 candidate — Full instruction reader
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

The dedicated Writing Instructions page now gives every Writing instruction and Core instruction a `Read` action. Read opens a mobile-safe full-text reader so the complete instruction can be inspected without editing it. Personal entries can move from Read to Edit; built-ins can move from Read to Copy to personal. Existing Use/Edit/Copy/Delete flows remain unchanged.

No NanoGPT transport, authentication, Brain compiler, manuscript, or provider architecture was changed.

Validation performed:
- Extracted executable JavaScript from `index.html` and passed `node --check`.
- Static checks confirmed Read actions exist for both Writing instructions and Core instructions.
- Static checks confirmed the reader renders full instruction text, supports close, and routes personal entries to Edit or built-ins to Copy.
- ZIP integrity verified.
- Live Android/NanoGPT execution remains pending.


### v0.9.36 candidate — Full legacy Core visible in Library
Date: 2026-09-02
Status: Candidate; pending manual Android verification.

The built-in `Aurora standard core — Default` now renders its complete legacy Writing Assist SYSTEM instruction in the dedicated Instructions Library instead of the internal placeholder `LEGACY_OLD_SYSTEM_INSTRUCTION`. Copying that built-in Core also produces a complete editable personal Core. The runtime keeps the legacy compatibility renderer for actual field-specific requests.

No provider transport, authentication, Brain compiler, manuscript, or story data model changes.


### v0.9.36 candidate — Full legacy Core visible in Library
Date: 2026-09-03
Status: Candidate; pending manual Android verification.

The dedicated Instructions Library now renders the complete legacy SYSTEM instruction for `Aurora standard core — Default`; the internal `LEGACY_OLD_SYSTEM_INSTRUCTION` compatibility marker is no longer shown there. Copying the built-in legacy Core produces a complete editable personal Core. Actual field requests retain the exact legacy composition and contextual Writing instruction.


### v0.9.37 candidate — PWA / GitHub Pages deployment baseline
Date: 2026-09-03
Status: Candidate; pending manual Android installation/offline verification.

Changes:
- Added `manifest.webmanifest` with relative `start_url` and `scope`, standalone display, theme/background colors, and PWA metadata.
- Added 192px, 512px, 512px maskable, 180px Apple touch, and 32px/favicon PNG assets under project root.
- Added `sw.js` for an additive offline shell: network-first document navigation, cache-first static shell assets, automatic old-cache cleanup, and no interception of cross-origin API calls.
- Added manifest/icon/apple/mobile-web-app metadata to the actual executable `index.html`.
- Added service-worker registration only for HTTPS/localhost/loopback, preserving `content://` and `file://` attachment testing.
- Added `AURORA_PWA_GITHUB_PAGES.md` documenting deployment and exact Android acceptance testing.

No Brain, manuscript, Writing Assist, Instructions Library, or NanoGPT provider semantics were intentionally changed.

Validation:
- Runtime JavaScript syntax check: PASS (`node --check`).
- Manifest JSON validation: PASS.
- Service worker syntax check: PASS (`node --check`).
- Icon dimensions: PASS.
- PWA install/offline test: requires manual Android verification over HTTPS.
