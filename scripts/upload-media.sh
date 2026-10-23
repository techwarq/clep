#!/usr/bin/env bash
# Upload the landing clips and posters in public/showcase to a Cloudflare R2 bucket.
# Usage: scripts/upload-media.sh <bucket>   (needs `npx wrangler login` first)
set -euo pipefail
BUCKET="${1:?usage: scripts/upload-media.sh <bucket>}"
cd "$(dirname "$0")/../public/showcase"
for f in *.mp4 *.jpg; do
  [ -e "$f" ] || continue
  case "$f" in *.mp4) type=video/mp4 ;; *) type=image/jpeg ;; esac
  echo "→ $f"
  npx --yes wrangler r2 object put "$BUCKET/$f" --file "$f" --remote \
    --content-type "$type" --cache-control "public, max-age=31536000, immutable"
done
