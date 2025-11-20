import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
const FileType = require("file-type");

const storage = multer.memoryStorage();

const allowedMime = ["image/jpeg", "image/png", "application/pdf"];
const allowedExt = ["jpg", "jpeg", "png", "pdf"];

function secureFileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  // 1. Extension validation
  const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
  if (!allowedExt.includes(ext)) {
    return cb(new Error("Invalid file extension!"));
  }

  // 2. MIME type validation
  if (!allowedMime.includes(file.mimetype)) {
    return cb(new Error("Invalid MIME type!"));
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: secureFileFilter,
});

export const receivingUpload = multer({
  dest: "upload/receivedInventory/receivings",
});
