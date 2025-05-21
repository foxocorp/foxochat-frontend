import { generateSW } from "workbox-build";

generateSW({
    swDest: "dist/public/sw.js",
    globDirectory: "dist",
    globPatterns: ["**/*.{html,js,css}"],
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
        {
            urlPattern: ({ url }) =>
                url.origin === "https://cdn.foxogram.su " && url.pathname.startsWith("/attachments"),
            handler: "StaleWhileRevalidate",
            options: {
                cacheName: "attachments-cache",
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 7 * 24 * 60 * 60,
                },
            },
        },
        {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
                cacheName: "images",
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                },
            },
        },
        {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
                cacheName: "pages",
            },
        },
    ],
}).then(({ count, size }) => {
    console.log(`Generated service worker for ${count} files, size: ${size} bytes`);
}).catch((error) => {
    console.error("Failed to generate service worker:", error);
});