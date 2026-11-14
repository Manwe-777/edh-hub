# EDH Hub — progress

Design doc: https://claude.ai/artifact/118v3WkPoY1TgFLYi3Uk8Z

## Run

- `npm run dev` → http://localhost:5180 (also on the LAN, so a phone on the same Wi-Fi can open it)
- Desktop preview in a phone frame: http://localhost:5180/?phone (or `?phone=360x780`)
- `npm run build` → `dist/` (PWA with offline service worker)

## Done

- [x] Vite + React + TS scaffold, mana-font bundled, vite-plugin-pwa (offline precache, Scryfall art runtime cache)
- [x] Layouts for 2–6 players, seats clockwise, each cell rotated to its table edge; center button at the junction
- [x] Life: tap halves ±1, hold ±10 with repeat; running change bubble
- [x] Counter bar: poison / experience (tap +1, hold −1), monarch / initiative (single holder), mana pool (tap toggle, hold reset)
- [x] Mana pool overlay: W U B R G C with + / − per color, grid shape picked to keep buttons as large as possible
- [x] Swipe up → table-wide commander damage view for that player; 1 or 2 commanders per source; damage moves life
- [x] Loss: life ≤ 0, poison ≥ 10, 21 from one commander → dimmed cell + rotating defeat lines (shuffle bag, no duplicates on screen)
- [x] Swipe down → player options (name, color, commander count, Scryfall art picker with artist credit, counters from fixed list)
- [x] Center menu: roll high (ties re-roll), undo (20 steps), reset, starting life, players, coin/d6/d20, keep awake, fullscreen
- [x] State saved synchronously on every change; reload restores everything; unreadable save backed up and a fresh game started
- [x] GitHub Pages deploy workflow (.github/workflows/deploy.yml)

## Visual pass (feedback 1)

- [x] Roboto (300/400/500, bundled), no text shadows or background vignettes
- [x] Plain cells use bright pastel colors with black text and icons; art cells get a flat dim and white text
- [x] Life change number sits beside the total, no background, larger
- [x] +/− halves cover the full cell height; press highlight fades out quickly (~160 ms)
- [x] Mana pool: WUBRG only, no "x"; full-cell shade slides down from the top and back up; only the mana icon stays tappable
- [x] Swipe panels: background fades to solid, rows slide in from alternating sides; damage controls slide in from the sides
- [x] Dead: no skull icon, no life total; art or color stays under a pulsing blood-red glow
- [x] Roll high: numbers flicker and slow down for ~2 s, then the winner gets a turning rainbow background

## Visual pass (feedback 2)

- Cell text and icons are white everywhere; palette moved to brighter mid-tones (old pastel/dark colors migrate).
- Mana pool pips and +/− buttons have no outlines.
- Menu and player options are full-screen upright panels: slide up with fade, X close top right, equal-size tiles, segmented controls, list rows with a switch, line icons, no borders.
- Reset is a single "Reset all" tile (undoable).
- Roll result shows only the number; the winner's number pulses.
- Optional commander damage tally (menu switch, off by default): a strip on each cell's right edge with one tile per opponent (partner commanders side by side, each square showing art or player color) and the damage taken from it (commanders with no damage are left out, and a cell with none shows no strip); tapping it opens that player's commander damage view.
- "Reset players" tile: every seat gets a fresh player (one commander, no art, distinct random colors, the menu's "Default counters" + mana) and the game resets. Default counters start as tax / storm / poison.
- Storm stays usable while the mana pool shade is open; the pool's +/− have no button background.

## Hosting and releases

- Repo: https://github.com/Manwe-777/edh-hub (public). Site: https://manwe-777.github.io/edh-hub/, deployed by `release.yml` after the release step on every push to `main`.
- `release.yml` runs semantic-release on every push to `main`: `feat:` / `fix:` commits create a version tag and a GitHub release with the signed APK (`edh-hub-<version>.apk`). The version lives in the tags (`package.json` stays at 0.1.0); builds read it from `APP_VERSION` or the latest tag and show it in the menu next to the GitHub link.
- CI signing secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`.
- Android `versionCode` = major*10000 + minor*100 + patch, passed as `-PappVersion`.
- Commit messages follow Conventional Commits and carry no assistant attribution trailers.
- Commander search only returns cards that can be a commander (Scryfall `is:commander`), best name match first, most played within each group.
- Partners get a second commander tax button (`tax2`) next to the first when tax is shown, marked 1 / 2.
- Pinned commanders (star): stored per device in `edh-hub/pinned-commanders`, untouched by resets; listed when the search box is empty, shown first with a filled star in results; the current commander has a star too.

## Android

- Capacitor 8 wrapper in `android/` (app id `com.manuh.edhhub`, portrait, full-screen with system bars hidden, dark launch screen, launcher icons from `public/icon.svg`).
- Keep awake uses a native `KeepAwake` plugin (window keep-screen-on flag) in the APK; the web build uses the Wake Lock API and its service worker.
- `npm run apk` / `npm run apk:release` run `scripts/build-apk.sh` (Gradle on JDK 21: `JAVA_HOME` if set, else mise's Temurin 21; JDK 27 is too new for Gradle 8.14).
- `npm run apk:release` builds the signed APK locally. The release key is `~/.android/edh-hub-release.jks`, with its passwords in `android/keystore.properties` (not committed). Back both up: updates only install over builds signed with the same key.
- Install: `adb install -r releases/edh-hub-<version>-debug.apk`. Debug builds are signed with this machine's debug key, so updates install over each other only when built here.

## Code cleanup

- ESLint (complexity limit 10, max depth 3, React hooks rules, sorted imports, blank lines around functions and multi-line statements) and Prettier with Tailwind class sorting. VS Code formats and fixes on save.
- TypeScript 6.0, the newest version typescript-eslint supports.
- `src/constants.ts` holds every constant, `src/types.ts` the shared types.
- One function per file in `game/`, `store/`, `pins/`, `scryfall/`, `hooks/` and `utils/`; one component per file in `components/common`, `icons`, `cell`, `menu` and `player`.
- Tailwind CSS v4: panels use utility classes; the table cells keep their component CSS in `@layer components`.
- Vitest: 93 behaviour tests (game rules, saving and undo, pins, Scryfall search, layout helpers, tap/hold/swipe, timed hooks). `npm run check` runs types, lint, formatting and tests; CI runs it on every push and pull request before releasing.
- Known issue: Undo restores the whole previous game, so a setting changed after the last undoable action (e.g. a name or a menu switch) is reverted too.

## Next

- [ ] Real-phone pass: hit-target sizes in 6-player cells, swipe feel, wake lock
- [x] Player options sheet uses two columns for sideways seats
- [ ] Capacitor wrapper + debug APK over adb (Android SDK found at ~/Android/Sdk)
