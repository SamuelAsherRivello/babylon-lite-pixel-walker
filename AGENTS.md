# Pixel Walker agent guidance

## Project
- Repository: SamuelAsherRivello/babylon-lite-pixel-walker. Display name: Pixel Walker.
- Run npm and Git commands at repository root. Application source, tests, art, and documentation live in `pixel-walker/`.
- Use `@babylonjs/lite` and WebGPU. The CPU material simulation is independent of rendering; do not replace the requested engine.
- Preserve a single 9:16 portrait frame and the stationary camera.
- Preserve template corner roles: upper-left title, upper-right links, lower-left settings, lower-right version.
- Keep assets self-contained and original. No copied Noita or Stealth & Steel artwork.

## Validation
- `npm ci`, `npm test`, `npm run build`.
- `npx playwright install chromium`, then `npm run test:browser` for full Chromium/WebGPU tests. Use the full Chromium channel, not the GPU-less headless shell on this Windows host.
- Check desktop and touch layouts and inspect current screenshots after visible changes.
- Tests may read `window.__pixelWalker.snapshot()`; this is read-only diagnostic state, not a control or teleport API.
- Temporary outputs belong in ignored `test-results/`; the canonical README image is `pixel-walker/documentation/screenshot01.png`.

## OpenSpec and imported skills
- Explore, propose, then apply substantial behavior changes. Main specs live in `openspec/specs/`.
- CLI 1.13.1 was verified. Run `openspec doctor --json` and `openspec validate --all --strict`.
- Shared skills were physically imported from the user's AI Skills Library at commit b4791422aea61fd98356346aed92cb4dfcb97190.
- Preserve upstream skill content/metadata; imported 1.11-generated skills coexist with template 1.13.1 skills.
- User instructions take precedence over skill guidelines. The initial request explicitly authorized implementation and release following exploration/proposal without another confirmation.

## Delivery
- Pages base is `/babylon-lite-pixel-walker/`.
- `version.txt` is the single release version source. The existing Release workflow bumps the patch version and tags/releases main.
- After Release completes, dispatch Deploy live demo on main to deploy the version commit. Bot pushes do not trigger the push workflow.
- Never publish project changes to the template or reference repository.
- Do not create a pull request unless the user explicitly requests one.
- Preserve unrelated changes and finish release work with a clean local main matching origin/main.
