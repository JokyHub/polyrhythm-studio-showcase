#!/usr/bin/env bash
# Install render dependencies in a fresh cloud sandbox (Linux). Idempotent.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --silent
if [ -z "${CHROME_PATH:-}" ] && ! command -v google-chrome >/dev/null && ! command -v chromium >/dev/null; then
  npx --yes @puppeteer/browsers install chrome-headless-shell@stable --path "$HOME/.cache/wlj-chrome" >/tmp/chrome.txt
  CHROME=$(grep -o '/[^ ]*chrome-headless-shell$' /tmp/chrome.txt | tail -1)
  # Shared libraries chrome-headless-shell needs on minimal images (no-op when present).
  if ldd "$CHROME" 2>/dev/null | grep -q "not found"; then
    (sudo -n apt-get update -qq && sudo -n apt-get install -y -qq libnss3 libatk-bridge2.0-0 libgbm1 libxkbcommon0 \
      libasound2 libxcomposite1 libxdamage1 libxrandr2 libpango-1.0-0 libcairo2 >/dev/null) || true
  fi
  echo "$CHROME" > .chrome-path
fi
echo "render deps ready"