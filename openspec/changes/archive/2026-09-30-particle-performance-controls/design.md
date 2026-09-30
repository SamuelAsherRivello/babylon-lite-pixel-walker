# Design

## Context

See proposal.md for motivation. The material world is a typed-array grid updated independently of Babylon Lite rendering. Resolution presets are expressed as grid widths against fixed logical level coordinates. The UI already samples frame cadence for diagnostics.

## Goals / Non-Goals

**Goals:** Allow performance exploration with five additional resolution tiers, avoid repeated movement work for settled sand while preserving reactions, and expose FPS on demand.

**Non-Goals:** Change rendering technology, world aspect ratio, or player controls; promise real-time simulation speed at the maximum tier.

## Decisions

- Extend `PRESETS` with widths 360, 450, 540, 630, and 720. This provides five consistent 90-cell increments above the current fine tier while maintaining the existing 16:9 height-to-width ratio.
- Track settled sand separately from material and lifetime arrays. When a cell is vacated, wake nearby settled grains; skip settled grains in the main scan. Reset the marker when painting/replacing cells.
- Keep built-in stone geometry fixed. Track poured stone cells separately from terrain and simulate them as small rigid grid blocks that fall together, then mark them settled when supported. Render the block shape from the poured-stone state while keeping stone cells solid to player and other materials.
- Put the FPS readout in the lower-right footer before the version and add a Settings checkbox, enabled by default, to toggle its visibility. Preserve the preference in local storage when available.
- Retain the fixed-step loop and let the higher grids reveal CPU limits naturally; include a maximum-tier performance note in Settings.

## Risks / Trade-offs

- Resolution 720 creates a 720 × 1280 grid, which may be slow or memory-intensive on some devices → label tiers by dimensions and warn that higher levels run slower.
- Wake propagation may do extra work around active material → limit waking to nearby cells whose state change affects sand support or lateral movement.
- Stone block interaction with irregular terrain may snag → keep block movement to tested discrete grid steps and settle on solid support.
- Storage may be unavailable in private contexts → use a safe default and keep the checkbox functional for the current session.
