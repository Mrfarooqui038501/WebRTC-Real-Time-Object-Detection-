import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // All API requests go to backend (port 8080)
      "/api": "http://localhost:8080",
      "/metrics": "http://localhost:8080",
    },
  },
});
