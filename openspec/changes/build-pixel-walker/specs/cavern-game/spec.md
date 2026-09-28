# Cavern Game

## Purpose

Give material experiments a playable character and a forgiving single-screen collection objective.

## ADDED Requirements

### Requirement: Keyboard and virtual movement
The player SHALL move left/right with A/D and arrow keys, jump or swim up with W/Up/Space, and descend in liquid with S/Down. A visible virtual directional controller and jump button SHALL support concurrent touches including a separate pouring finger. Release/cancel/blur SHALL clear input. The camera SHALL remain stationary.

#### Scenario: Walking and jumping
- **WHEN** the player holds right then presses jump
- **THEN** the character travels right, rises, and lands on solid terrain without tunneling

#### Scenario: Simultaneous touch input
- **WHEN** one touch holds a direction and another pours sand
- **THEN** both independent actions continue until their respective touches end

### Requirement: Collision and recovery
The player SHALL collide with terrain and settled sand, swim in liquid, lose health near fire, and automatically recover at a safe spawn after health reaches zero. A visible recovery action SHALL also rescue a buried player without requiring a page reload.

#### Scenario: Fire damage
- **WHEN** the player remains inside fire
- **THEN** health decreases and eventual respawn restores health and a clear spawn region

### Requirement: Complete objective loop
The game SHALL show three collectible lantern seeds, their collected count, and a return portal. Collecting all three and reaching the portal SHALL display a success state with replay and continued sandbox play available.

#### Scenario: Finish the expedition
- **WHEN** the explorer collects every seed and returns to the portal
- **THEN** the game announces completion exactly once and offers replay

#### Scenario: Replay
- **WHEN** the player chooses replay
- **THEN** the original level, uncollected seeds, healthy player, and inactive completion state return
