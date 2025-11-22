
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
  server: { port: 5173 }
});
