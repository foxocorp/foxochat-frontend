import { generateSW } from "workbox-build";

generateSW({
    swDest: "dist/sw.js",
    globDirectory: "dist",
    globPatterns: ["**/*.{html,js,css,png,jpg,jpeg,gif,svg}"],
    skipWaiting: true,
    clientsClaim: true,
}).then(({ count, size }) => {
    console.log(`Generated service worker for ${count} files, size: ${size} byte`);
});