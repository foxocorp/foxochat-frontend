import { pluginPreact } from '@rsbuild/plugin-preact';
import { pluginTypedCSSModules } from "@rsbuild/plugin-typed-css-modules";
import { pluginSass } from '@rsbuild/plugin-sass';

const isDevelopment = import.meta.env.MODE == "development";

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
        reEntry: isDevelopment ? ["preact/debug"] : [],
    },
    output: {
        cssModules: {

        },
        copy: [
            {
                from: "node_modules/foxomoji/dist",
                to: "foxomoji"
            },
            { from: "node_modules/workbox-*/**/*.js", to: "workbox/" },
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
