const REPO = "Kaden-Schutt/kon";

const SCRIPT = `#!/bin/sh
set -e
REPO="${REPO}"
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "\$ARCH" in
  x86_64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: \$ARCH" && exit 1 ;;
esac
BIN="kond-\${OS}-\${ARCH}"
URL="https://github.com/$REPO/releases/latest/download/\$BIN"
TMP=\$(mktemp)
echo "Downloading kond for \${OS}-\${ARCH}..."
curl -fsSL "\$URL" -o "\$TMP"
chmod +x "\$TMP"
if [ -w /usr/local/bin ]; then
  mv "\$TMP" /usr/local/bin/kond
else
  echo "Installing to /usr/local/bin (requires sudo)..."
  sudo mv "\$TMP" /usr/local/bin/kond
fi
echo "kond installed to /usr/local/bin/kond"
kond --version
`;

export default {
  fetch() {
    return new Response(SCRIPT, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
