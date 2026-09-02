# Aurora Story Brain — v0.6.0 Tutorial

## What changed
The old Permanent Canon control was too confusing. v0.6.0 separates story memory into four simple meanings: Established fact, Current state, Idea / possibility, and Rejected. These controls are inside the optional Story Memory section, so normal character/world editing does not require canon decisions.

## Story Memory
- **Established fact:** something you have established as true.
- **Current state:** true at the current point in the story and expected to change over time.
- **Idea / possibility:** a possibility that has not been accepted as story truth.
- **Rejected:** an alternative you explicitly do not want treated as truth.
- **Who can know this?:** controls knowledge scope, including MC-only, specific characters/groups, AI/author-only, or nobody in-world.
- **Reveal status:** lets future/secret information remain locked until an explicit unlock point.
- **Protect:** optional safeguard against casual AI contradiction later.

## Story position
Use **Story position** to record the current arc, phase, chapter/scene, and whether the arc is Not started, Active, or Completed. This is the foundation for distinguishing completed events from current and future events.

## Arcs
The first arc registry is intentionally lightweight. Add an arc name, status, and description. Later AI orchestration will use arc progress and event/reveal data to filter future information and retain persistent consequences after an arc completes.

## Important limitation
v0.6.0 does **not** yet send these permissions to NanoGPT or automatically update state from generated chapters. The UI/data model is being tested first. AI retrieval, knowledge filtering, reveal gating, automatic state transitions, and output leak checking come later.

## Test
Create one character with Current state = Foundation Establishment, one hidden family secret with AI/author-only + locked reveal, and one arc named Marineford. Set the current position to that arc. Confirm the information is saved and visible in Read/Overview without forcing Permanent Canon.
