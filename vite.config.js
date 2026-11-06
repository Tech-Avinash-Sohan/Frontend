import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { makeProxy } from "./src/proxy.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    server: {
      port: 5173,
      // /api/* is forwarded to Django, so the browser sees one origin (no CORS setup needed)
      proxy: makeProxy(env.VITE_BACKEND_URL || "http://localhost:8000"),
    },
  };
});
