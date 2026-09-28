# Proposal

## Why

Pixel Walker makes falling-sand experiments tangible by putting a small explorer inside them. A complete, single-screen browser game should let players reshape a cavern with materials and immediately walk through the results.

## What Changes

- Adapt the supplied repository template into `pixel-walker/`, titled **Pixel Walker**.
- Render an original 9:16 cavern in Babylon Lite/WebGPU with illustrated desktop gutters and stone borders.
- Add sand, water, oil, fire, stone, and erase tools with press-and-drag pouring, brush size, pause, reset, and coarse/balanced/fine simulation grids.
- Add keyboard and multitouch movement, jumping/swimming, terrain collision, fire damage, recovery, three collectible lantern seeds, and a portal victory/replay loop. Free experimentation continues after winning.
- Document controls and performance tradeoffs, handle unavailable WebGPU explicitly, test physics and browser behavior, deploy Pages, and publish a verified release.

## Capabilities

### New Capabilities

- `particle-world`: Material pouring, physical interactions, simulation timing, resolution changes, and reset.
- `cavern-game`: Player control, collision, health, collectible/portal goal, recovery, and replay.
- `browser-presentation`: Babylon Lite/WebGPU rendering, portrait layout, original art, accessible controls, failure handling, and delivery.

### Modified Capabilities

None; the template has no accepted game specifications.

## Impact

Application source/assets/tests, root npm/Vite configuration, README and template guidance, OpenSpec artifacts, existing Pages and release workflows, and a new public GitHub repository. The reference supplies layout inspiration only; Noita supplies the idea of interacting simulated pixels, not assets or source. Defaults selected under the user's no-questions authorization: an alchemist cavern theme, forgiving health/recovery, optional objective plus sandbox play, and explicit WebGPU requirement without a different rendering engine.
