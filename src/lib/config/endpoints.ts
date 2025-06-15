export interface Config {
    cdnBaseUrl: string;
    apiUrl: string;
}

export const config: Config = {
    cdnBaseUrl:
        typeof process !== "undefined" && process.env?.CDN_BASE_URL
            ? process.env.CDN_BASE_URL
            : "https://media.foxochat.app/attachments/",
    apiUrl:
        typeof process !== "undefined" && process.env?.API_URL
            ? process.env.API_URL
            : "https://api.foxochat.app/",
};
