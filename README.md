# Aurora Story Studio — MVP

A mobile-first, static-hostable PWA prototype for a private AI novel/comic workspace.

## What is implemented

- Aurora dark mobile-first UI with customizable accent color.
- Library and story creation flow starting from a rough idea.
- AI-assisted concept builder with editable concept, premise and story promise.
- Automatic starter characters/world/outline generated from the concept.
- Codex for characters, locations, factions, items and rules.
- Outline with acts, chapters and scene objectives.
- Writing view with demo manuscript, swipe/regenerate alternatives, accept/reject.
- Branching model and version history for scene candidates.
- Personal Taste Engine with save snapshot, freeze learning and reset.
- Author Style Library with original built-in style profiles and custom profile analysis.
- Prose cleaner that targets generic sensory padding, purple prose and repetitive LLM phrasing.
- AI Director choices: Logical / Interesting / Bold / Write my own.
- Advanced settings kept out of the main UI.
- Local persistence via localStorage.
- Service worker and manifest for PWA/offline shell.
- NanoGPT configuration UI and OpenAI-compatible chat endpoint adapter.

## Run locally

Use any static server from this folder, for example:

python -m http.server 8080

Then open http://localhost:8080

## GitHub Pages

Upload the files to a repository, enable GitHub Pages from the repository's Pages settings, and use the generated Pages URL.

## NanoGPT

The frontend stores API configuration locally in the browser. The endpoint is editable because API gateway URLs may vary. For a public deployment, direct browser-side API keys are inherently exposed to the browser. For a truly private production deployment, put the NanoGPT call behind a small serverless proxy and keep the key there.
