# Aurora v0.9.18 — NanoGPT documented API rebuild

This build replaces the previous NanoGPT transport/OAuth integration.

## What changed

- Removed Aurora's NanoGPT OAuth UI and callback flow.
- Removed the editable API endpoint. Aurora now uses NanoGPT's documented base URL directly:
  `https://nano-gpt.com/api/v1`
- Text model discovery uses the documented public endpoint:
  `GET /api/v1/models?detailed=true`
- Image model discovery uses:
  `GET /api/v1/image-models?detailed=true`
- API-key validation uses NanoGPT's documented account-balance endpoint:
  `POST https://nano-gpt.com/api/check-balance`
  with `x-api-key`.
- Text generation uses:
  `POST https://nano-gpt.com/api/v1/chat/completions`
  with `Authorization: Bearer ...`.
- Image generation uses the documented OpenAI-compatible image route:
  `POST https://nano-gpt.com/v1/images/generations`
- Removed fake built-in model fallbacks. If the live catalog cannot be reached, Aurora reports the actual failure instead of pretending models were loaded.
- Every NanoGPT request now has a real AbortController timeout and always clears its busy state in `finally`.
- Public model discovery sends no API key at all.
- NanoGPT context memory, when enabled, is sent using the documented `memory: true` header.
- Pay-as-you-go override, when selected, is sent using `X-Billing-Mode: paygo`.

## UI behavior

There is no automatic connection test on page load or OAuth callback.

1. Paste the NanoGPT key.
2. Tap **Check API Key**.
3. Tap **Refresh Text Models**.
4. Choose a model.
5. Load image models separately when needed.

A failed request now ends with a visible error such as timeout, network failure, HTTP 401, HTTP 403, or HTTP 429 instead of leaving Aurora on `Testing...` indefinitely.

## Source basis

Implementation follows the current NanoGPT API documentation for Models, Chat Completion, Image Generation, and Check Balance.
