# Aurora — Master Product Blueprint
Version: 0.1
Status: Foundation specification for the rebuild

## 1. Product definition

Aurora is a private, mobile-first PWA for creating, developing, writing, reading, and eventually illustrating novels and comics with AI assistance.

The central product goal is not to expose the user to a complicated AI prompt-management system. Aurora should hide the machinery and expose simple creative actions. Advanced controls exist, but they stay behind an Advanced layer.

The user should be able to begin with a vague idea, let Aurora develop the concept, build characters and world information, create an outline, write scenes and chapters, revise them, read the finished work in a high-quality reader, branch alternate ideas without damaging the main story, and maintain continuity over very long works.

The application is private-first. Story data, preferences, memory, branches, author profiles, and settings should remain locally stored unless the user explicitly sends selected information to an AI provider.

The current AI provider target is NanoGPT through an OpenAI-compatible chat-completions endpoint. The application must be designed so the provider/model can be changed later without rebuilding the writing engine.

## 2. Core philosophy

Aurora must solve the usability problems experienced with SillyTavern and NovelCrafter rather than simply reproduce their interfaces.

The user does not want to manually manage complicated prompt stacks, context insertion, lorebook activation, summaries, presets, author notes, token budgets, or character-card engineering during ordinary creative work.

Therefore Aurora follows this principle:

> The user expresses intent. Aurora manages the machinery.

The second principle is:

> Simple on the surface; powerful underneath.

The third principle is:

> No fake functionality.

A visible control must work. If a feature is not implemented, it must not pretend to work. It can be marked as planned or hidden until ready.

The fourth principle is:

> Story truth is separate from generated prose.

The manuscript is the primary artifact. Structured story state is derived from it. AI prompts are compiled from that state rather than becoming the permanent source of truth.

## 3. Primary user experience

The normal workflow should feel like:

Idea → Concept → Characters/World → Outline → Chapter → Scene → Write → Revise → Read.

The user should not need to understand context windows, prompt ordering, retrieval, token allocation, summarization, or prompt templates to use this workflow.

At any point, Aurora should make the next useful action obvious.

The application should provide contextual tips through small question-mark/help controls. Each important control must explain what it does, when to use it, and what happens afterward.

## 4. Main application areas

### Library

The private archive of novels, comics, concepts, folders, favorites, recent work, unfinished work, and completed work.

Required capabilities include:

- Search
- Advanced search
- Boolean-style filtering
- Sort
- Filters
- Favorites
- Folders
- Move
- Rename
- Edit metadata
- Delete
- Restore
- Recent
- Unfinished
- Completed
- Novel/comic separation
- Import/export
- Backup/restore

### Story Workspace

The central workspace for one project.

It should expose the current story, progress, current chapter/scene, planning status, story brain, and quick actions.

Primary actions should include:

- Read
- Write
- Plan
- Guide
- Open Codex
- Open outline
- Open story settings

### Concept Builder

The user can start from almost nothing.

Example:

“I want a mature immortal cultivation emperor to retire in a lower realm.”

Aurora converts that into a structured concept and asks only useful questions.

The user can choose:

- Novel
- Comic
- Starting template
- Author/style
- My Taste
- Custom style

The system should allow regeneration of individual components without destroying approved components.

### Codex

The structured story knowledge base.

Entity types include:

- Characters
- Locations
- Factions
- Items
- Rules
- Concepts
- Relationships
- Secrets
- Events
- Other custom entities

Codex entries should be easy to create manually, but AI extraction and enrichment should be the normal low-effort workflow.

### Outline

The story planning system.

It supports:

- Series
- Books
- Acts
- Arcs
- Chapters
- Scenes
- Beats

The user can use standard structures, custom structures, or let Aurora propose one.

The outline is guidance, not a cage. The actual story can deviate while Aurora tracks the divergence.

### Manuscript

The actual written story.

The manuscript must remain editable independently from AI generation.

### Reader

A dedicated high-quality reading environment, completely separate from application UI typography.

Reader settings include:

- Font family
- Font size
- Line height
- Paragraph spacing
- Text width
- Page margins
- Page padding
- Alignment
- Theme
- Background
- Chapter navigation
- Table of contents
- Find
- Bookmarks
- Reading progress
- Full-screen mode
- Exit full-screen mode

Reader settings must never modify global application text sizing.

### Editor

A proper manuscript editor supporting:

- Bold
- Italic
- Underline
- Font family
- Font size
- Text color
- Highlight
- Headings
- Alignment
- Lists
- Links
- Images
- Image positioning
- Find
- Replace
- Undo
- Redo
- Copy/paste
- Scene/chapter management

Editing must use a real editor surface, not browser alert/prompt dialogs.

## 5. AI writing engine

Aurora's AI layer is a context compiler and orchestration system.

The user should not manually construct the final prompt.

The engine compiles a request from:

1. System safety/application rules
2. User's writing preferences
3. Selected author/style profile
4. Story-level rules
5. Relevant Codex facts
6. Current character states
7. Relevant timeline/events
8. Relevant memory
9. Current outline position
10. Current scene
11. Recent manuscript text
12. User's immediate direction
13. Generation task

The exact prompt structure is an implementation detail hidden from ordinary users.

## 6. Personal Taste Engine

Aurora must learn the user's individual writing taste rather than forcing a fixed community preset.

The taste engine stores positive and negative preferences.

It learns from:

- Explicit likes
- Explicit dislikes
- Accepted generations
- Rejected generations
- Swipes
- Rewrites
- User edits
- “More like this”
- “Less like this”
- Saved examples
- Author comparisons

Preferences should have strength and scope.

For example, a user may dislike a writing pattern generally but allow it in a specific genre or author profile.

The engine must therefore support:

- Global preference
- Story preference
- Genre preference
- Author-specific preference
- Scene-specific preference
- Temporary instruction

The user must be able to inspect, edit, disable, reset, and snapshot their taste system.

## 7. Author/style library

Aurora provides reusable author/style profiles.

Each profile contains observable writing characteristics rather than pretending to reproduce an author's mind.

The UI should provide short previews so the user can compare styles before choosing one.

A custom profile can be created by giving Aurora one or more writing samples.

Aurora analyzes characteristics such as:

- Sentence length
- Rhythm
- Dialogue density
- Narration distance
- Point of view
- Description density
- Figurative-language frequency
- Emotional explicitness
- Internal monologue
- Pacing
- Scene transitions
- Vocabulary tendencies
- Paragraph structure
- Dialogue style

The profile is then combined with the user's personal taste.

Conceptually:

Author Profile + User Taste + Story Rules + Current Scene = Writing Style Context.

## 8. Anti-AI prose engine

Aurora should detect and reduce patterns the user considers “AI writing.”

Initial categories include:

- Generic sensory details
- Stock sensory descriptions
- Predictable atmospheric descriptions
- Purple prose
- Excessive metaphors
- Figures of speech used without purpose
- Repetitive sentence structures
- Generic emotional explanations
- Over-description
- Predictable gestures
- Formulaic transitions
- Excessive adjectives/adverbs
- Unnecessary scene-setting
- Repetitive references to smell, light, atmosphere, tension, silence, etc.

The system must learn the user's own examples rather than treating one universal anti-slop list as absolute.

The engine should be capable of evaluating generated text before it is shown as a preferred generation.

## 9. Persona and character system

The user should not have to manually build elaborate character cards.

A character can begin with a simple statement.

Example:

“Ruin is an immortal emperor who has retired and wants a quiet life.”

Aurora can propose:

- Identity
- Appearance
- Personality
- History
- Goals
- Fears
- Values
- Contradictions
- Skills
- Relationships
- Knowledge
- Secrets
- Speech tendencies
- Current state

The user approves or edits the important facts.

Characters must have knowledge boundaries. NPCs should not automatically know information they have not learned.

Character state can evolve through the manuscript.

## 10. Perspective and control

The user may choose or change:

- First person
- Second person
- Third person limited
- Third person omniscient
- Multiple POV
- Scene-specific POV
- Character-controlled dialogue/actions
- User-controlled protagonist
- AI-controlled protagonist

These are story configuration choices, not permanent preset commandments.

A preset must never silently override the user's current project preference.

The engine should expose a simple “Writing Control” setting:

- AI writes everything
- AI writes around my character
- I control my character; AI controls the world
- Shared control
- Custom

The system must support changing this during a story without corrupting previous chapters.

## 11. Long-context architecture

Aurora must never attempt to put the entire novel into every request.

The story is stored as structured layers.

Permanent layer:
- Core premise
- World rules
- Character identities
- Important relationships
- Permanent facts

Long-term state:
- Major events
- Character development
- Open plot threads
- World changes
- Important discoveries

Arc layer:
- Current arc summary
- Arc goals
- Arc state

Chapter layer:
- Chapter summary
- Chapter events
- Chapter state

Scene layer:
- Current scene
- Recent prose
- Immediate instructions

Retrieval selects only relevant information.

This allows very long works without treating Chapter 100 as one enormous prompt.

## 12. Summarization architecture

Summaries are generated automatically after meaningful writing events.

They should not replace the manuscript.

Aurora can maintain:

- Scene summary
- Chapter summary
- Arc summary
- Book summary
- Character-state update
- Timeline event
- Open-thread update

The user can inspect and regenerate summaries.

The engine should distinguish between:

“summary for context”

and

“canonical story fact.”

A summary cannot silently overwrite canonical facts.

## 13. Branching

Every significant generation can optionally produce a branch.

A branch contains the story state at the branch point and its alternate continuation.

The original story remains intact.

Use cases:

- Test a plot idea
- Try a different character decision
- Try a different ending
- Compare writing styles
- Experiment with a scene
- Test a major plot twist

The user can:

- Continue branch
- Rename branch
- Compare branch
- Merge selected material
- Delete branch
- Restore main story
- Create checkpoint

## 14. Swiping/regeneration

The writing surface supports multiple generations for the same request.

The user can swipe between candidates.

Each candidate should be treated as a proposal until accepted.

Actions:

- Accept
- Regenerate
- Rewrite
- Shorter
- Longer
- More dialogue
- More action
- Follow outline
- Surprise me
- Custom direction

Rejected candidates can optionally provide learning feedback to the Taste Engine.

## 15. Prompt system

Aurora internally supports layered instructions.

There should be at least:

- Application system rules
- Writing engine rules
- User taste
- Author profile
- Story rules
- Scene instructions
- Temporary request

The user does not need to manage these manually.

Advanced users can inspect the compiled prompt, but this is hidden from the normal workflow.

A “Why did Aurora do this?” action can explain which major instructions influenced a generation without exposing overwhelming technical detail.

## 16. AI cost control

The user's practical budget is approximately $3 every two weeks.

Therefore the system must treat token efficiency as a core requirement.

Features should include:

- Estimated request cost
- Session cost
- Period cost
- Token usage
- Context size
- Model selection
- Low-cost background extraction
- Cacheable analysis
- Avoid unnecessary repeated context
- User-defined spending ceiling

Expensive operations such as full-book analysis should require explicit confirmation.

## 17. NanoGPT provider layer

The provider layer should be abstracted.

Configuration includes:

- API endpoint
- API key
- Model
- Temperature where supported
- Maximum output where supported
- Optional advanced parameters

Credentials should be stored locally and never placed into public source code.

The UI should include a connection test.

The provider implementation should be isolated from the story engine.

## 18. Settings

Settings are divided into:

Simple:
- Appearance
- Accent color
- Theme
- Reader defaults
- Interface preferences

Connection:
- NanoGPT endpoint
- API key
- Model

Advanced:
- Context compiler
- Memory
- Style engine
- AI prose evaluator
- Routing
- Token/cost controls
- Debug information

Data:
- Export
- Import
- Backup
- Restore
- Reset

Settings must be a real navigable page or full-screen sheet with:

- Working close/back control
- Internal scrolling
- Sticky save/cancel controls
- Safe error handling
- No browser prompts
- No null-state crashes

## 19. Backup and persistence

The application must persist user data locally.

Persistent data includes:

- Stories
- Chapters
- Scenes
- Codex
- Outlines
- Branches
- Taste
- Author profiles
- Reader settings
- Interface settings
- AI connection configuration
- Checkpoints
- Metadata

Backups must be exportable.

Restore must validate the backup before replacing current data.

Reset must distinguish:

- Reset UI settings
- Reset AI connection
- Reset Taste Engine
- Reset story
- Factory reset

Destructive actions require confirmation.

## 20. Comic architecture

Novel and comic projects share the same Story Brain.

Comic-specific layers include:

- Character Visual Bible
- Location Visual Bible
- Page outline
- Panel outline
- Camera
- Composition
- Dialogue
- Image prompt
- Reference images
- Visual continuity

The same character identity and story state should feed both prose and comic generation.

## 21. Mobile-first UX rules

Aurora is designed primarily for Android phones.

Rules:

- Large touch targets
- One-handed usability where practical
- Bottom navigation for primary sections
- Clear back navigation
- Minimal nested menus
- Smooth transitions
- No desktop-only controls
- No tiny editing dialogs
- Full-screen editors/readers
- Sticky primary actions
- Responsive layouts
- Android browser safe areas
- Accessible text contrast
- Clear disabled/loading states

## 22. Visual language

The default Aurora aesthetic is dark, modern, calm, premium, and readable.

The default accent is Aurora purple.

Supported accent families may include:

- Aurora
- Ocean
- Emerald
- Crimson
- Amber
- Rose
- Mono

Theme options:

- Dark
- Light
- System

Changing a theme must never reload the application unexpectedly or navigate to Home.

## 23. Help system

Every unfamiliar feature should have a concise help explanation.

Help should answer:

“What is this?”

“When should I use it?”

“What happens if I press it?”

Advanced technical explanations remain available through an “Advanced explanation” option.

## 24. Engineering architecture

The rebuild should use strong separation of concerns.

Suggested layers:

UI
→ Navigation
→ Application services
→ Domain/story state
→ Persistence
→ AI orchestration
→ Provider adapters

Reader configuration must be isolated from global UI configuration.

Navigation must be centralized.

Persistence must be centralized.

AI calls must be centralized.

Prompt compilation must be centralized.

No page should directly manipulate unrelated global state.

## 25. Development rule

Every feature is developed in this order:

1. Define behavior.
2. Build the smallest implementation.
3. Test manually on Android.
4. Fix errors.
5. Add polish.
6. Document usage.
7. Mark the feature status in the Build Ledger.
8. Commit a Git checkpoint.

No large batch of untested features.

## 26. Planned phase sequence

Phase 0 — Blueprint and engineering foundation

Phase 1 — Visual shell

Phase 2 — Navigation

Phase 3 — Library/archive

Phase 4 — Concept Builder

Phase 5 — Codex and story brain

Phase 6 — Reader

Phase 7 — Editor

Phase 8 — Writing workflow

Phase 9 — Memory and long-context

Phase 10 — Branches/checkpoints

Phase 11 — Personal Taste Engine

Phase 12 — Author/style library

Phase 13 — Anti-AI prose engine

Phase 14 — NanoGPT orchestration and budget control

Phase 15 — Comic Studio

Phase 16 — Advanced polish, PWA/offline hardening, import/export, performance

## 27. Definition of success

Aurora succeeds when the user can open it and think:

“I know what to press.”

The user can begin with:

“I have an idea.”

and Aurora can guide the project all the way to:

“I have a finished novel/comic I can read.”

The AI complexity should be almost invisible during normal use.

The user should spend their effort making creative decisions, not maintaining prompt infrastructure.


## 24.1 AI-assisted Brain maintenance
Aurora may use AI to maintain the structured Story Brain from accepted manuscript prose. This is an automation layer, not a replacement for author authority.

The preferred low-effort workflow is:

Accepted prose → Brain Assistant → detect supported changes → match existing entities → propose new states or records → review/apply.

Automation modes may be story-specific:

- Off — no automatic Brain maintenance.
- Suggest updates — run Brain Assistant after accepted AI prose, but require review before changes.
- Auto-apply safe updates — automatically apply only low-risk bookkeeping changes; ambiguous, protected, future, hidden, or potentially destructive changes remain for review.

AI must never delete records, silently rewrite protected canon, promote future information to current, or reveal hidden knowledge merely because the model inferred it. The application must keep the manuscript authoritative and treat AI-extracted Brain changes as proposals until accepted or classified safe by deterministic safeguards.

The automation layer should be token-efficient and should run after accepted prose rather than after every keystroke.
