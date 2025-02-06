// @ts-nocheck
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { dirname, resolve } from "path";
import preact from "@preact/preset-vite";
import autoprefixer from "autoprefixer";
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        preact(),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/foxomoji/dist/**/*',
                    dest: 'foxomoji',
                },
            ],
        }),
    ],
    resolve: {
        alias: [
            {
                find: "@components",
                replacement: resolve(__dirname, "./src/components"),
            },
            {
                find: "@icons",
                replacement: resolve(__dirname, "./src/assets/svg"),
            },
            {
                find: "@hooks",
                replacement: resolve(__dirname, "./src/hooks/"),
            },
            {
                find: "@services",
                replacement: resolve(__dirname, "./src/services/"),
            },
            {
                find: "@utils",
                replacement: resolve(__dirname, "./src/utils/"),
            },
            {
                find: "@store",
                replacement: resolve(__dirname, "./src/store/"),
            },
            {
                find: "@interfaces",
                replacement: resolve(__dirname, "./src/interfaces/"),
            },
        ],
    },
    css: {
        postcss: {
            plugins: [
                autoprefixer(),
            ],
        },
    },
});
