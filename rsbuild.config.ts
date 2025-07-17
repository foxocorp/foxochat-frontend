import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { readFileSync, writeFileSync } from "fs";

function getGitRevision() {
    try {
        const rev = readFileSync('.git/HEAD').toString().trim();
        if (rev.indexOf(':') === -1) {
            return rev.substring(0, 7);
        }
        const fullHash = readFileSync('.git/' + rev.substring(5)).toString().trim();
        return fullHash.substring(0, 7);
    } catch {
        return '?';
    }
}

function getGitBranch() {
    try {
        const rev = readFileSync('.git/HEAD').toString().trim();
        if (rev.indexOf(':') === -1) {
            return 'DETACHED';
        }
        return rev.split('/').pop();
    } catch {
        return '?';
    }
}

function getGitCommitCount() {
    try {
        const { execSync } = require('child_process');
        return execSync('git rev-list --count HEAD').toString().trim();
    } catch {
        return '?';
    }
}

const gitRevision = getGitRevision();
const gitBranch = getGitBranch();
const gitCommitCount = getGitCommitCount();
const versionString = `(${gitCommitCount}, ${gitRevision})`;

try {
    writeFileSync('./public/version', versionString);
    console.log('Generated version:', versionString);
} catch (error) {
    console.error('Failed to write version file:', error);
}

const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
	plugins: [pluginPreact(), pluginTypedCSSModules(), pluginSass(), pluginSvgr()],
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
      __GIT_REVISION__: JSON.stringify(gitRevision),
      __GIT_BRANCH__: JSON.stringify(gitBranch),
      __GIT_COMMIT_COUNT__: JSON.stringify(gitCommitCount),
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
