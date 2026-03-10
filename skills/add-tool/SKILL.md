---
name: add-tool
description: Add a tool, MCP server, or integration to your kond server. Knows about popular integrations like agent-browser, Obsidian, GitHub, and more.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Add Tool to kond

You are helping the user add a tool or integration to their running kond server.

## How to add tools

There are three ways to add tools to kond:

**MCP servers** (proxied over REST):
```bash
kond mcp add <name> -- <command> [args...]
```

**CLI tools** (any command-line program):
```bash
kond wrap cli
# Or non-interactively by editing kon.config.json
```

**Scripts** (shell scripts, Python scripts, etc.):
```bash
kond wrap script
```

After adding, verify with `kond status` to confirm the tool is registered.

## Popular integrations

When the user asks to add one of these, use the exact commands below:

### agent-browser (web browsing for Claude)

[agent-browser](https://github.com/vercel-labs/agent-browser) gives Claude a headless browser it can control from your machine.

**Install:**
```bash
npm install -g agent-browser
agent-browser install
```

**Add to kond as a CLI tool** by editing `kon.config.json` — add this to the `tools` array:
```json
{
  "type": "cli",
  "name": "browser",
  "command": "agent-browser",
  "description": "Control a headless browser. Commands: open <url>, snapshot, click/fill/type <selector>, screenshot, get text/html/url/title, find role/text/label <query>, eval <js>, close. Use 'snapshot' after navigation to see the page as an accessibility tree with element refs.",
  "allowedSubcommands": ["open", "snapshot", "click", "fill", "type", "hover", "screenshot", "pdf", "get", "find", "wait", "eval", "close", "install"]
}
```

Then restart: `kond restart`

**Skill context** — if the user wants Claude (in code exec) to know how to use agent-browser effectively, the [agent-browser skill](https://github.com/vercel-labs/agent-browser) can be added to the kon skill file. Run `npx skills add vercel-labs/agent-browser` in the project to get the skill markdown.

### Obsidian (notes and knowledge base)

```bash
kond mcp add obsidian -- npx -y @mauricio.wolff/mcp-obsidian@latest ~/path/to/vault
```

Replace `~/path/to/vault` with the actual vault path. Find it with:
```bash
ls ~/Documents/ | grep -i vault  # common location
ls ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/  # iCloud sync
```

### GitHub

```bash
kond mcp add github -- npx -y @modelcontextprotocol/server-github
```

Requires a `GITHUB_TOKEN`. If the user has one:
```bash
kond mcp add github -- npx -y @modelcontextprotocol/server-github --env GITHUB_TOKEN=<token>
```

### Filesystem (additional paths)

```bash
kond mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /path/to/dir
```

Or edit the existing `read`/`write` builtin tool's `allowedPaths` in `kon.config.json`.

### Docker

```json
{
  "type": "cli",
  "name": "docker",
  "command": "docker",
  "description": "Docker container management",
  "allowedSubcommands": ["ps", "images", "logs", "inspect", "stats", "exec", "run", "stop", "start", "rm", "build", "pull", "push", "compose"]
}
```

### kubectl

```json
{
  "type": "cli",
  "name": "kubectl",
  "command": "kubectl",
  "description": "Kubernetes cluster management",
  "allowedSubcommands": ["get", "describe", "logs", "exec", "apply", "delete", "scale", "rollout", "port-forward", "top"]
}
```

### ffmpeg

```json
{
  "type": "cli",
  "name": "ffmpeg",
  "command": "ffmpeg",
  "description": "Audio/video processing and conversion"
}
```

### Import from Claude Desktop

If the user has MCP servers configured in Claude Desktop:
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq '.mcpServers'
```

Read the config, then add each server with `kond mcp add`.

## Workflow

1. Check the server is running: `kond status`
2. Identify what the user wants to add
3. Use the appropriate method above
4. Verify it was added: `kond status`
5. If the user is connected to kon, mention they may need to regenerate their skill file with `kond pair` for the new tool to appear in Claude's sandbox
