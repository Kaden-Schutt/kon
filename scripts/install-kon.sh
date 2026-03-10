#!/bin/sh
set -e
REPO="Kaden-Schutt/kon"
BIN="kon-linux-x64"
URL="https://github.com/$REPO/releases/latest/download/$BIN"
TMP=$(mktemp)
echo "Downloading kon..."
curl -fsSL "$URL" -o "$TMP"
chmod +x "$TMP"
if [ -w /usr/local/bin ]; then
  mv "$TMP" /usr/local/bin/kon
else
  sudo mv "$TMP" /usr/local/bin/kon
fi
echo "kon installed to /usr/local/bin/kon"
kon --version
