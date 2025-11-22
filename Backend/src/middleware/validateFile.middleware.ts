import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const validateUploadedFiles = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = req.files as Express.Multer.File[];

    for (const file of files) {
      if (!file.path) {
        return res.status(400).json({
          error: `File path missing. Are you using memoryStorage?`,
        });
      }

      const ext = path.extname(file.originalname).substring(1).toLowerCase();

      // Extension check
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          error: `Invalid file extension '${ext}'. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        });
      }

      // MIME type check
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          error: `Invalid MIME type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        });
      }

      // Magic header check
      const fileBuffer = fs.readFileSync(file.path);
      const header = fileBuffer.slice(0, 4).toString("hex");

      const pdfMagic = "25504446";
      const jpgMagic = "ffd8ff";
      const pngMagic = "89504e47";

      if (
        !header.startsWith(pdfMagic) &&
        !header.startsWith(jpgMagic) &&
        !header.startsWith(pngMagic)
      ) {
        fs.unlinkSync(file.path);
        return res.status(400).json({
          error: `Invalid file header for '${file.originalname}'. File may be corrupted or unsafe.`,
        });
      }
    }

    next();
  } catch (error: any) {
    console.error("File validation error:", error.message);

    return res.status(500).json({
      error: "Internal file validation error.",
      message: error.message,
    });
  }
};
