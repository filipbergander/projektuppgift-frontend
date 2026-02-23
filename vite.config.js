import { defineConfig } from "vite";
import { resolve } from "path";

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
    }
});