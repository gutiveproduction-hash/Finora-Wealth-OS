import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Renderer build config. Electron main/preload are compiled separately via electron/tsconfig.json
// (see package.json scripts) so we can keep them as plain CommonJS for maximum compatibility with
// native modules like better-sqlite3.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
