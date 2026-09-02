# AURORA — NEW CHAT CONTINUATION PROMPT

You are continuing an ongoing software project named Aurora.

Aurora is a private-first, mobile-first novel/comic PWA. Do NOT reconstruct the project from memory and do NOT invent implementation status.

Before proposing or editing anything, read these files from the attached Aurora package:
1. Aurora_Master_Blueprint.md
2. Aurora_Build_Ledger.md
3. AURORA_CURRENT_STATE.md
4. AURORA_PROJECT_HISTORY_AND_CONTINUITY.md
5. Aurora_Development_Operating_Procedure.md
6. Aurora_New_Chat_Continuation_Protocol.md
7. AURORA_AI_STATE.md

Then inspect the actual current runtime source (`index.html`) before making implementation claims.

Your first response must be a concise continuation check in exactly this structure:

CURRENT BASE:
LAST VERIFIED CHECKPOINT:
LAST VERIFIED AI TEST:
WORKING:
UNRESOLVED:
CURRENT CANDIDATE: v0.9.33 candidate — Legacy Writing Assist restored as protected default + dedicated instruction page + experimental custom Cores

ACTUAL RUNTIME FILE:
NEXT ACCEPTANCE TEST:
FILES NEEDED:

Important product principles:
- The user wants a beautiful, very simple UI. Advanced complexity must stay hidden unless requested.
- The user is intentionally lazy: automate Brain bookkeeping whenever it is safe.
- Do not force the user to manually build prompts.
- Story Brain must distinguish current, past, future, hidden, idea, rejected, and established information.
- A character is one entity with a state timeline; do not duplicate characters for every state change.
- Hidden/future knowledge may be used by the AI for plotting, but must not leak into character knowledge before reveal.
- AI-generated prose is a candidate until accepted.
- AI-generated facts are not automatically permanent canon.
- Existing canon must not be silently overwritten.
- Arcs contain phases/events; completed arcs keep consequences.
- Story tags support multiple selected tags with AND/OR behavior.
- Reader and editor are separate real surfaces; mobile scrolling must remain responsive.
- NanoGPT provider logic must remain isolated from story logic.
- The actual runtime in the current integrated prototype is `index.html`; do not assume `app.js` is executable unless you verify it.
- Never claim a fix was tested when it was only edited.
- For every implementation, update the Build Ledger and provide exact Android test steps.
- Prefer fixing root causes over layering workarounds.
- Do not make large changes while a previous acceptance test is failing.

Current AI architecture:
Application rules
→ writing rules
→ user taste
→ author/style
→ story rules
→ relevant Brain
→ current states
→ timeline/events
→ memory
→ arc/phase/current position
→ scene
→ recent manuscript
→ user direction
→ generation task
→ NanoGPT

Current known weakness:
The Brain dependency test proved context injection is real, but hidden/future knowledge boundaries are not yet sufficiently strict for production.

Current desired next engineering work:
Strengthen Brain retrieval and knowledge filtering:
1. character-specific knowledge;
2. reveal conditions;
3. future-state gating;
4. arc/phase progressive disclosure;
5. provenance of AI-inferred facts;
6. current/past/future state handling across all entity types.

Do not silently replace the project roadmap with a new one. Treat the attached documents as the authoritative record.
