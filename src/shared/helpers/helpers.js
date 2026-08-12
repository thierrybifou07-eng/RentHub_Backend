import { Otp } from "../../database/models/index.js";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../..");

export function getPlural(word) {
    // 🔹 Liste des pluriels irréguliers
    const irregularPlurals = {
        man: "men",
        woman: "women",
        child: "children",
        foot: "feet",
        tooth: "teeth",
        goose: "geese",
        mouse: "mice",
        person: "people",
        ox: "oxen"
    };

    // 🔹 Mots invariables (identiques au singulier et pluriel)
    const uncountableNouns = ["sheep", "fish", "deer", "species", "series", "moose"];

    // ✅ Vérifier les irréguliers
    if (irregularPlurals[word.toLowerCase()]) {
        return irregularPlurals[word.toLowerCase()];
    }

    // ✅ Vérifier les invariables
    if (uncountableNouns.includes(word.toLowerCase())) {
        return word;
    }

    // ✅ Règle: si le mot finit par "f" ou "fe" → "ves"
    if (word.match(/(f|fe)$/)) {
        return word.replace(/(f|fe)$/, "ves");
    }

    // ✅ Règle: si le mot finit par "y" et est précédé d'une consonne → "ies"
    if (word.match(/[^aeiou]y$/)) {
        return word.replace(/y$/, "ies");
    }

    // ✅ Règle: si le mot finit par "s", "x", "z", "ch", "sh" → "es"
    if (word.match(/(s|x|z|ch|sh)$/)) {
        return word + "es";
    }

    // ✅ Cas général: ajouter simplement "s"
    return word + "s";
}

export function generate(length) {
    let code = ""
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10) // Génère un chiffre entre 0 et 9
    }
    return code
}
export const generateVerificationCode = async (length = 6, expiredMilliSeconds = (1) * 60 * 60 * 1000) => {

    let code = generate(length), bool = true

    while (bool) {
        const otp = await Otp.findOne({ where: { code } })
        if (otp) code = generate(length)
        else bool = false
    }

    const expiredAt = new Date(Date.now() + expiredMilliSeconds)

    return { code, expiredAt }
}

export const isCodeValid = (code, user) => {
    if (user.code !== code || !user.expiredAt) return false
    const now = new Date(); // Récupère la date actuelle
    return now < user.expiredAt; // Vérifie si le code est encore valide
}

export const generateCodeRegex = (length) => {
    return new RegExp(`^\\d{${length}}$`);
}

export const removeNullProperties = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(removeNullProperties);
    }

    const cleaned = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== null && obj[key] !== undefined) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Récursif pour les objets imbriqués
                const cleanedValue = removeNullProperties(obj[key]);
                // Ne garder que si l'objet nettoyé n'est pas vide
                if (Object.keys(cleanedValue).length > 0 || Array.isArray(cleanedValue)) {
                    cleaned[key] = cleanedValue;
                }
            } else {
                cleaned[key] = obj[key];
            }
        }
    });

    return cleaned;
}

export function removeAccents(str) {
    return str
        .normalize("NFD")                  // Décompose les caractères accentués
        .replace(/[\u0300-\u036f]/g, "");   // Supprime les marques diacritiques
}

/**
 * Converts an absolute disk path returned by multer into a public URL path
 * that the static file server understands.
 *
 * multer writes to: /abs/path/to/project/public/uploads/ANNOUNCEMENT_IMAGE/14/xxx.png
 * server serves:    app.use("/uploads", express.static(".../public/uploads"))
 * result:           /uploads/ANNOUNCEMENT_IMAGE/14/xxx.png
 *
 * @param {string} absolutePath - Absolute path returned by multer (file.path)
 * @returns {string} Public URL path starting with /uploads/
 */
export function toPublicUploadUrl(absolutePath) {
    const normalized = absolutePath.replace(/\\/g, "/");
    const marker = "public/uploads/";
    const idx = normalized.indexOf(marker);
    if (idx === -1) return normalized; // Fallback: return as-is if pattern not found
    // Strip "public/" prefix so the result is "/uploads/..."
    return "/" + normalized.substring(idx + "public/".length);
}

/**
 * Converts a public upload URL (e.g. "/uploads/ANNOUNCEMENT_IMAGE/14/xxx.png")
 * back into an absolute disk path so files can be removed with fs.
 */
export function publicUrlToDiskPath(url) {
    if (!url || typeof url !== "string") return null;
    const normalized = url.replace(/\\/g, "/");
    const marker = "public/uploads/";
    const markerIdx = normalized.indexOf(marker);
    if (markerIdx !== -1) {
        return resolve(PROJECT_ROOT, normalized.substring(markerIdx));
    }
    if (normalized.startsWith("uploads/")) {
        return resolve(PROJECT_ROOT, "public", normalized);
    }
    if (normalized.startsWith("/")) {
        return resolve(PROJECT_ROOT, normalized.replace(/^\//, ""));
    }
    return resolve(PROJECT_ROOT, normalized);
}
