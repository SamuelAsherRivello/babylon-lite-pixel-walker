# Design

## Context

The template provides Vite/React, a four-corner shell, OpenSpec 1.13.1, version.txt, and release/deploy workflows. The inspected reference uses `@babylonjs/lite` 1.25 with `createEngine`, sprite layers, and a CSS 9:16 frame. See proposal.md for motivation. The library's imported skills retain upstream metadata, including 1.11-generated variants; do not falsely rewrite their versions.

## Goals / Non-Goals

**Goals:** Keep rendering, deterministic simulation, input, and interface independent; use bounded memory and fixed-time simulation; test physics without a GPU; make shipping assets self-contained.

**Non-Goals:** No multiplayer, scrolling map, procedural campaign, full Noita recreation, server, analytics, or physics middleware. Simulation uses CPU cells; WebGPU handles rendering through the requested engine.

## Decisions

1. **Babylon Lite rendering:** Use its WebGPU engine and sprite renderer with nearest sampling. Composite original procedural pixel artwork and cell colors into a low-resolution texture, updated through the engine's GPU device. This batches the world efficiently instead of one mesh or DOM element per grain. Package type declarations/source will establish the exact upload interface before implementation.
2. **Particle grid:** Store material and lifetime in typed arrays. Alternate scan direction and mark moved cells to prevent multiple updates per tick. Use a seeded PRNG for reproducible checks. Coarse/balanced/fine widths are 90/180/270 with a fixed 9:16 ratio; coordinate conversion uses fixed logical units so player motion and level proportions stay consistent. Reset on resolution change avoids ambiguous mass resampling.
3. **Game physics:** Use axis-separated swept movement on the same grid with fixed substeps. Liquids alter gravity and movement; sand and stone provide support. A reachable authored platform route carries three seeds and a return portal. Respawn clears a protected pocket to prevent repeated entrapment.
4. **Browser shell:** Replace the template's tiny starter UI with a compact vanilla module shell, keeping title/links/settings/version corner roles. Use pointer capture and pointer IDs for each control; remove sticky input on blur, visibility loss, cancel, and lost capture. Accessible HTML overlays sit over the fixed portrait stage. Material UI does not pass events through to the world.
5. **Art:** Generate one original cavern-gutter image using the built-in image tool and save it inside the application. Draw original readable pixel terrain, character animation, seeds, portal, and decorations in the renderer; decorative stone rails use CSS/SVG. Store the art prompt and provenance in documentation.
6. **Delivery:** Keep Vite and npm at repo root; point Vite to pixel-walker and the Pages repository base. Use node:test plus real Chromium WebGPU browser checks, including touch, resizing, unsupported GPU, and a complete objective route. Extend the existing release workflow to install/build/test before bumping the single version.txt source, and explicitly redeploy the release because GITHUB_TOKEN pushes do not trigger normal push workflows.

## Risks / Trade-offs

- Fine grids cost more CPU time → explain presets, cap simulation catch-up, expose FPS, and default to balanced.
- WebGPU availability depends on browser/device → clear failure and retry UI; no silent alternative engine.
- Frame uploads cost bandwidth → small fixed render surface and one texture upload, not thousands of sprites.
- Player can bury the world → erase, reset, and rescue are always available.
- Generated gutter artwork is decorative → overlay contrast and keep game/controls self-contained on narrow screens.

## Migration Plan

Start with the template snapshot as one fresh Initial Commit. Adapt names, implement/test locally, commit and push to the newly created repository, enable Pages Actions, verify the deployment in a real browser, dispatch the established release workflow, deploy its resulting commit, and fast-forward local main. Roll back by deploying a previous known-good commit if needed; preserve Git history.
