# Aurora v0.9.20 — NanoGPT connection architecture fix

## Root cause fixed
The previous builds had two independent asynchronous operations: a connection test and a model catalogue loader. One could remain busy while the other successfully loaded hundreds of models, leaving the UI showing "Connecting…" while the selector still appeared empty. The previous source also had its real runtime logic inline in `index.html`; editing the separate `app.js` did not change the code actually executed by Aurora.

## v0.9.20 design
- One authoritative connection action: `Connect & Load Models`.
- The documented NanoGPT `/api/v1/models?detailed=true` response both proves API access and populates the text-model selector.
- No separate background connection request.
- Busy flags are transient and are never persisted.
- Direct NanoGPT request is attempted first; compatibility relay is only a fallback when the browser cannot complete the direct request.
- Successful model retrieval immediately sets connection state to Connected and writes the live models into the same settings object used by the selector.
- A failed request always clears both busy flags in `finally`.
- OAuth UI and the previous balance-check connection flow are removed.
