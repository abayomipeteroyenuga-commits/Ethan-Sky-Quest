# Ethan: Skybound Quest

An original 2D browser platform adventure with 40 worlds across eight regions, with 40 environment scenes and 40 distinct boss designs.

## Upload to GitHub
1. Extract this ZIP.
2. Upload all extracted files and the assets folder to the root of your GitHub repository.
3. For GitHub Pages, open Settings > Pages, choose Deploy from a branch, then main and / (root). Save.
4. Open the website URL shown by GitHub Pages after deployment finishes.

## Vercel
Import the GitHub repository, choose Other as the framework, leave the build command empty, and use the repository root as the output directory. No server, API key, or package installation is required.

## Play locally
Serve this folder with a local static web server, for example: python -m http.server 8000
Then open http://localhost:8000.

## Controls
- Arrow keys or A/D: move
- Space, W, or up arrow: jump; press again in the air to double jump
- Shift: dash
- F: throw fireballs after collecting an ember blossom
- P or Escape: pause/resume
- Touch buttons: phone/tablet controls

## Gameplay
Hit rune blocks from underneath to release growth mushrooms, ember blossoms, or invincibility stars. Mushrooms enlarge Ethan; enlarged Ethan shrinks after an enemy hit. Big Ethan can break stone bricks. Stars protect Ethan from enemies for eight seconds of active play; falling still causes damage. Fireballs bounce and defeat enemies. Reach the sky cottage to finish each world. Every world has a Guardian. Bosses move up, down, left and right and fire aimed projectiles or spread shots. Defeat each Guardian to reach home. Stand on a tube and press Down or tap the down touch button to travel to its partner tube.

Music and sound start after a player interaction and can be muted. Music pauses with the game. Progress and unlocked worlds are saved in this browser on this device, without cloud synchronization. Power-ups carry into the next world in the same adventure; a fresh start begins with small Ethan.

## Environment update
Each world has its own bright, simple cartoon landscape with open skies and low distant hills, themed brick/block colours, tube styling and layout. Two usable tubes appear in every world. All forty bosses have distinct sprite designs, escalating health, movement patterns, and firing attacks.

## Contents
Static HTML, CSS, JavaScript, and original generated sprite artwork. No private hosting credentials or platform-specific project IDs are included.

## Validation
JavaScript syntax and game-logic checks passed for 40-world progression, boss gates, double jump, checkpoints, power-ups, growth/shrink, block rewards, fireballs, the 480-tick star timer, and music scheduling. Live browser playback has not been verified.
