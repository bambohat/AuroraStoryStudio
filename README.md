# Aurora Story Studio v4

Mobile-first, local-first PWA for novels and comics.

## MVP capabilities
- Story archive with search, sort, favorites, folders, move, edit, delete.
- Concept-first project creation with automatic foundation generation.
- Codex for characters, locations, factions, items, rules and concepts.
- Outline with acts, chapters and scenes.
- Full chapter/scene reader with font, size, width, line height, margins, padding and find controls.
- Large rich-text scene editor with bold, italic, underline, font family, size, color, highlight and image insertion.
- Persistent story memory with permanent facts, events, current state and open threads.
- Branches, versions and swipe candidates; alternatives remain non-canon until accepted.
- Personal Taste engine with learning, history, snapshots and import/export.
- Built-in author profiles plus custom author analysis.
- AI Director and prose cleaner.
- NanoGPT OpenAI-compatible endpoint.
- Export/restore backups and appearance customization.

## Deploy
Upload the contents of this folder to GitHub Pages. The app is static and stores its project data in browser localStorage. NanoGPT is called directly from the browser in this MVP, so use HTTPS and keep the API key private. A production serverless proxy should eventually protect the key.
