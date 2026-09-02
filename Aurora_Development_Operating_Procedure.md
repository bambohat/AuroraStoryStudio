# Aurora — Development Operating Procedure
Version: 0.1

This document defines how we will work together while rebuilding Aurora.

## 1. The two permanent documents

The Master Blueprint answers:

“What are we building?”

The Build Ledger answers:

“What have we actually built, and does it work?”

Neither should be replaced by memory or casual conversation.

## 2. One phase at a time

We do not attempt the entire application in one edit.

Each phase has a narrow goal.

The sequence is:

Foundation → Shell → Navigation → Library → Concepts → Codex → Reader → Editor → Writing → Memory → Branches → Taste → Authors → Anti-Slop → NanoGPT → Comics → Hardening.

A later feature must not be allowed to destabilize an earlier completed phase.

## 3. Before each implementation

Before editing code, define:

- Objective
- User-visible behavior
- Data required
- Routes involved
- Dependencies
- Acceptance tests

If the change is too large, divide it.

## 4. During implementation

Prefer small, isolated components.

Avoid global state unless the state is genuinely global.

Use dedicated state domains:

- interface
- reader
- editor
- story
- AI
- taste
- memory

Do not reuse a convenient variable for unrelated purposes.

## 5. After implementation

Test the feature manually.

Do not assume a successful build means a successful feature.

Check:

- Does it open?
- Does it close?
- Does Back work?
- Does it save?
- Does reload preserve it?
- Does an error leave the application usable?
- Does it work on a phone?
- Does it behave correctly when data is empty?

## 6. If something breaks

Do not immediately add another workaround.

Identify:

- What action caused the problem?
- What page were we on?
- What should have happened?
- What actually happened?
- Whether the problem is UI, state, navigation, persistence, or AI.
- Whether the failure is reproducible.

Then fix the root cause.

## 7. If a design is bad

We change the design.

The Blueprint is not sacred.

Its purpose is to preserve the product vision, not to preserve bad ideas.

## 8. AI development rule

AI is introduced only after the non-AI workflow is reliable.

This lets us distinguish:

“the application is broken”

from:

“the model produced a poor result.”

## 9. User interaction rule

The user should not have to understand engineering terminology.

When giving a test instruction, say:

“Tap Story.”

“Open the chapter.”

“Press Read.”

not:

“Verify the route transition from the chapter entity renderer.”

Technical explanations can be provided separately when useful.

## 10. Tutorial after each phase

Every completed phase gets a short user tutorial containing:

What changed.

How to use it.

What to test.

What not to expect yet.

What comes next.

## 11. Version checkpoints

Every stable phase receives a Git tag or equivalent checkpoint.

Example:

v0.2-shell
v0.3-navigation
v0.4-library

Never make a large experimental change directly on top of an uncheckpointed build.

## 12. Definition of done

A phase is complete only when:

- Implementation exists.
- Main workflow works.
- Back works.
- Persistence works where applicable.
- Error states are handled.
- Android testing passes.
- User understands the feature.
- Ledger is updated.
- Git checkpoint exists.

## 13. The most important rule

Do not optimize for the number of features.

Optimize for:

clarity → reliability → usability → intelligence → sophistication.

That order is deliberate.


## PWA / static deployment procedure
When preparing Aurora for GitHub Pages or another HTTPS static host:
1. Treat `index.html` as the executable runtime unless source inspection proves a migration.
2. Keep `manifest.webmanifest`, `sw.js`, and `icons/` at the deployment root used by the app.
3. Use relative (`./`) paths so project/repository Pages deployments are supported.
4. Never intercept cross-origin NanoGPT/provider requests with the service worker.
5. Do not require a service worker when Aurora is opened from Android `content://` or `file://` attachment previews.
6. Validate manifest JSON, service-worker syntax, icon dimensions, runtime syntax, and ZIP/package integrity before handoff.
7. Do not claim PWA installation/offline support as verified until it has been tested from the hosted HTTPS URL on Android.
