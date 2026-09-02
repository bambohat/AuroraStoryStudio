# Aurora — PWA / GitHub Pages Deployment
Version: v0.9.37
Date: 2026-09-03
Status: Candidate; pending manual Android installation verification

## Purpose
Aurora is now packaged for HTTPS hosting and installation as a Progressive Web App, with GitHub Pages as the primary static-host target.

## Runtime
- Executable: `index.html`
- Web App Manifest: `manifest.webmanifest`
- Service Worker: `sw.js`
- Icons: all icon files are in the same project root as `index.html`

## Single-folder GitHub Pages layout
Every deployable file in this package is intentionally at the repository root. There is no `icons/` subfolder and no required asset directory. This avoids path mistakes when uploading the package contents to a GitHub Pages repository. The manifest, `index.html`, and service worker all reference the icon files directly from the root (`./icon-192.png`, `./icon-512.png`, etc.).

## GitHub Pages safety
The manifest uses relative `start_url` and `scope` (`./`) rather than a domain-root path. This keeps the PWA compatible with repository/project Pages deployments that live below the domain root.

The service worker is also registered with the relative path `./sw.js` and scope `./`.

## Offline behavior
The service worker caches the small application shell and icon assets. HTML/navigation requests are network-first so a new GitHub Pages deployment can be picked up when online; cached `index.html` is used as a fallback when offline.

Cross-origin NanoGPT/API requests are intentionally not intercepted by the service worker. The provider transport remains unchanged.

## Local attachment testing
Aurora is often opened from `content://` or `file://` when testing an exported HTML file on Android. The service worker is intentionally not registered on those schemes because service workers require a secure context (HTTPS, or localhost/loopback during development). The application itself remains fully usable without the PWA layer in that environment.

## Installation requirements
For browser-promoted installation, serve Aurora over HTTPS (GitHub Pages satisfies this) and keep the manifest reachable. Chromium-based browsers expect the PWA manifest to provide a name/short name, 192px and 512px icons, a start URL, and a standalone-capable display mode.

## Icon set
- `icon-192.png`: required Android/PWA size
- `icon-512.png`: required large PWA size
- `icon-512-maskable.png`: Android maskable icon
- `icon-180.png`: Apple touch icon
- `icon-32.png` / `favicon.png`: browser/favicon use

## Manual Android acceptance test
1. Push the complete package contents to the GitHub Pages repository root.
2. Open the HTTPS GitHub Pages URL in Chrome for Android.
3. Confirm Aurora loads normally and the bottom navigation remains usable.
4. Open Chrome's install/add-to-home-screen flow and confirm the Aurora name and icon are shown.
5. Install Aurora and launch it from the home screen.
6. Confirm the installed app opens in standalone mode without the normal browser chrome.
7. Turn off the network and relaunch to verify the cached shell opens.
8. Turn the network back on and reload; confirm the latest deployment can update the cached `index.html`.
9. With network restored, test the existing NanoGPT configuration and confirm provider requests still work normally.
10. Confirm localStorage-based stories, Brain data, settings, and Writing Instructions remain intact through installation/relaunch.
