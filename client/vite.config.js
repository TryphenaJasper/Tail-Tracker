import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // lets you call fetch("/api/animals") in dev without CORS headaches
      "/api": "http://localhost:5000",
    },
  },
});
