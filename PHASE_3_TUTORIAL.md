# Aurora Phase 3 — Library Foundation

This is the first real content-management phase.

Create a Novel or Comic from Create. The item is stored locally on the device and appears in Library.

In Library:
- Search by title.
- Filter All / Novels / Comics / Favorites.
- Sort Recent / Name / Oldest.
- Tap a story to open its detail page.
- Back returns to Library.
- Favorite toggles the favorite state.
- Rename and Delete use Aurora in-app dialogs.

The Library is real local data. It survives reloads.

Do not expect AI, Concept Builder, Codex, folders, chapters, reader, editor, backup/restore, or memory yet.


## v0.4.1 Create-page UI fix

The Create page now uses Aurora's visual components rather than browser-default input/button styling.

Test:
1. Open Create.
2. Enter a title.
3. Select Novel and Comic.
4. Confirm the selected type has a clear active state.
5. Confirm the text field looks like the rest of Aurora.
6. Create & Open still creates the local Library item.


## v0.4.2 — Better Library sorting

The Library Sort control now provides:

- Recently opened — useful for continuing work.
- Recently added — newest projects first.
- Recently changed — recently renamed/favorited/updated items first.
- Oldest added — oldest projects first.
- Title A–Z.
- Title Z–A.
- Progress high → low.
- Progress low → high.
- Favorites first.
- Type — groups Novels and Comics.

When you change the sort, Aurora immediately reorders the visible cards and shows the selected sort briefly.

Test with at least 3 stories having different titles. Open one, favorite another, and then try several sort modes so the order visibly changes.


## Final status — v0.4.2-STABLE

Phase 3 Library foundation has been user-tested and accepted.
Future development must branch from this stable baseline.

Next: Phase 4 — Concept Builder.
