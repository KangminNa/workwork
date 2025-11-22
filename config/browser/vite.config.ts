
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "../../core/browser"),
  plugins: [react()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "../../core"),
      "@test": path.resolve(__dirname, "../../test")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "../../dist/web"),
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      // API calls (e.g., /screen/*) are served by the Express server on 3000
      "/screen": "http://127.0.0.1:3000"
    }
  }
});
