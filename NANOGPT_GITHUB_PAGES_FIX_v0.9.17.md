# Aurora v0.9.17 — NanoGPT GitHub Pages Fix

## What changed

1. **Added NanoGPT OAuth PKCE sign-in**
   - Settings now has **Sign in with NanoGPT**.
   - Aurora uses NanoGPT's browser/public-client OAuth shortcut.
   - The callback is the exact HTTPS GitHub Pages origin/path currently running Aurora.
   - The returned app-specific key is stored locally and then tested automatically.

2. **Rebuilt request timeout handling**
   - Uses `AbortController` instead of only racing a promise.
   - Every NanoGPT request has a hard deadline.
   - A failed CORS/network request cannot leave the UI permanently stuck on `Testing…`.

3. **Removed the public Jina relay from NanoGPT catalog requests**
   - Aurora no longer sends NanoGPT catalog URLs through a third-party relay.
   - If the direct catalog cannot be reached, Aurora reports the failure and uses the built-in starter model list.

4. **Removed duplicate NanoGPT error handling**
   - There is now one authoritative `nanoErrorText()`.

5. **Improved 401/403 diagnostics**
   - HTTP 401 explains invalid/revoked credentials.
   - HTTP 403 explains the browser-origin restriction and points to OAuth.

## How to test

1. Replace the hosted `index.html` with this build.
2. Open the GitHub Pages Aurora site.
3. Open **More → Settings → NanoGPT**.
4. Press **Sign in with NanoGPT**.
5. Approve Aurora in NanoGPT.
6. You should return to Aurora automatically.
7. Aurora will test the connection automatically.
8. Then press **Load Text Models** and **Load Image Models**.

## Important

Do not paste an API key into the GitHub repository or commit it into source code. Aurora stores the credential only in the browser's local storage after the user connects.
