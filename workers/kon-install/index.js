const REPO = "Kaden-Schutt/kon";

const SCRIPT = `#!/bin/sh
set -e
REPO="${REPO}"
BIN="kon-linux-x64"
URL="https://github.com/$REPO/releases/latest/download/$BIN"
DEST="/usr/local/bin/kon"
echo "Downloading kon..."
curl -fsSL "$URL" -o "$DEST"
chmod +x "$DEST"
echo "kon installed to $DEST"
kon --version
`;

export default {
  fetch() {
    return new Response(SCRIPT, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
