import { rgbaToThumbHash } from "thumbhash";
import { Logger } from "@utils/logger";

export const classNames = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
};

export async function generateThumbHashFromFile(file: File): Promise<string | null> {
    try {
        if (!file.type.startsWith("image/")) {
            console.warn("File is not an image:", file.type);
            return null;
        }

        const imgBitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxSize = 100;

        let [w, h] = [imgBitmap.width, imgBitmap.height];
        if (w > maxSize || h > maxSize) {
            const ar = w / h;
            if (ar > 1) {
                w = maxSize;
                h = Math.round(maxSize / ar);
            } else {
                h = maxSize;
                w = Math.round(maxSize * ar);
            }
        }

        canvas.width = w;
        canvas.height = h;
        if (!ctx) {
            console.error("Failed to get canvas 2D context");
            return null;
        }
        ctx.drawImage(imgBitmap, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        const thumb = rgbaToThumbHash(w, h, data);
        return btoa(String.fromCharCode(...thumb));
    } catch (error) {
        console.error("Error generating ThumbHash:", error);
        return null;
    }
}

export async function fetchFileAndGenerateThumbHash(url: string, contentType: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            Logger.warn(`Failed to fetch file from ${url}: ${response.statusText}`);
            return null;
        }
        const blob = await response.blob();
        const file = new File([blob], "attachment", { type: contentType });
        return await generateThumbHashFromFile(file);
    } catch (error) {
        Logger.error(`Failed to fetch file and generate ThumbHash: ${error}`);
        return null;
    }
}

export const timestampToHSV = (ts: number): { h: number; s: number; background: string } => {
    const seconds = Math.floor(ts / 1000);
    const h = seconds % 360;
    const s = 20 + ((seconds % 1000) / 1000) * 40;
    
    const mainColor = `hsl(${h}, ${s}%, 50%)`;
    const darkColor = `hsl(${h}, ${s}%, 60%)`;
    const background = `linear-gradient(135deg, ${mainColor} 0%, ${darkColor} 100%)`;
    
    return { h, s, background };
};