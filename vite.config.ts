import path from "path"
import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react(),tailwindcss()],

  optimizeDeps: {
    exclude: ["tauri-plugin-alarm-api"],
  },


  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    alias: {
      "tauri-plugin-alarm-api": path.resolve(__dirname, "./src/hooks/__mocks__/tauri-plugin-alarm-api.ts"),
      "@tauri-apps/plugin-store": path.resolve(__dirname, "./src/hooks/__mocks__/tauri-plugin-store.ts"),
    }
  }
}));
