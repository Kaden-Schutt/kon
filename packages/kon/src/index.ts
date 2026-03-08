import { defineCommand, runMain } from "citty";
import { readConfig } from "../../cli/src/config.js";
import { connect } from "../../cli/src/connect.js";
import { pair } from "../../cli/src/pair.js";
import { createHttpClient } from "../../cli/src/http.js";
import { fetchTools, fetchToolDetail } from "../../cli/src/discover.js";
import { execTool, execMcpTool } from "../../cli/src/exec.js";
import { upload, download } from "../../cli/src/transfer.js";
import { formatToolList, formatToolDetail, formatStatus } from "../../cli/src/output.js";
import { VERSION } from "../../cli/src/version.js";

const KNOWN_COMMANDS = new Set([
  "pair", "connect", "list", "help", "status",
  "upload", "download", "version", "--help", "-h",
]);

// Intercept unknown commands as dynamic tool execution
const firstArg = process.argv[2];
if (firstArg && !firstArg.startsWith("-") && !KNOWN_COMMANDS.has(firstArg)) {
  const toolName = firstArg;
  const toolArgs = process.argv.slice(3);

  try {
    const { serverUrl, sessionToken } = await connect();
    const http = createHttpClient(serverUrl, sessionToken);

    const { tool: detail } = await fetchToolDetail(http, toolName);

    if (detail.type === "mcp") {
      const mcpToolName = toolArgs[0];
      if (!mcpToolName) {
        const toolNames = (detail.mcpTools ?? []).map(t => `  ${t.name} — ${t.description}`);
        console.log(`MCP tools for ${toolName}:\n${toolNames.join("\n")}`);
      } else {
        const jsonArg = toolArgs.slice(1).join(" ");
        const args = jsonArg ? JSON.parse(jsonArg) : {};
        await execMcpTool(http, toolName, mcpToolName, args);
      }
    } else {
      await execTool(http, toolName, toolArgs);
    }
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exitCode = 1;
  }
} else {
  runCitty();
}

function runCitty() {
  const pairCommand = defineCommand({
    meta: { name: "pair", description: "Pair with a gigai server" },
    args: {
      code: { type: "positional", description: "Pairing code", required: true },
      server: { type: "positional", description: "Server URL", required: true },
    },
    async run({ args }) {
      await pair(args.code, args.server);
    },
  });

  const connectCommand = defineCommand({
    meta: { name: "connect", description: "Establish a session with the server" },
    args: {
      name: { type: "positional", description: "Server name (optional)", required: false },
    },
    async run({ args }) {
      const { serverUrl } = await connect(args.name as string | undefined);
      console.log(`Connected to ${serverUrl}`);
    },
  });

  const listCommand = defineCommand({
    meta: { name: "list", description: "List available tools" },
    async run() {
      const { serverUrl, sessionToken } = await connect();
      const http = createHttpClient(serverUrl, sessionToken);
      const tools = await fetchTools(http);
      console.log(formatToolList(tools));
    },
  });

  const helpCommand = defineCommand({
    meta: { name: "help", description: "Show help for a tool" },
    args: {
      tool: { type: "positional", description: "Tool name", required: true },
    },
    async run({ args }) {
      const { serverUrl, sessionToken } = await connect();
      const http = createHttpClient(serverUrl, sessionToken);
      const { tool } = await fetchToolDetail(http, args.tool);
      console.log(formatToolDetail(tool));
    },
  });

  const statusCommand = defineCommand({
    meta: { name: "status", description: "Show connection status" },
    async run() {
      const config = await readConfig();
      console.log(formatStatus(config));
    },
  });

  const uploadCommand = defineCommand({
    meta: { name: "upload", description: "Upload a file to the server" },
    args: {
      file: { type: "positional", description: "File path", required: true },
    },
    async run({ args }) {
      const { serverUrl, sessionToken } = await connect();
      const http = createHttpClient(serverUrl, sessionToken);
      await upload(http, args.file);
    },
  });

  const downloadCommand = defineCommand({
    meta: { name: "download", description: "Download a file from the server" },
    args: {
      id: { type: "positional", description: "Transfer ID", required: true },
      dest: { type: "positional", description: "Destination path", required: true },
    },
    async run({ args }) {
      const { serverUrl, sessionToken } = await connect();
      const http = createHttpClient(serverUrl, sessionToken);
      await download(http, args.id, args.dest);
    },
  });

  const versionCommand = defineCommand({
    meta: { name: "version", description: "Show version" },
    run() {
      console.log(`kon v${VERSION}`);
    },
  });

  const main = defineCommand({
    meta: {
      name: "kon",
      version: VERSION,
      description: "kon — gigai client for Claude",
    },
    subCommands: {
      pair: pairCommand,
      connect: connectCommand,
      list: listCommand,
      help: helpCommand,
      status: statusCommand,
      upload: uploadCommand,
      download: downloadCommand,
      version: versionCommand,
    },
  });

  runMain(main);
}
