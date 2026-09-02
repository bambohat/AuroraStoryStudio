# Aurora Phase 4.1 — Concept Builder UI Tutorial

This phase tests the experience of starting a project before AI is connected.

Open **Create**.

Step 1: write any idea, even a messy one.

Step 2: choose Novel or Comic.

Step 3: choose a simple starting style. My Taste will eventually use your learned writing preferences. Add a custom direction if you have one.

Step 4: Review the exact choices.

Use Back/Next to move through the builder.

In this phase, **Build my concept does not call NanoGPT**. It only proves the workflow.

### Test
1. Open Create.
2. Enter a messy story idea.
3. Go Next.
4. Switch Novel/Comic.
5. Go Next.
6. Try several styles.
7. Add custom direction.
8. Go Review.
9. Confirm the idea, type and style are correct.
10. Go Back and confirm your selections remain.
11. Return to Review.
12. Press Build my concept and confirm Aurora only shows a confirmation message.

Do not expect AI generation yet.


## v0.4.2 — Build handoff and richer styles

The Concept Builder now ends by creating a real Library project.

On Review:
1. Give the project a title.
2. Check the idea, format, and style.
3. Press **Build & Open in Library**.
4. Aurora creates the project locally and opens it in Library.

Styles now show actual traits rather than only one sentence.

**Create my own style** lets you enter:
- Style name.
- Detailed style definition.
- Optional writing sample.

A later phase will analyze the sample and turn observable traits into a reusable style profile. This phase only stores the profile data.


## v0.4.3 — Custom styles and richer Library cards

### Temporary vs Saved style

On Step 3, a custom style has two choices:

**Use for this story only**
- Uses the style in the current project.
- Does not add it to the reusable My Styles list.

**Save to My Styles**
- Stores the style locally.
- It appears in the style list for future projects.
- Saving the same style name updates that saved profile.

### Writing sample — what it means

A writing sample is optional. It means a short piece of **your own writing** that represents the voice you want Aurora to understand.

It can be:
- a paragraph,
- a scene,
- dialogue,
- or another short excerpt.

It does not need to be supplied. In this phase it is simply stored as part of the profile; later Aurora can analyze observable traits from it.

### Library

Built projects now display:
- title,
- Novel/Comic,
- chapter count,
- style,
- a short premise/summary,
- progress,
- last-opened state.

The summary is derived locally from the idea text in this phase; it is not an AI-generated synopsis yet.


## v0.4.4 — Managing custom styles

In **My saved styles** each saved style has three deliberate actions:

- **Use** — select it for the current project without opening its definition.
- **Edit** — load it into the custom-style editor so you can modify and save it.
- **Delete** — opens a warning first. You must explicitly confirm deletion.

Use **＋ New custom style** whenever you want to create a different profile. This clears the custom editor and starts a separate profile instead of modifying the currently selected saved style.


## v0.4.4 verification result

Phase 4.1 custom-style management has been tested by the user and accepted as working.

**Known-good checkpoint:** v0.4.4.

The next development target is Phase 5 — Codex / Story Brain. Do not skip directly to AI generation.
