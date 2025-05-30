import { defineConfig } from "vite";
import { resolve } from 'path'
import { sveltekit } from "@sveltejs/kit/vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  plugins: [sveltekit()],

  clearScreen: false,
   resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $stores: resolve(__dirname, 'src/stores'),
    }
  },
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
      ignored: ["**/src-tauri/**"],
    },
  },
}));
