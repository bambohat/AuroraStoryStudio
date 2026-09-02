# Aurora — v0.9.25 AI Writing + Brain Automation Tutorial

## What changed
Aurora now sends a real chapter-writing request to NanoGPT from the manuscript editor. The request includes relevant Story Brain context, current story position, state timelines, recent manuscript prose, rules, open threads, and knowledge restrictions.

Generated prose is a candidate. You must explicitly create a new chapter or append it to the current scene. Nothing is silently added to the manuscript.

## Brain Assistant
After accepting AI prose, `Update Brain` asks NanoGPT to extract memory changes supported by that prose. Existing entities are updated with a new state rather than duplicated when possible. Suggestions are shown before application.

## Automation modes
- Off — no automatic Brain maintenance.
- After accept: suggest updates — run Brain Assistant automatically, but keep all changes waiting for review.
- After accept: auto-apply safe updates — automatically apply only low-risk suggestions; ambiguous or protected changes remain for review. This uses an extra AI request.

## Important limitation
The model is not a perfect database engine. It can miss or misunderstand facts. The safe design is conservative automation plus review for anything that could change canon, reveal hidden information, or affect future states.

## Android test
1. Open a story and its Manuscript Editor.
2. Confirm NanoGPT text model is selected in Settings.
3. Enter an optional author direction that tests continuity, such as keeping a character at their current cultivation while hiding a future breakthrough.
4. Press `Generate test chapter`.
5. Accept the result as a new chapter.
6. Press `Update Brain`.
7. Inspect the suggested updates.
8. Apply only the suggestions that are correct.
9. Verify the original manuscript is still intact and Story Brain records were not duplicated or deleted.
