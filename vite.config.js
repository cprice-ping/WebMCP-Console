import { defineConfig } from "vite";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "WebMCP-Console";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || `/${repo}/`
});
