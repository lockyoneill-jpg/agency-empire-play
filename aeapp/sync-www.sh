#!/bin/bash
# Copy the playable site into the Capacitor web dir. The app loads these files
# from the bundle. There is no server.url.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$(cd "$(dirname "$0")" && pwd)/www"
rm -rf "$DEST"
mkdir -p "$DEST/fonts" "$DEST/icons"
cp "$ROOT/index.html" "$ROOT/native.js" "$ROOT/sw.js" "$ROOT/three.min.js" \
  "$ROOT/manifest.webmanifest" "$ROOT/privacy.html" "$ROOT/support.html" "$DEST/"
cp "$ROOT/fonts/"*.woff2 "$DEST/fonts/"
cp "$ROOT/icons/"*.png "$DEST/icons/"
echo "Bundled the game into $DEST"
