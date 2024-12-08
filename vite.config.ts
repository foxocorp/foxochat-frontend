import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	resolve: {
		alias: [
			{
				find: "@components",
				replacement: fileURLToPath(new URL("./src/components", import.meta.url)),
			},
		],
	},
});
