import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** GitHub Pages: project sites need /<repo>/; user/org pages use /. */
function githubPagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) return "/";
  const name = repo.split("/")[1];
  if (!name) return "/";
  if (name.endsWith(".github.io")) return "/";
  return `/${name}/`;
}

export default defineConfig({
  plugins: [react()],
  base: githubPagesBase(),
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
