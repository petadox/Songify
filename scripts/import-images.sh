#!/usr/bin/env bash
# Build the web assets from the print-resolution posters.
#
# Usage:  ./scripts/import-images.sh "/path/to/Eon_con_sangrado_12px_FULL 2"
#
# For each song this writes two files into public/songs/<nn>/:
#   cover.jpg  the full poster, shown only after the player resolves
#   blur.jpg   the obscured teaser, shown until then
#
# Why the teaser is pre-generated instead of a CSS filter: these posters have
# the song title printed on them in large type, and blur alone does not defeat
# it — at a blur strong enough to make the lettering unreadable the whole
# poster collapses into a black rectangle. So instead we crop to a text-free
# region of the artwork and blur that. The clean poster is never sent to the
# browser until the reveal.
#
# Source files are "<n>_<Title>.PNG"; the number-only files are the physical
# card backs and are skipped.

set -euo pipefail

SRC="${1:?usage: import-images.sh <source-folder>}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/songs"

# Crop window into the 647x900 working image, as w:h:x:y. The posters follow a
# template — artist and title on top, artwork below — so one window fits most
# of them. The exceptions get their own entry.
DEFAULT_CROP="257:358:195:452"
crop_for() {
  case "$1" in
    12) echo "280:390:183:140" ;;  # title sits at the BOTTOM; artwork is centred
    24) echo "201:280:223:530" ;;  # tall four-line title; artwork only at the foot
     *) echo "$DEFAULT_CROP" ;;
  esac
}

SIGMA=12

shopt -s nullglob
count=0

for file in "$SRC"/[0-9]*_*.PNG "$SRC"/[0-9]*_*.png; do
  name="$(basename "$file")"
  num="${name%%_*}"
  printf -v padded '%02d' "$num"
  out="$DEST/$padded"
  mkdir -p "$out"

  # Clean poster, shown on reveal.
  ffmpeg -y -loglevel error -i "$file" \
    -vf "scale=-1:900" -q:v 4 "$out/cover.jpg"

  # Obscured teaser: crop away the type, blur what's left, lift the exposure
  # a little so the very dark posters don't read as a black rectangle.
  ffmpeg -y -loglevel error -i "$out/cover.jpg" \
    -vf "crop=$(crop_for "$num"),gblur=sigma=$SIGMA,eq=brightness=0.10:saturation=1.25,scale=420:584" \
    -q:v 6 "$out/blur.jpg"

  echo "  $name -> songs/$padded/{cover,blur}.jpg"
  count=$((count + 1))
done

echo "Imported $count posters into $DEST"
