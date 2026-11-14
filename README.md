# EDH Hub

[![Latest release](https://img.shields.io/github/v/release/Manwe-777/edh-hub)](https://github.com/Manwe-777/edh-hub/releases/latest)
[![Release and deploy](https://github.com/Manwe-777/edh-hub/actions/workflows/release.yml/badge.svg)](https://github.com/Manwe-777/edh-hub/actions/workflows/release.yml)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmanwe-777.github.io%2Fedh-hub%2F)](https://manwe-777.github.io/edh-hub/)

Life counter for Commander games, for 2 to 6 players around one phone. Tracks life, commander damage, poison and other counters, and the mana pool, with commander art from Scryfall.

- Android: download the APK from the [latest release](https://github.com/Manwe-777/edh-hub/releases/latest).
- Web and iPhone: open [manwe-777.github.io/edh-hub](https://manwe-777.github.io/edh-hub/). On iPhone, use Share → Add to Home Screen.

## Run

Requires Node.js 22.

```sh
npm install
npm run dev
```

Open http://localhost:5180. Add `?phone` to the address to see it at phone size on a computer.

## Test

```sh
npm test          # unit tests
npm run check     # types, lint, formatting and tests, as run on every push
```

`npm run lint:fix` and `npm run format` fix lint and formatting. In VS Code, install the recommended extensions and files are formatted on save.

To try it on a phone, run `npm run dev` and open the network address it prints from a phone on the same Wi-Fi.

## Build

Website:

```sh
npm run build
```

Android app (requires the Android SDK and Java 21):

```sh
npm run apk            # test build, installs over other test builds
npm run apk:release    # signed build, needs android/keystore.properties
```

The APK is written to `releases/`. Install it on a connected phone with `adb install -r releases/<file>.apk`.

Each push to `main` runs the checks, publishes the website, and creates a new release with the APK when the commits include a `feat:` or `fix:` change.
