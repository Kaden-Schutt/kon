import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
  outExtension: () => ({ js: ".js" }),
  noExternal: ["@gigai/shared"],
  external: [
    "zod",
    "undici",
  ],
});
