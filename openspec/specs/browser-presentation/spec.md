# Browser Presentation

## Purpose

Present a legible, original portrait game on desktop and touch browsers with dependable deployment.

## Requirements

### Requirement: Portrait presentation and art
The game SHALL retain a 9:16 portrait frame without world scrolling at desktop and mobile sizes. Original cavern gutter art and decorative borders SHALL surround it when space permits. Title, repository link, settings, and version SHALL retain the template's corner roles. Controls SHALL have accessible labels, keyboard focus indicators, and adequate touch targets.

#### Scenario: Desktop and phone
- **WHEN** the viewport changes from desktop landscape to phone portrait
- **THEN** the full frame remains visible, pointer coordinates remain aligned, and controls do not cause page overflow

### Requirement: WebGPU startup and recovery
The game SHALL actually render through WebGPU and display readiness only after initialization. Unavailable GPU support, startup failure, or device loss SHALL show a readable recovery message and retry action instead of a blank screen.

#### Scenario: Unsupported browser
- **WHEN** no usable WebGPU device is available
- **THEN** the user sees an explanation and browser/retry guidance, without a false playing state

### Requirement: Public delivery
The repository SHALL contain complete source, original assets, reproducible installation/build/test commands, a working Pages URL, and the existing automated release process adapted for Pixel Walker. Published release and demo SHALL contain the implemented game, and the final local main branch SHALL match the remote with a clean tracked working tree.

#### Scenario: Published demo
- **WHEN** a visitor opens the documented Pages URL on a supported browser
- **THEN** game assets load at the repository subpath and the player can move and pour materials
