import sharp from "sharp";
import { writeFile, unlink, rename, stat } from "node:fs/promises";

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const JPEG_QUALITY = 80;
const PNG_COMPRESSION_LEVEL = 9;

/**
 * Réduit la taille d'une image sur disque (resize + recompression JPEG/PNG).
 *
 * L'image est remplacée par son fichier optimisé (extension .jpg ou .png
 * selon la présence de transparence). Retourne les nouvelles infos fichier,
 * ou `null` si l'optimisation n'a pas pu être appliquée (le fichier d'origine
 * est alors conservé tel quel).
 *
 * @param {string} filePath — chemin du fichier image à optimiser
 * @returns {Promise<{ path: string, size: number, mime: string } | null>}
 */
export async function optimizeImage(filePath) {
    try {
        const image = sharp(filePath, { failOn: "none" }).rotate();
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) return null;

        const before = (await stat(filePath)).size;

        const resized = image.resize({
            width: MAX_WIDTH,
            height: MAX_HEIGHT,
            fit: "inside",
            withoutEnlargement: true,
        });

        let outPath;
        let mime;
        let output;

        if (metadata.hasAlpha) {
            outPath = filePath.replace(/\.[^.]+$/, ".png");
            mime = "image/png";
            output = await resized.png({ compressionLevel: PNG_COMPRESSION_LEVEL }).toBuffer();
        } else {
            outPath = filePath.replace(/\.[^.]+$/, ".jpg");
            mime = "image/jpeg";
            output = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
        }

        if (output.length >= before) return null;

        const tmpPath = `${outPath}.tmp-${process.pid}-${Date.now()}`;
        await writeFile(tmpPath, output);
        if (outPath !== filePath) await unlink(filePath).catch(() => {});
        await rename(tmpPath, outPath);
        return { path: outPath, size: output.length, mime };
    } catch (err) {
        console.error("Image optimization failed:", err.message);
        return null;
    }
}
