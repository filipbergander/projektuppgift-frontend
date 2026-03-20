import { defineConfig } from "vite";
import { resolve } from "path";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
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
        ViteImageOptimizer({
            svg: {
                quality: 50
            }
        }),
        VitePWA({
            registerType: 'autoUpdate',
            devOptions: {
                enabled: true
            }
        })
    ]
});