#!/bin/sh
# Physics Lab - Mr. Mohamed Mahmoud (Linux)
DIR="$(cd "$(dirname "$0")" && pwd)"
F="$DIR/index.html"
for b in google-chrome chromium chromium-browser microsoft-edge; do
  if command -v "$b" >/dev/null 2>&1; then exec "$b" --app="file://$F"; fi
done
xdg-open "$F" 2>/dev/null || open "$F"
