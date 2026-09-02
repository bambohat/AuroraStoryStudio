# Phase 14 — NanoGPT Settings Test (v0.9.15)

## Test order
1. Open More → Settings.
2. Set API access to ASK.
3. Enter the NanoGPT endpoint and API key.
4. Tap Test Connection. The Connection card must remain `Connected · NanoGPT authentication works.` after the request finishes.
5. Tap Load Text Models. The Text models status must report the number returned and the dropdown must populate.
6. If a desired text model is missing, paste its exact model ID into Manual text model ID and tap Use Manual Text Model.
7. Tap Load Image Models. The Image models status must report the number returned and the dropdown must populate.
8. If a desired image model is missing, paste its exact model ID into Manual image model ID and tap Use Manual Image Model.
9. Save & Close, reopen Settings, and verify the selected models remain.

## Expected behavior
- Test Connection and catalog loading are separate operations.
- Loading a catalog must not erase a manually selected model.
- Manual model IDs are accepted even if the catalog does not list them.
- The API key is never written into source code; it remains local browser storage/settings.
- This checkpoint does not yet claim full Story Brain → NanoGPT generation wiring.


## v0.9.15 API transport fix
NanoGPT model catalogs are loaded without an API-key header because NanoGPT documents GET /api/v1/models as public/optional-auth and GET /api/v1/image-models without authentication. Authenticated requests remain required for generation and key validation. This separation helps local content:// Android pages avoid unnecessary CORS preflight on catalog loading.
