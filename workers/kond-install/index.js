const REPO = "Kaden-Schutt/kon";

const SCRIPT = `#!/bin/sh
set -e
REPO="${REPO}"
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH" && exit 1 ;;
esac
BIN="kond-\${OS}-\${ARCH}"
URL="https://github.com/$REPO/releases/latest/download/\$BIN"
DEST="/usr/local/bin/kond"
echo "Downloading kond for \${OS}-\${ARCH}..."
curl -fsSL "$URL" -o "\$DEST"
chmod +x "\$DEST"
echo "kond installed to \$DEST"
kond --version
`;

export default {
  fetch() {
    return new Response(SCRIPT, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
