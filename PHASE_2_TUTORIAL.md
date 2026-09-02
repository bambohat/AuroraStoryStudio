# Aurora Phase 2 — Navigation Test

This build is a clean rebuild from the verified v0.2.2 shell. The previous v0.3.2 startup experiment was removed because it made startup slower.

## Test 1 — startup
Close the page completely and open `index.html`.
Expected: Aurora appears and controls become usable without a multi-second artificial loading screen.

## Test 2 — history
Tap Library → Create → More.
Press Back three times.
Expected: More → Create → Library → Home.

## Test 3 — settings
From Home, tap Library, then More. Tap Save & Close.
Expected: return to Library.

## Test 4 — Aurora Home command
Open Library or Create, then tap the Aurora logo/name.
Expected: Home. The old navigation path is cleared.

## Test 5 — reload
While on Library or Create, reload the page.
Expected: the same root page is restored.

## Test 6 — scrolling
Scroll normally. Pull downward at the top.
Expected: normal scrolling works, but Android Chrome does not refresh Aurora.

Do not proceed to Phase 3 until these tests pass.

## Settings save behavior

Settings are transactional. Selecting a theme, accent, or help-tip option does **not** apply it to the rest of Aurora. The selection is only a draft inside Settings.

- **Save & Close** = commit the draft, persist it, apply it, and return to the previous page.
- **Back** = discard the draft and return without changing Aurora.
- **Aurora logo** = discard the draft and go Home.

Test this specifically:
1. Start on Home with the current appearance.
2. Open Settings.
3. Select a different theme.
4. Do not save. Navigate Back.
5. Expected: the original theme is still active.
6. Repeat with an accent color and Help tips.
7. Then open Settings again, make a change, tap Save & Close.
8. Expected: the new setting is now active and remains after reload.


## v0.3.5 — Settings live preview

Settings now behaves like a proper draft editor.

When you select Dark/Light or an accent:
- The Settings screen changes immediately so you can see the result.
- The change is NOT saved yet.

Tap **Save & Close**:
- The preview becomes the committed setting.
- The setting survives reload.

Tap **Back**, tap the Aurora logo, or navigate to another area without saving:
- The preview is discarded.
- Aurora returns to the last saved appearance.

Test:
1. Open Settings.
2. Pick a different theme.
3. Confirm the whole Settings screen visibly changes.
4. Pick another accent.
5. Confirm the accent is visibly applied.
6. Leave without saving.
7. Confirm the previous appearance returns.
8. Repeat and press Save & Close.
9. Confirm the new appearance remains after reload.


## Final status — v0.3.5-STABLE

Phase 2 is complete and user-verified. Treat this build as the stable rollback point.

Next phase: Library / Archive foundation.
