import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";
import { pluginSass } from '@rsbuild/plugin-sass';

export default {
    plugins: [
        pluginPreact(),
        pluginTypedCSSModules(),
        pluginSass(),
    ],
    html: {
        template: './index.html',
    },
    source: {
        entry: {
            index: './src/index.tsx',
        },
        define: {
            "import.meta.env.MODE": JSON.stringify(process.env.MODE || "production"),
        },
    },
    output: {
        cssModules: {

        },
        copy: [
            {
                from: "node_modules/foxomoji/dist",
                to: "foxomoji"
            },
            { from: "public/manifest.json", to: "manifest.json" },
            { from: "public/favicon-96x96.png", to: "favicon-96x96.png" },
            { from: "public/web-app-manifest-512x512.png", to: "web-app-manifest-512x512.png" },
            { from: "dist/sw.js", to: "sw.js" },
            { from: "node_modules/workbox-*/**/*.js", to: "" },
        ]
    },
    resolve: {
        alias: {
            "@": "./src/",
            "@components": "./src/components",
            "@icons": "./src/assets/svg",
            "@hooks": "./src/hooks/",
            "@services": "./src/services/",
            "@utils": "./src/utils/",
            "@store": "./src/store/",
            "@lib": "./src/lib/",
            "@interfaces": "./src/interfaces/",
        },
        modules: ['node_modules', 'src'],
    },
};
