# Aurora — New Chat Continuation Protocol
Version: 0.1

## Purpose

Use this document when continuing the Aurora project in a new ChatGPT conversation after the previous conversation becomes too long.

## Required files

Attach these three project documents to the new conversation:

1. Aurora_Master_Blueprint.md
2. Aurora_Build_Ledger.md
3. Aurora_Development_Operating_Procedure.md

If there is a current Aurora source-code ZIP/repository snapshot, attach that too.

## Exact continuation prompt

You are continuing the Aurora private novel/comic PWA project.

Treat the attached Aurora documents as the authoritative project record.

Read all attached Aurora documents before proposing changes.

The Master Blueprint defines the complete product vision.
The Build Ledger defines what has actually been implemented, tested, failed, deferred, and completed.
The Development Operating Procedure defines how we must work.

Do NOT reconstruct the project from memory.
Do NOT assume an unfinished feature works.
Do NOT invent implementation status.
Do NOT silently change the architecture or product vision.

First determine:
1. Current phase.
2. Last completed Git checkpoint/version.
3. What is currently implemented.
4. What is currently broken.
5. What the next acceptance test is.
6. What files/code are currently relevant.

Then give me a concise CONTINUATION CHECK before editing anything:

CURRENT PHASE:
LAST VERIFIED CHECKPOINT:
WORKING:
BROKEN:
NEXT TASK:
FILES NEEDED:
TEST I WILL PERFORM:

Do not start a large implementation automatically.

If source code is attached, inspect the actual current code before making claims about implementation.

If source code is not attached, tell me exactly what code/files you need rather than guessing.

After every implementation:
- explain what changed;
- tell me exactly how to test it on Android;
- record any failure;
- update the Build Ledger;
- identify the next task.

If a design decision changes the overall product, update the Master Blueprint as well.

The goal is to preserve continuity across chats without relying on conversation memory.

## Recommended handoff before leaving an old chat

Before ending a major development session, create/update:

Aurora_Master_Blueprint.md
Aurora_Build_Ledger.md
Aurora_Development_Operating_Procedure.md

Also record:
- current version/checkpoint;
- exact current phase;
- files changed;
- known bugs;
- last successful test;
- next test;
- decisions made since the previous checkpoint.

## Critical rule

The three documents are the project's memory.

The conversation is only the working session.

When a new chat starts, the documents plus the current source code are the source of truth.
