# Ethan: Skybound Quest

An original 2D browser platform adventure with 40 worlds across eight regions, with 40 environment scenes and 40 distinct boss designs.

## Upload to GitHub
1. Extract this ZIP.
2. Upload all extracted files and the assets folder to the root of your GitHub repository.
3. For GitHub Pages, open Settings > Pages, choose Deploy from a branch, then main and / (root). Save.
4. Open the website URL shown by GitHub Pages after deployment finishes.

## Vercel
Upload all extracted files and the entire assets folder to the repository root. The index.html, package.json, build.mjs and vercel.json files must be together.

In Vercel, import this repository and set Root Directory to the folder containing vercel.json (leave it empty if the files are at repository root). Framework: Other. Build Command: node build.mjs. Output Directory: dist. The included vercel.json supplies these settings automatically. Redeploy after uploading the updated files.

If the site still does not show, send the deployment URL and build error. A missing assets folder stops artwork from loading. Download and extract the ZIP before uploading; uploading the ZIP itself does not deploy the game.

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


## Quest Hub upgrade

The game includes a Quest Hub with a daily seeded challenge, three daily missions, claimable crystal rewards, a crystal bank, four unlockable hero looks, achievement milestones, region completion tracking and one-to-three-star world grades. The daily challenge uses a date-based seed so its route is stable for that calendar day.

Player name, progress, best results, crystals, missions, achievements and outfit unlocks are saved locally in the current browser. They do not yet sync between devices or appear on a global leaderboard. The website labels daily records as personal device records.

The production build checks the game and Quest Hub JavaScript syntax before publishing.


## Progression safeguards

- Each world independently keeps its highest crystal total, fastest completion time and best star grade.
- Every region has its own completion achievement; Guardian milestones are awarded at 5, 20 and 40 victories.
- Daily challenge completion builds a consecutive-day streak shown in the Quest Hub.
- Players can export a JSON save backup and restore it later in the same browser. Imported data is validated and normalised before it replaces the local save.
- Save data remains local to the browser. Export a backup before clearing browser data or switching devices.

## Install and play offline

Ethan Quest is installable as a Progressive Web App. After the first online visit, the service worker caches the game shell and original artwork so the game can load offline. The first cache may take a little time because the artwork is several megabytes. Daily challenge dates and progress are based on the device's local clock; global rankings and cross-device sync are not provided.


## Endgame modes

- **Boss Rush:** Clear the eight regional Guardian worlds in one run. Unlocks after five lifetime Guardian victories. Each Guardian clear restores one heart (up to three), and a complete run records the best time and awards bonus crystals.
- **Weekly Sky Trials:** A deterministic three-world route is generated from the Monday week key. Every player on the same week gets the same route for that browser-local week; each weekly clear records personal best time and crystal totals.
- **New Game+:** Unlock after completing all forty worlds in the current cycle. The next cycle resets only the current-cycle completion checklist and resume point; crystals, outfits, achievements and best world records remain. Enemy movement and Guardian health, speed and attack cadence increase with each cycle.
- Save exports use version 4. Version 3 backups remain importable and are normalised with safe defaults for the new endgame records.
