import multer from "multer";
import { extname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import MediaType from "../database/models/media-type.model.js";

const mediaTypeCache = {};

async function getMediaType(code) {
  if (mediaTypeCache[code]) return mediaTypeCache[code];
  const mediaType = await MediaType.findOne({ where: { code } });
  if (!mediaType) throw new Error(`Media type '${code}' not found`);
  mediaTypeCache[code] = mediaType;
  return mediaType;
}

export default async function createUpload(mediaTypeCode) {
  const mediaType = await getMediaType(mediaTypeCode);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `public/uploads/${mediaTypeCode}/`;
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, resolve(uploadPath));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase().replace(".", "");
    const mimeOk = mediaType.allowed_mimetypes.includes(file.mimetype);
    const extOk = mediaType.allowed_extensions.includes(ext);
    if (mimeOk && extOk) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${mediaType.allowed_extensions.join(", ")}`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: mediaType.max_file_size,
      files: mediaType.max_files,
    },
  });
}
