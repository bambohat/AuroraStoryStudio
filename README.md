> GitHub Pages packaging: all runtime, manifest, service-worker, documentation, and icon files are placed in this package root; no icon subfolder is required.

# Aurora Story Studio

Aurora is a private-first, mobile-first AI novel/comic studio.

## Current canonical base
**v0.9.25 — AI Writing + Brain Automation**

### Current candidate
**v0.9.37 candidate — PWA/GitHub Pages packaging + icons + offline shell** (pending manual Android verification)

Executable runtime:
`index.html`

Repository/reference artifacts:
`app.js`
`runtime.js`

## What v0.9.25 has proven
- NanoGPT model catalogue connection works.
- Real NanoGPT generation request works.
- ASK permission flow works.
- Story Brain context is compiled into AI writing requests.
- Brain-dependent generation has been manually tested.
- Brain Assistant and conservative automation are implemented.

## v0.9.27 candidate change
The v0.9.26 AI idea enhancement is generalized across long-form writing fields. Each supported field gets two compact controls: `✨ Enhance` and collapsible `⚙ Instructions`.

The instruction panel shows the exact instruction sent to NanoGPT. Users can choose built-in defaults, edit an instruction, save a new personal instruction, update or delete personal instructions, and switch the active instruction per field context. Enhancement remains review-first: the original stays untouched until the user accepts the enhanced text.


## v0.9.31 candidate change
Writing Assist now separates the protected Aurora `System core` from the user-controlled `Writing instruction`. Users can select the Core per field, inspect it before requests, create personal Cores, copy built-ins, edit/update/delete personal Cores, and use the recommended Core-structure tips provided in the Core editor. The ASK preview identifies SYSTEM vs USER and retains the exact request body.

## v0.9.37 candidate
The current integrated prototype is now packaged for installation as a PWA on HTTPS hosts such as GitHub Pages. Added `manifest.webmanifest`, `sw.js`, and application icons in project root. The manifest and service worker use relative paths so repository/project Pages deployments work without hard-coded domain roots. The service worker caches the small application shell and icons, uses network-first navigation for fresh deployments, and does not intercept cross-origin NanoGPT requests. The runtime skips service-worker registration for `content://` / `file://` attachment previews and registers on HTTPS/localhost/loopback.

The existing Writing Assist, Instructions navigation, full instruction reader, legacy default Core, Brain compiler, manuscript, and NanoGPT transport remain unchanged.

## Important unresolved AI work
- Stronger hidden/future knowledge gating.
- Character-specific knowledge filtering.
- Full long-context retrieval.
- Provenance and approval for AI-derived facts.
- Full Taste/Author/Anti-AI systems.
- Full Phase 14 budget/orchestration.
- Comic generation.
- Final hardening/PWA/offline/import/export.

## How to continue
Read these first:
1. `Aurora_Master_Blueprint.md`
2. `Aurora_Build_Ledger.md`
3. `AURORA_CURRENT_STATE.md`
4. `AURORA_PROJECT_HISTORY_AND_CONTINUITY.md`
5. `Aurora_Development_Operating_Procedure.md`
6. `Aurora_New_Chat_Continuation_Protocol.md`
7. `AURORA_CHATGPT_CONTINUATION_PROMPT.md`

The package also contains the earlier tutorials and provider-fix records.

## User workflow philosophy
The user should express intent. Aurora should manage the machinery.

Do not make the user maintain prompts, context, lorebook activation, or Brain bookkeeping unless necessary.


## v0.9.34 candidate

Restores the legacy Writing Assist SYSTEM instruction as the protected default compatibility Core and adds a dedicated in-app Writing Instructions page. Custom Cores remain available for experimentation.


## v0.9.35 candidate
The dedicated Instructions page now exposes `Read` on every Writing instruction and Core instruction. Read opens the complete stored instruction in a mobile-safe reader without entering edit mode.


## v0.9.36 candidate
The legacy default Core is fully readable from the dedicated Instructions Library. Its internal compatibility placeholder is no longer exposed in Library Read or Copy flows.
