import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/** GitHub Pages: project sites need /<repo>/; user/org pages use /. */
function githubPagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return "/";
  const name = repo.split("/")[1];
  if (!name) return "/";
  if (name.endsWith(".github.io")) return "/";
  return `/${name}/`;
}

/** Unique per build; the page compares it with /version.json to detect a newer deploy. */
const BUILD_ID = String(Date.now());

/** Emits version.json (never hashed, fetched with cache-busting) next to index.html. */
function versionFile(): Plugin {
  return {
    name: "version-file",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ id: BUILD_ID }),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), versionFile()],
  base: githubPagesBase(),
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["src/test/setupLevels.ts"],
    /** The Sun King batch simulations take 3–5 s alone (the default limit is 5 s) and more when files run in parallel. */
    testTimeout: 30_000,
    /** Long batch scripts set these so console output is visible. */
    disableConsoleIntercept:
      process.env.VITEST_LONG_THIRD === "1" ||
      process.env.VITEST_LONG_SECOND_TO_THIRD === "1" ||
      process.env.VITEST_MENU_STANDALONE_LONG === "1",
  },
});
