# Delivery verification

Verified 2026-09-28 on Windows with full Chromium and a real WebGPU device.

## Published result

- [Live game](https://samuelasherrivello.github.io/babylon-lite-pixel-walker/)
- [Release v0.0.1](https://github.com/SamuelAsherRivello/babylon-lite-pixel-walker/releases/tag/v0.0.1)
- Release commit: `5eeea5711019ca0f89d59ca96fe00d270a2a5041`, containing implementation `a1cbecb25c6c536969d332e5e5acc00e244cc783`.
- [Successful release workflow](https://github.com/SamuelAsherRivello/babylon-lite-pixel-walker/actions/runs/36412107331)
- [Successful released-version Pages deployment](https://github.com/SamuelAsherRivello/babylon-lite-pixel-walker/actions/runs/36412177923)
- Public `version.txt` returned `version=0.0.1`; the rendered game displayed v0.0.1.

## Automated evidence

- `npm ci`: clean install, 0 reported vulnerabilities.
- `npm test`: 11 passing tests for materials, density, reactions, resolution across eight tiers, settled-sand wake-up, falling/settled stone blocks, collision, health/recovery, deterministic simulation, and the full collection route at every resolution.
- `npm run build`: successful Vite production build using pinned Babylon Lite 1.25.0.
- `npm run test:browser`: 6 passing local WebGPU/browser tests.
- The 6 local Chromium browser tests pass: WebGPU rendering/draw calls; walking/jumping/pouring/pause/reset; all resolution settings and optional FPS visibility; help and responsive portrait sizing; unsupported-GPU recovery; the full keyboard-only expedition and replay; simultaneous touch movement/pouring and cancellation; blur/recovery behavior.
- Desktop 1440 × 1000, phone 390 × 844, small phone 320 × 568, and landscape 844 × 390 frame geometry verified.
- Three accepted OpenSpec capabilities and the complete change validated strictly. Their requirement content was compared before archival; the completed change is archived at `openspec/changes/archive/2026-09-28-build-pixel-walker/`.
- Local main matched origin/main with no tracked or untracked changes after pulling the release commit. The final documentation-only archive commit is subsequently pushed and rechecked at handoff.

The README screenshot was captured from the public release and visually inspected. The game was also opened and visually verified in the in-app browser. Browser tests drive real keys and pointers; the game exposes only a read-only diagnostic snapshot, not a teleport/control API.

## Scope and limitations

WebGPU support and a usable graphics device are required. There is deliberately no WebGL fallback. Browser tests exercise Chromium; hardware performance and other browser families are not certified. Fine particles require more CPU time. Resolution changes reset the expedition. Portrait mode preserves the whole screen in landscape too, making controls smaller on short displays. No account, server, persistence, telemetry, or multiplayer is included.

Imported skill sources are retained verbatim. One upstream skill contains a trailing blank line, so application whitespace validation excludes imported `.agents/skills/`; project code and documentation pass `git diff --check`.
