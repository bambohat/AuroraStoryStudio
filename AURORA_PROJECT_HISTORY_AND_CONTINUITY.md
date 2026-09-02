# Aurora — Project History and Cross-Chat Continuity Record
Version: 1.0
Date: 2026-09-02

## Purpose

This document exists so a new ChatGPT/model can continue Aurora without relying on the previous conversation's context.

It is intentionally redundant. When beginning a new Aurora session, read:
1. `Aurora_Master_Blueprint.md`
2. `Aurora_Build_Ledger.md`
3. `AURORA_CURRENT_STATE.md`
4. `Aurora_New_Chat_Continuation_Protocol.md`
5. `AURORA_CHATGPT_CONTINUATION_PROMPT.md`

Then inspect the actual current `index.html` before changing code.

## Project origin

Aurora began as an attempt to build a private story archive/studio that felt much easier than manually managing SillyTavern-style lorebooks, presets and prompt infrastructure.

The user's main goal became a beautiful, calm, extremely easy mobile-first story studio in which advanced AI systems are powerful underneath but mostly invisible during ordinary use.

The user repeatedly emphasized that the interface should not be cluttered and that a person should not need to understand prompts, token management, context windows or lorebook engineering.

## Core product vision

The intended workflow is:
Idea → Concept → Characters/World → Outline → Chapter → Scene → Write → Revise → Read.

Aurora should eventually:
- turn vague ideas into structured stories;
- build characters/world/outline;
- maintain a large persistent Story Brain;
- write chapters with AI;
- maintain continuity across long works;
- support author/style imitation based on observable style characteristics;
- learn personal taste;
- reduce disliked AI prose patterns;
- support branches/checkpoints;
- support novels and comics using the same story knowledge;
- automate boring Brain maintenance.

## Strong user preferences

The user wants:
- minimal visible UI complexity;
- advanced systems hidden under Advanced;
- smooth Android-first interaction;
- large touch targets;
- a robust reader and editor;
- author/style selection as an easy one-click capability;
- personal taste to modify author style;
- concrete and purposeful prose;
- minimal purple prose and generic AI atmosphere;
- continuity and logical progression;
- mature characters/protagonists rather than childish/teenage archetypes in many stories;
- avoidance of repetitive cultivation/manhua clichés;
- current story state to control what is possible now;
- hidden/future information available to the AI when useful for planning but prevented from leaking to characters prematurely;
- one character entity with a state history, not duplicated character records;
- arcs/phases with progressive knowledge and completed-state handling;
- multi-tag search;
- automatic/low-effort Brain maintenance.

## Major Story Brain design decisions

### State timelines
A character/entity can have unlimited states.
The current state is a single position in a timeline, while old states remain as history.
When a new state becomes current, the previous current state becomes past rather than being deleted.

### Knowledge boundaries
Story memory is separate from character knowledge.
A secret can be known by the AI/author but not by the protagonist.
Reveal conditions control when that information becomes available to characters.

### Canon
Canon is not just one permanent/temporary switch.
The system distinguishes established truth, current state, history, future planning knowledge, hidden information, ideas, rejected alternatives, and AI-generated candidates.

### Arcs/phases
An arc is a container for phases and events.
Current story position selects the active arc/phase/chapter.
Completed arcs retain consequences.
Future phases should not automatically enter current context.

### Custom fields
Every Brain entry should support additional user-defined fields beyond standard fields.
The user also wants the ability to extend default categories/types rather than being restricted to fixed Character/World/etc. schemas.

## UI/reliability history

The project had repeated mobile bugs during Brain and Reader work:
- forms/modals that would not scroll back up;
- slow/unresponsive Brain scrolling;
- delete controls that selected containers instead of deleting;
- entry read mode becoming stuck;
- Brain entries opening unexpectedly in reader instead of exposing edit/delete;
- broken state-entry forms where tapping a field returned to the previous page;
- horizontal Brain tab swipe area too small;
- arc current-position phase selection not correctly linked;
- canon screens with headings partially outside their boxes;
- blank recovery screens caused by malformed Brain records;
- reader fullscreen scroll failing only after reaching the bottom;
- Reader Find locating a result but then reporting 0/no matches;
- Find controls moving away from the current result;
- repeated NanoGPT connection/model-loading UI hangs.

The user was repeatedly testing on Android Chrome, so the project treats Android behavior as the primary acceptance environment.

The project eventually reached a working Reader/Brain baseline before AI integration.

## NanoGPT history

NanoGPT became the first AI provider.

Several builds failed because the code repeatedly mixed connection checking, catalogue loading, authentication, CORS/relay experiments and UI rendering.

Important lessons:
- inspect the actual executing file before editing;
- keep provider logic isolated;
- text and image catalogues are separate;
- model catalogue success and generation success are different tests;
- do not let UI state be overwritten after successful API responses;
- ASK permission must be resolved and removed cleanly;
- never claim a network test was run when it was not actually run from the user's environment.

The user eventually successfully connected NanoGPT and loaded about 632 models.

A real generation request also succeeded.

## AI writing integration

v0.9.25 added:
- real chapter generation through NanoGPT;
- context compilation from Story Brain + current position + manuscript;
- candidate output instead of automatic manuscript mutation;
- Brain Assistant;
- optional Brain automation.

Current writing compiler explicitly tells the model to:
- treat current state as present truth;
- treat past as historical;
- treat future as AI-only planning knowledge;
- treat hidden/restricted knowledge as AI-level planning knowledge, not character knowledge;
- respect story rules and current position;
- avoid silent retcons;
- keep generated prose separate from permanent story truth.

## Brain dependency test

A deliberately minimal Chapter 1 was created so the chapter itself could not explain the next chapter.

Brain-only facts included:
- Mara Veyne
- Blackglass City
- Dorian Hale
- former relationship
- Silent Court
- death-registry alterations
- abandoned clocktower
- silver key
- red-glove clue
- three entrances/eastern entrance sealed
- magical-inscription limitation
- silver ring
- hidden truth that Mara's brother is actually alive while Mara believes he died

Generated Chapter 2 used several Brain-only facts in a coherent way.

Result:
- Brain context injection is working.
- Retrieval materially influences prose.
- Future/hidden leakage is not yet perfect enough for production.

This test is the first strong end-to-end proof that the architecture is doing what Aurora was designed to do.

## Current next direction

Do not jump immediately to cosmetics or unrelated features.

The next engineering target is to strengthen the context compiler and knowledge filters so that:
- only relevant Brain facts are retrieved;
- current state is authoritative;
- historical state is not treated as current;
- future state is not treated as present;
- hidden information is not exposed to characters;
- character-specific knowledge is respected;
- arc/phase position controls progressive disclosure;
- AI inventions receive provenance/status instead of becoming instant canon.

Then build the long-context retrieval layer, followed by stronger automatic Brain reconciliation.

## Current non-goals

These are not yet considered complete merely because related UI exists:
- full long-context retrieval;
- full personal Taste Engine;
- full Author Library;
- full Anti-AI prose engine;
- full branching/checkpoint system;
- full comic generation;
- full budget/cost orchestration;
- final PWA/offline hardening.

## Cross-chat rule

A new model must NOT reconstruct Aurora from memory.

It must read this package first and report:
CURRENT BASE
LAST VERIFIED AI TEST
WORKING
BROKEN/UNRESOLVED
NEXT TASK
ACTUAL RUNTIME FILE
FILES TO CHANGE
ANDROID TEST PLAN

Then wait for the next implementation instruction unless the user explicitly asks to proceed.


### v0.9.37 — PWA deployment baseline
Date: 2026-09-03
The current v0.9.36 candidate was packaged for GitHub Pages/PWA deployment. The change is additive: manifest, icons, service worker, mobile web metadata, and deployment documentation. The runtime remains `index.html`. Service worker registration is limited to HTTPS/localhost/loopback and cross-origin NanoGPT traffic is intentionally excluded from service-worker interception. Local `content://` / `file://` attachment testing remains supported.
