#!/usr/bin/env bash
# Copy the full-length originals into the web assets.
#
# Usage:  ./scripts/import-full.sh ~/Desktop/Songs
#
# Expects a flat folder of complete tracks named <n>_<Name>.mp3 — the same
# numbering the posters and clips use:
#   <source>/2_Levels.mp3  ->  public/songs/02/full.mp3
#
# The leading number is what ties a track to its poster; the rest of the
# filename is ignored. Unlike the 5s clips these are ~3.5MB each, so they're
# only fetched when the player asks for the full song after a reveal.
#
# Re-run with a single song to replace just that one:
#   ./scripts/import-full.sh ~/Desktop/Songs 14

set -euo pipefail

SRC="${1:?usage: import-full.sh <songs-folder> [song-number]}"
ONLY="${2:-}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/songs"

shopt -s nullglob
count=0

for file in "$SRC"/[0-9]*.mp3; do
  name="$(basename "$file")"
  num="${name%%_*}"
  num="${num%.mp3}"

  [[ -n "$ONLY" && "$num" != "$ONLY" ]] && continue

  printf -v padded '%02d' "$num"
  mkdir -p "$DEST/$padded"
  cp "$file" "$DEST/$padded/full.mp3"
  count=$((count + 1))
done

echo "Copied $count tracks into $DEST"

# Flag any song that still has no full track, so a missing number shows up here
# rather than as a dead button in the game.
for dir in "$DEST"/*/; do
  [[ -f "$dir/full.mp3" ]] || echo "  ! song $(basename "$dir") has no full.mp3" >&2
done
