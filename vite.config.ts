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
  },
});
