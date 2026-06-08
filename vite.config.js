import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";   // tambah

export default defineConfig({
  plugins: [
    react(),
    VitePWA({                                 // tambah seluruh blok ini
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "RunPlanner — Jadwal Lari Mingguan",
        short_name: "RunPlanner",
        description: "Perencana lari mingguan",
        theme_color: "#17171C",
        background_color: "#F2F1ED",
        display: "standalone",     // ini yang bikin tampil tanpa address bar
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});