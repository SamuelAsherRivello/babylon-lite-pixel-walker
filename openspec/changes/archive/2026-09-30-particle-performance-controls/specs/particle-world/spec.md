# Spec Delta

## MODIFIED Requirements

### Requirement: Material interactions
Sand SHALL settle and displace liquids, water SHALL flow below oil, oil SHALL ignite next to fire, and water SHALL quench nearby fire and produce rising steam. Fire, steam, and smoke SHALL have finite lifetimes. Solid cells SHALL constrain particles and the player. Grains at rest SHALL stop receiving full movement calculations until a nearby material change can make them mobile again. Poured stone SHALL form larger blocks that fall under gravity and become immobile when supported; built-in terrain SHALL remain fixed.

#### Scenario: Oil ignition
- **WHEN** fire touches a pool of oil
- **THEN** adjacent oil ignites and the reaction propagates with visible flame and smoke

#### Scenario: Water suppression
- **WHEN** water touches flame
- **THEN** the contacted flame is extinguished and visible steam can rise

#### Scenario: Settled sand wakes on disturbance
- **WHEN** a settled sand grain has a neighboring cell vacated or replaced
- **THEN** the grain resumes movement calculations and can fall or slide

#### Scenario: Poured stone falls and settles
- **WHEN** the player pours stone above an unsupported location
- **THEN** it falls as a visibly larger block and becomes immobile when it lands on solid support

#### Scenario: Level terrain remains fixed
- **WHEN** the material simulation advances
- **THEN** built-in platforms and boundaries remain in place

### Requirement: Resolution and simulation controls
The game SHALL provide eight clearly labeled cell resolutions with a finer/slower tradeoff, preserving the same physical proportions. Changing resolution SHALL start a fresh level with a visible explanation. A Settings checkbox SHALL control an FPS readout in the lower-right frame corner. Pause SHALL freeze simulation and movement; reset SHALL restore the initial world, health, and objective state. Background tabs SHALL pause without accumulating catch-up work.

#### Scenario: Resolution change
- **WHEN** the player selects a particle resolution
- **THEN** the game displays more or fewer cells at the selected detail, restarts at the spawn point, and shows a reset notice

#### Scenario: Highest resolution
- **WHEN** the player selects the highest particle resolution
- **THEN** the game creates the finest supported preset grid and communicates that simulation speed depends on device performance

#### Scenario: FPS visibility
- **WHEN** the player enables the FPS checkbox in Settings
- **THEN** the current FPS is shown in the lower-right corner beside the version

#### Scenario: FPS hidden
- **WHEN** the player disables the FPS checkbox
- **THEN** the FPS readout is hidden while the version remains visible

#### Scenario: Pause
- **WHEN** the player pauses a falling pile
- **THEN** particle positions and character positions remain fixed until resumed
