# Particle World

## Purpose

Let players build and alter a live material simulation by pouring substances into a bounded cavern.

## ADDED Requirements

### Requirement: Continuous material tools
The game SHALL expose sand, water, oil, fire, stone, and erase tools in its top navigation and a brush-size control. Holding or dragging a pointer inside the world SHALL apply the selected material continuously; releasing, canceling, or losing focus SHALL stop pouring. UI input SHALL NOT pour into the world.

#### Scenario: Sand pour
- **WHEN** a player holds a pointer above a platform with Sand selected
- **THEN** grains fall and accumulate in a pile while the pointer remains held

#### Scenario: Input cancellation
- **WHEN** a pouring gesture is canceled or the window loses focus
- **THEN** no additional material is emitted

### Requirement: Material interactions
Sand SHALL settle and displace liquids, water SHALL flow below oil, oil SHALL ignite next to fire, and water SHALL quench nearby fire and produce rising steam. Fire, steam, and smoke SHALL have finite lifetimes. Solid cells SHALL constrain particles and the player.

#### Scenario: Oil ignition
- **WHEN** fire touches a pool of oil
- **THEN** adjacent oil ignites and the reaction propagates with visible flame and smoke

#### Scenario: Water suppression
- **WHEN** water touches flame
- **THEN** the contacted flame is extinguished and visible steam can rise

### Requirement: Resolution and simulation controls
The game SHALL provide three clearly labeled cell resolutions with a finer/slower tradeoff. Changing resolution SHALL start a fresh level with the same physical proportions and a visible explanation. Pause SHALL freeze simulation and movement; reset SHALL restore the initial world, health, and objective state. Background tabs SHALL pause without accumulating catch-up work.

#### Scenario: Resolution change
- **WHEN** the player selects Fine
- **THEN** the game displays more, smaller cells and restarts at the spawn point with a reset notice

#### Scenario: Pause
- **WHEN** the player pauses a falling pile
- **THEN** particle positions and character positions remain fixed until resumed
