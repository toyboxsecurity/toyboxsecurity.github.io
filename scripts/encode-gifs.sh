#!/usr/bin/env bash
# Re-encode the legacy feature GIFs into MP4 (H.264) + WebM (VP9) for use as
# silent looping <video> elements in the feature grid (Issue 6).
#
# Requires: ffmpeg on PATH.
# Run from the repo root: ./scripts/encode-gifs.sh
#
# Why: the originals are 2–5MB GIFs each; combined that's 15–30MB of feature
# media on the homepage. Re-encoded MP4 + WebM is typically 10–30× smaller
# and gets us under the 2MB budget required by Issue 3.

set -euo pipefail

SRC_DIR="src/assets/feature-gifs-source"
OUT_DIR="public/videos"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found on PATH" >&2
  exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
  echo "error: source dir $SRC_DIR does not exist" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

shopt -s nullglob
gifs=("$SRC_DIR"/*.gif)
if [ ${#gifs[@]} -eq 0 ]; then
  echo "error: no .gif files found in $SRC_DIR" >&2
  exit 1
fi

for gif in "${gifs[@]}"; do
  name="$(basename "${gif%.gif}")"
  mp4_out="$OUT_DIR/${name}.mp4"
  webm_out="$OUT_DIR/${name}.webm"

  echo "→ encoding $name"

  # H.264 baseline, yuv420p for broad compatibility (including iOS Safari),
  # faststart so playback can begin before the file fully downloads.
  # The scale filter forces even dimensions, which yuv420p requires.
  ffmpeg -y -loglevel error \
    -i "$gif" \
    -movflags +faststart \
    -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -an \
    "$mp4_out"

  # VP9 / WebM as the modern fallback. CRF 34 is a good silent-loop sweet
  # spot — visually clean, smaller than MP4 for most short clips.
  # GIFs decode to gbrap (RGB+alpha); force yuv420p + even dimensions so VP9 accepts the input.
  ffmpeg -y -loglevel error \
    -i "$gif" \
    -c:v libvpx-vp9 \
    -crf 34 \
    -b:v 0 \
    -row-mt 1 \
    -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -an \
    "$webm_out"
done

echo ""
echo "done. output sizes:"
du -h "$OUT_DIR"/* | sort -h
