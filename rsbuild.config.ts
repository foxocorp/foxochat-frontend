import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";

const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
	plugins: [pluginPreact(), pluginTypedCSSModules(), pluginSass()],
	html: {
		template: "./index.html",
	},
	source: {
		entry: {
			index: "./src/index.tsx",
		},
		define: {
			"process.env.CDN_BASE_URL": JSON.stringify(
				process.env.CDN_BASE_URL || "https://media.foxochat.app/attachments/",
			),
			"process.env.API_URL": JSON.stringify(
				process.env.API_URL || "https://api.foxochat.app/",
			),
			"import.meta.env.MODE": JSON.stringify(
				process.env.NODE_ENV || "production",
			),
			config: JSON.stringify({
				cdnBaseUrl:
					process.env.CDN_BASE_URL || "https://media.foxochat.app/attachments/",
				apiUrl: process.env.API_URL || "https://api.foxochat.app/",
			}),
		},
		preEntry: isDevelopment ? ["preact/debug"] : [],
	},
	output: {
		polyfill: "usage",
		cssModules: {
			namedExport: true,
		},
		copy: [{ from: "node_modules/workbox-*/**/*.js", to: "workbox/" }],
	},
	resolve: {
		alias: {
			"@": "./src/",
			"@components": "./src/components",
			"@icons": "./src/assets/svg",
			"@assets": "./src/assets/",
			"@hooks": "./src/hooks/",
			"@services": "./src/services/",
			"@utils": "./src/utils/",
			"@store": "./src/store/",
			"@lib": "./src/lib/",
			"@interfaces": "./src/interfaces/",
		},
	},
});
