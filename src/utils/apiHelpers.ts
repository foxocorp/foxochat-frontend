export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function toFullUrl(relativeOrFullUrl: string, baseUrl: string): string {
    try {
        return isValidUrl(relativeOrFullUrl)
            ? relativeOrFullUrl
            : new URL(relativeOrFullUrl, baseUrl).toString();
    } catch (error) {
        console.error("Failed to construct full URL:", {
            relativeOrFullUrl,
            baseUrl,
            error,
        });
        throw new Error(`Invalid URL: ${relativeOrFullUrl}`);
    }
} 