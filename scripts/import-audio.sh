#!/usr/bin/env bash
# Copy the generated 5s clips into the web assets.
#
# Usage:  ./scripts/import-audio.sh ~/Desktop/game
#
# Expects the layout produced by scratchpad_obfuscate.py:
#   <source>/distorted/<n>_<Name>.mp3
#   <source>/real/<n>_<Name>.mp3
#
# and writes them to public/songs/<nn>/{distorted,real}.mp3. The leading number
# is what ties a clip to its poster; the rest of the filename is ignored.
#
# Re-run with a single song to replace just that one, e.g. after regenerating a
# clip whose random 5 seconds turned out to be unguessable:
#   ./scripts/import-audio.sh ~/Desktop/game 14

set -euo pipefail

SRC="${1:?usage: import-audio.sh <game-folder> [song-number]}"
ONLY="${2:-}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/songs"

shopt -s nullglob
count=0

for kind in distorted real; do
  [[ -d "$SRC/$kind" ]] || { echo "missing $SRC/$kind" >&2; exit 1; }

  for file in "$SRC/$kind"/[0-9]*.mp3; do
    name="$(basename "$file")"
    num="${name%%_*}"
    num="${num%.mp3}"

    [[ -n "$ONLY" && "$num" != "$ONLY" ]] && continue

    printf -v padded '%02d' "$num"
    mkdir -p "$DEST/$padded"
    cp "$file" "$DEST/$padded/$kind.mp3"
    count=$((count + 1))
  done
done

echo "Copied $count clips into $DEST"

# Flag any song that ended up with only one of the two clips.
for dir in "$DEST"/*/; do
  n="$(basename "$dir")"
  for kind in distorted real; do
    [[ -f "$dir/$kind.mp3" ]] || echo "  ! song $n has no $kind.mp3" >&2
  done
done
