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
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const files = req.files as Express.Multer.File[];

  for (const file of files) {
    const ext = path.extname(file.originalname).substring(1).toLowerCase();

    // ❌ extension check
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      fs.unlinkSync(file.path); // delete uploaded file
      return res.status(400).json({ error: `Invalid file extension: ${ext}` });
    }

    // ❌ MIME type check
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: `Invalid MIME type: ${file.mimetype}` });
    }

    // ❌ Magic byte header validation (basic)
    const header = fs.readFileSync(file.path).slice(0, 4).toString("hex");

    const pdfMagic = "25504446"; // %PDF
    const jpgMagic = "ffd8ffe0";
    const pngMagic = "89504e47";

    if (
      !header.startsWith(pdfMagic) &&
      !header.startsWith(jpgMagic) &&
      !header.startsWith(pngMagic)
    ) {
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "File does not match expected header. Possibly corrupted or unsafe.",
      });
    }
  }

  next();
};
