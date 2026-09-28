import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const repositoryRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/babylon-lite-pixel-walker/",
  root: "pixel-walker",
  server: {
    fs: {
      allow: [repositoryRoot],
    },
  },
});
