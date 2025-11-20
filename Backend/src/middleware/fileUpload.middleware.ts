import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

const storage = multer.memoryStorage();

const allowedMime = ["image/jpeg", "image/png", "application/pdf"];
const allowedExt = ["jpg", "jpeg", "png", "pdf"];

async function secureFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  try {
    // 1. Validate Extension
    const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
    if (!allowedExt.includes(ext)) {
      return cb(new Error("Invalid file extension!"));
    }

    // 2. Validate MIME Type (declared)
    if (!allowedMime.includes(file.mimetype)) {
      return cb(new Error("Invalid MIME type!"));
    }

    // 3. Validate actual file signature using Magic Number
    const detected = await fileTypeFromBuffer(new Uint8Array(file.buffer));

    if (!detected || !allowedMime.includes(detected.mime)) {
      return cb(new Error("Invalid file signature! Possible malicious file."));
    }

    cb(null, true);
  } catch (error) {
    cb(new Error("File validation failed!"));
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    secureFileFilter(req, file, cb);
  },
});
