import { pluginPreact } from '@rsbuild/plugin-preact';

export default {
    plugins: [pluginPreact()],
    html: {
        template: './index.html',
    },
    source: {
        entry: {
            index: './src/index.tsx',
        },
    },
    output: {
        copy: [
            {
                from: "node_modules/foxomoji/dist/**/*",
                to: "foxomoji"
            }
        ]
    },
    resolve: {
        alias: {
            "@components": "./src/components",
            "@icons": "./src/assets/svg",
            "@hooks": "./src/hooks/",
            "@services": "./src/services/",
            "@utils": "./src/utils/",
            "@store": "./src/store/",
            "@interfaces": "./src/interfaces/",
        },
    },
};
