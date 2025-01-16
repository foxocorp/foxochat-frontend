// @ts-nocheck
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import preact from "@preact/preset-vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
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
				find: "@services",
				replacement: resolve(__dirname, "./src/services/"),
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
});
