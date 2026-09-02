# Aurora v0.9.24 — NanoGPT request permission fix

Fixed the ASK permission modal lifecycle. Clicking Allow/Cancel now removes the modal directly before resolving the request promise, preventing a render race from recreating the popup. Success/failure also defensively removes any stale permission overlay.

The NanoGPT API request itself is unchanged from v0.9.23.
