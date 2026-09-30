# Proposal

## Why

Players need finer particle grids to explore Babylon Lite's practical performance ceiling, a visible but optional frame-rate indicator, and material behavior that stops spending work on grains that have come to rest.

## What Changes

- Add five progressively finer particle resolution levels above the existing three while preserving the portrait world proportions and reset-on-change behavior.
- Add a Settings checkbox that controls an FPS display in the lower-right corner beside the version.
- Settle blocked sand grains and wake them when nearby changes could let them move again.
- Make poured stone form larger falling blocks that become immobile after landing while preserving level terrain.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `particle-world`: extend resolution controls, make sand settle, make poured stone fall and settle, and expose optional FPS display.

## Impact

Updates the particle grid and material update loop in `pixel-walker/src/world.js`, settings and frame display in `pixel-walker/src/main.js` and `game.css`, and their unit and browser coverage.
