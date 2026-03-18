import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        open: true
    },
    css: { // För att se scss-filerna inom developer-läget i webbläsaren
        devSourcemap: true
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html")
            }
        }
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            }
        })
    ]
});