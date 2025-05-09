import { rgbaToThumbHash } from "thumbhash";

export async function generateThumbHashFromFile(file: File): Promise<string | null> {
    if (!file.type.startsWith("image/")) return null;

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
    if (!ctx) return null;
    ctx.drawImage(imgBitmap, 0, 0, w, h);

    const { data } = ctx.getImageData(0, 0, w, h);
    const thumb = rgbaToThumbHash(w, h, data);
    return btoa(String.fromCharCode(...thumb));
}