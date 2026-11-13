#!/usr/bin/env bash
# Builds the Android app. Usage: scripts/build-apk.sh debug|release [version]
# Output: releases/edh-hub-<version>.apk (release) or releases/edh-hub-<version>-debug.apk
set -euo pipefail
cd "$(dirname "$0")/.."

type="${1:-debug}"
version="${2:-$(node -p "require('./package.json').version")}"

# Gradle 8.14 needs JDK 17–21; CI provides JAVA_HOME, locally fall back to mise.
export JAVA_HOME="${JAVA_HOME:-$(mise where java@temurin-21)}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"

npm run build
npx cap sync android

task="assemble${type^}"
(cd android && ./gradlew "$task" -PappVersion="$version" -q)

mkdir -p releases
suffix=$([ "$type" = release ] && echo "" || echo "-debug")
cp "android/app/build/outputs/apk/$type/app-$type.apk" "releases/edh-hub-$version$suffix.apk"
echo "releases/edh-hub-$version$suffix.apk"
