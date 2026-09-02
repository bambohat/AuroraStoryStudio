# Aurora — Master Product Blueprint
Version: 0.2 (handoff update)
Date: 2026-09-02
Status: Active product vision + implementation constraints

## 1. Product definition

Aurora is a private-first, mobile-first PWA for creating, developing, writing, reading, and eventually illustrating novels and comics with AI assistance.

The core product goal is: the user expresses creative intent; Aurora manages the prompt/context/memory machinery. The normal UI should be extremely simple, beautiful, modern, smooth, and usable without understanding AI engineering. Advanced systems should exist behind an Advanced layer.

Aurora is intended to solve the user's frustrations with complicated lorebook/preset/prompt workflows. The user should not have to manually assemble prompt stacks, context windows, lorebook activations, summaries, token budgets, or elaborate character cards during ordinary creative work.

The manuscript is the primary creative artifact. Structured story memory supports continuity and AI context; it must never quietly replace the manuscript.

## 2. User experience principles

1. Simple on the surface; powerful underneath.
2. No fake functionality. A visible control must actually work.
3. Clear, hierarchical navigation and Back behavior.
4. Large mobile touch targets and responsive Android layout.
5. Destructive actions require deliberate confirmation.
6. Reading and editing surfaces must not feel like small browser dialogs.
7. Advanced options may be powerful, but they should not clutter the normal workflow.
8. The user should spend effort making creative decisions, not maintaining prompt infrastructure.
9. Help should explain what a feature is, when to use it, and what happens after pressing it.
10. Reliability takes precedence over feature count.

## 3. Writing preferences that must shape Aurora

These are product preferences, not universal defaults:

- Concrete, purposeful prose is preferred.
- Avoid generic LLM "slop": automatic atmosphere, repetitive sensory details, purple prose, unnecessary metaphors, formulaic transitions, excessive adjectives/adverbs, generic emotional explanations.
- The user often wants mature protagonists/characters rather than childish/teenage-feeling archetypes.
- The user dislikes repetitive cultivation/manhua clichés such as clones, young-master faceslapping, and shallow repetitive power escalation.
- The user wants author/style imitation as a one-click capability, combined with personal taste rather than replacing it.
- User direction for the current story should override learned taste where appropriate.
- POV and writing control should be configurable per story/chapter/scene.

## 4. Main application areas

### Library
Private archive with novels/comics, search, advanced search, Boolean-style filtering, tags, multi-tag filtering, favorites, folders, sorting, recent/unfinished/completed views, metadata editing, delete/restore, import/export, backup/restore.

### Story Workspace
One project dashboard exposing progress, current chapter/scene, planning status, Story Brain, and quick actions: Read, Write, Plan, Guide, Brain/Codex, Outline, Story Settings.

### Concept Builder
Start from a short idea and produce a structured concept. Support Novel/Comic, style/author choice, My Taste, Custom Style, regeneration of individual components, and approval.

### Story Brain / Codex
Core structured knowledge layer. Required entity types include:
- Characters
- Locations
- Factions
- Items
- Rules
- Concepts
- Relationships
- Secrets
- Events
- Open threads
- Custom entities/fields

The user must be able to add custom fields to any Brain entry and extend default entity types (for example adding a Power entity/field) rather than being forced into a fixed schema.

### Outline
Supports series/books/acts/arcs/phases/chapters/scenes/beats. Arcs contain phases and events. Story position distinguishes current, past, and future.

### Manuscript / Editor
The manuscript remains independently editable. AI output is a candidate until explicitly accepted.

### Reader
Dedicated reader with independent typography/settings, TOC, chapter navigation, Find/Replace where relevant, bookmarks/progress, fullscreen, and robust mobile scrolling.

### Comic Studio
Shares core Story Brain with novel workflows and adds visual character/location bibles, pages, panels, camera/composition, dialogue, image prompts, references, and visual continuity.

## 5. Story Brain model

### 5.1 Persistent identity vs changing state
A character is one entity. Changing cultivation, location, condition, goals, relationships, etc. are states in that entity's state timeline. Do NOT create a second character just because the state changed.

The state timeline should clearly distinguish:
- Current
- Past / completed
- Future
- Hidden / locked
- Revealed
- AI-only / author-only knowledge

Finished states remain as history and are not deleted merely because a new current state exists.

### 5.2 Canon and provenance
Canon should distinguish:
- Established/persistent fact
- Current state
- Historical/past fact
- Future planning knowledge
- Hidden/locked knowledge
- Idea/possibility
- Rejected alternative
- AI-inferred/generated candidate

Generated prose should not automatically become permanent canon.

Every important extracted fact should eventually support provenance such as:
- source: manuscript / user / AI suggestion
- chapter/scene
- confidence
- status: pending / accepted / rejected
- who can know it
- reveal condition

### 5.3 Knowledge boundaries
Aurora's AI may know author-level hidden/future information for planning, but characters must only know information that their story state says they have learned.

A secret such as "a supposedly dead relative is actually alive" must not automatically enter the protagonist's thoughts/dialogue. Hidden information should only become character-visible when its reveal condition is satisfied.

### 5.4 Progressive arc knowledge
Arcs and phases must support gradual disclosure. A complete arc record may contain future information, but retrieval for the current position must only expose information permitted at that point.

An arc can be:
- planned
- active
- completed
- abandoned/replaced

Completion does not erase consequences. Current story position determines which arc/phase is present.

## 6. AI writing architecture

Aurora should compile the user's request from layered context rather than exposing a giant manual prompt.

Current design inputs:
1. Application rules
2. Writing rules
3. User taste
4. Author/style profile
5. Story rules
6. Relevant Brain facts
7. Current character states
8. Relevant timeline/events
9. Relevant memory
10. Current outline/arc/phase position
11. Current scene
12. Recent manuscript
13. User direction
14. Generation task

The compiled prompt remains an implementation detail in normal use, but an advanced "Why did Aurora do this?" explanation may summarize which major context sources influenced a generation.

## 7. AI automation / lazy workflow

The user explicitly wants Aurora to automate Brain maintenance because manually maintaining many entries is tiring.

Target workflow:

Write/accept chapter
→ analyze accepted prose
→ match against existing entities
→ advance states rather than duplicate entities
→ identify new characters/locations/events/threads/rules
→ propose safe updates
→ automatically apply only safe low-risk updates when enabled
→ keep ambiguous/high-risk/hidden/canon changes for review

Current v0.9.25 automation has three modes:
- Off
- After accept: suggest updates
- After accept: auto-apply safe updates

Automation must never silently delete records or rewrite protected canon.

## 8. NanoGPT provider architecture

NanoGPT is the current provider target. The provider implementation should remain isolated from the story engine.

Settings include API access policy, API key, text model, image model, optional advanced controls, request limits, and local request tracking.

The runtime currently uses `index.html` as the actual executable source; `app.js` and `runtime.js` are retained in the repository/package as reference/helper artifacts from the integrated build. Do not assume that editing those files changes runtime behavior unless the runtime architecture is intentionally migrated.

## 8A. PWA / deployment baseline
Aurora is intended to be installable as a Progressive Web App when served over HTTPS. The canonical deployment target is GitHub Pages. Use a relative manifest `start_url`/`scope` and a relative service-worker registration so repository/project Pages paths remain valid. The app shell may be cached for offline startup, while cross-origin provider/API traffic must not be intercepted by the service worker.

PWA quality requirements:
- real web app manifest;
- 192px and 512px icons plus an Android maskable icon;
- standalone display;
- mobile safe-area support;
- no dependence on browser-only `file://` or `content://` behavior for installation;
- service worker must be additive and must not change NanoGPT transport semantics;
- offline shell should open the app UI without pretending remote AI services are available.

## 9. AI cost control

Token efficiency is a core requirement.

Avoid full-book prompts. Retrieve only relevant context. Cache expensive analysis where practical. Low-cost background extraction is preferred where appropriate. Full-book/expensive operations should require explicit confirmation.

## 10. Long-context architecture

Do not place the entire novel into every prompt.

Use layers:
- permanent story truth
- long-term state
- arc state
- chapter state
- scene state
- recent prose
- temporary direction

Retrieval chooses relevant information for the current request.

## 11. Branching

Significant alternate generations may become branches. Main story must remain intact. Branches contain the story state at the branch point plus alternate material.

## 12. Author/style and Taste Engine

Aurora should support reusable author/style profiles and custom style analysis from sample text, combined with personal taste.

Taste should learn from:
accepted generations, rejected generations, edits, swipes, likes/dislikes, examples, "more like this", "less like this", author comparisons.

Taste has scope and strength, including temporary instructions and story/genre/author/scene scopes.

## 13. Anti-AI prose system

The system should eventually evaluate and reduce the user's disliked patterns without imposing one universal definition of good prose.

Initial concerns include:
- generic sensory details
- purple prose
- unnecessary metaphors
- repetitive sentence structures
- formulaic transitions
- generic emotional exposition
- over-description
- repetitive atmosphere language

## 14. Mobile-first requirements

Aurora is designed primarily for Android phones:
- large touch targets
- one-handed operation where practical
- minimal nested menus
- smooth scrolling
- working sticky actions
- browser safe-area handling
- no tiny dialogs
- clear loading/error states

## 15. Development control

Every change must:
1. identify the actual runtime files;
2. define the user-visible behavior;
3. implement the smallest sensible change;
4. test manually on Android;
5. record pass/fail;
6. update the Ledger;
7. preserve a stable rollback point.

Never claim a feature is fixed merely because the code was modified.

## 16. Roadmap

The original roadmap remains:
Phase 0 Foundation
Phase 1 Visual shell
Phase 2 Navigation
Phase 3 Library
Phase 4 Concept Builder
Phase 5 Codex/Story Brain
Phase 6 Reader
Phase 7 Editor
Phase 8 Writing workflow
Phase 9 Memory/long-context
Phase 10 Branches/checkpoints
Phase 11 Personal Taste
Phase 12 Author Library
Phase 13 Anti-AI prose
Phase 14 NanoGPT orchestration/budget
Phase 15 Comic Studio
Phase 16 Hardening/PWA/offline/import/export/performance

The integrated v0.9.x prototypes intentionally overlap multiple roadmap phases for end-to-end testing. The roadmap remains the authority for future scope.

## 17. Current definition of success

Aurora succeeds when the user can say:
"I know what to press."
and then move from idea to finished novel/comic without becoming an expert in prompt engineering, lorebooks, context management, memory systems, or provider configuration.
