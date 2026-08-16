/**
 * Script one-shot : recompresse les images existantes de public/uploads/
 * via le helper d'optimisation (resize max 1600px + JPEG q80 / PNG compressé).
 *
 * Usage : node scripts/optimize-uploads.js
 */
import { readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { statSync } from "node:fs";
import { optimizeImage } from "../src/shared/helpers/imageOptimizer.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsRoot = resolve(__dirname, "../public/uploads");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const SKIP = new Set([".gif"]);

async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) files.push(...await walk(full));
        else if (entry.isFile()) files.push(full);
    }
    return files;
}

const allFiles = await walk(uploadsRoot);
const imageFiles = allFiles.filter((f) => {
    const ext = extname(f).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext) || SKIP.has(ext);
});

let optimized = 0;
let skipped = 0;
let savedBytes = 0;

for (const file of imageFiles) {
    const ext = extname(file).toLowerCase();
    if (SKIP.has(ext)) {
        skipped += 1;
        continue;
    }
    const before = statSync(file).size;
    const result = await optimizeImage(file);
    if (result) {
        const after = result.size;
        optimized += 1;
        savedBytes += before - after;
        console.log(`OK  ${file.replace(uploadsRoot, "uploads")}  ${(before / 1024).toFixed(0)} Ko -> ${(after / 1024).toFixed(0)} Ko`);
    } else {
        skipped += 1;
    }
}

console.log("---");
console.log(`Images traitées : ${optimized} | inchangées/ignorées : ${skipped}`);
console.log(`Espace économisé : ${(savedBytes / (1024 * 1024)).toFixed(1)} Mo`);
process.exit(0);
