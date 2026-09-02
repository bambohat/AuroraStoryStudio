# Aurora — Current Project State
As of 2026-09-02

## Single source of truth for the current handoff

Current base: Aurora v0.9.25 — AI Writing + Brain Automation

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
