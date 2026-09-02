# Aurora Phase 6/7 — Reader & Manuscript Editor Tutorial

## Purpose

The manuscript is now separate from Story Brain. Story Brain stores continuity, canon, states, knowledge and planning. The manuscript stores the actual written prose.

## Reader

Open a story from Library, then choose **Read**.

- **TOC** opens chapter navigation.
- **Reader** opens reader-only settings: font, size, line height, width, margins, alignment and theme.
- **Find** searches the current chapter.
- **Bookmark** bookmarks the current chapter.
- **Fullscreen** uses the browser fullscreen API when supported.
- **Previous / Next** moves between chapters.
- **Edit manuscript** opens the editor.

Reader settings are stored per story and do not change Aurora's application typography.

## Editor

Open a story from Library, then choose **Edit manuscript**.

- Chapters and scenes are shown in the sidebar.
- **New chapter** creates a chapter with Scene 1.
- **＋ Scene** adds another scene to the current chapter.
- Chapters and scenes can be renamed.
- Chapters/scenes can be deleted with an in-editor confirmation; the last chapter and last scene are protected.
- The writing surface is a real `contenteditable` manuscript editor.
- Formatting: bold, italic, underline, font, size, text color, highlight, lists, headings and alignment.
- Links use an inline URL panel; no browser prompt/alert is used.
- Images can be inserted from the device.
- Find/replace is available in the editor.
- Undo/redo and normal copy/paste work through the browser editing surface.
- Changes autosave locally and can also be explicitly saved.

## Testing checkpoint before AI

1. Create a test novel.
2. Open **Edit manuscript**.
3. Rename Chapter 1 and Scene 1.
4. Write several paragraphs.
5. Apply formatting and insert an image if desired.
6. Add a second scene and second chapter.
7. Switch between scenes and confirm text persists.
8. Open **Read** and confirm the chapter text is displayed.
9. Change reader font/size/theme and confirm only the reader changes.
10. Use TOC, Find, Bookmark and Previous/Next.
11. Return to the editor and confirm the manuscript remains intact.

After this checkpoint, freeze the Reader/Editor UI unless a real bug is found. The next major step is the AI context compiler and controlled Story Brain test.
