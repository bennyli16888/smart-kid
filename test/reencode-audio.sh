#!/usr/bin/env bash
# Re-encode the delivered narration MP3s for size.
#
# The TTS masters are 48 kHz stereo-ish MP3s at 192 kbps. Spoken words for
# young learners do not need that: 24 kHz mono at 64 kbps is the same
# intelligibility (the app already decodes at 24 kHz in js/audio.js) and
# cuts the 915 files from ~41 MB to ~14 MB, so first playback and deploys
# get much faster. Duration is verified per file before replacing it.
#
# Usage: bash test/reencode-audio.sh
# Idempotent: files already at 64 kbps / 24 kHz are skipped.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

encode_one() {
  local src="$1"
  local rate bitrate duration new_duration tmp
  rate="$(ffprobe -v error -show_entries stream=sample_rate -of csv=p=0 "$src")"
  bitrate="$(ffprobe -v error -show_entries stream=bit_rate -of csv=p=0 "$src")"
  if [ "$rate" = "24000" ] && [ "${bitrate:-0}" -le 66000 ]; then
    echo "skip (already small): $src"
    return 0
  fi
  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")"
  tmp="$(mktemp "${src}.tmp.XXXXXX.mp3")"
  trap 'rm -f "$tmp"' RETURN
  ffmpeg -y -v error -i "$src" -ac 1 -ar 24000 -codec:a libmp3lame -b:a 64k "$tmp"
  new_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$tmp")"
  # MP3 frame padding can shift the reported duration slightly; 0.15 s is
  # well inside the app's silence-trimming margin (see js/audio.js).
  python3 - "$duration" "$new_duration" <<'PY'
import sys
if abs(float(sys.argv[1]) - float(sys.argv[2])) > 0.15:
    sys.exit(f"duration changed: {sys.argv[1]} -> {sys.argv[2]}")
PY
  ffmpeg -v error -i "$tmp" -f null -
  mv "$tmp" "$src"
  trap - RETURN
  echo "encoded: $src"
}
export -f encode_one

before_bytes="$(du -sb audio/voices | cut -f1)"
before_count="$(find audio/voices -name '*.mp3' | wc -l)"
find audio/voices -name '*.mp3' -print0 | sort -z | xargs -0 -P 4 -n 1 bash -c 'encode_one "$@"' _
after_bytes="$(du -sb audio/voices | cut -f1)"
after_count="$(find audio/voices -name '*.mp3' | wc -l)"
echo "files: $before_count -> $after_count"
python3 - "$before_bytes" "$after_bytes" <<'PY'
import sys
before, after = (int(v) for v in sys.argv[1:3])
print(f"audio size: {before/1e6:.1f} MB -> {after/1e6:.1f} MB "
      f"({100*(1-after/before):.0f}% smaller)")
PY
