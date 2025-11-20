import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
const FileType = require("file-type");

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

    // 2. Validate declared MIME
    if (!allowedMime.includes(file.mimetype)) {
      return cb(new Error("Invalid MIME type!"));
    }

    // 3. Validate Magic Number (Actual File Signature)
    const detected = await FileType.fromBuffer(file.buffer);

    if (!detected || !allowedMime.includes(detected.mime)) {
      return cb(
        new Error("Invalid file signature! Possible malicious file upload.")
      );
    }

    return cb(null, true);
  } catch (err) {
    return cb(new Error("File validation failed!"));
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    secureFileFilter(req, file, cb);
  },
});
