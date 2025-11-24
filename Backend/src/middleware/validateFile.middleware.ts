import { Request, Response, NextFunction } from "express";
import path from "path";

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// detect %PDF in first 1KB
function bufferContainsPDF(buffer: Buffer): boolean {
  const text = buffer.slice(0, 1024).toString("utf8");
  return text.includes("%PDF-");
}

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
      // EXTENSION check
      const ext = path.extname(file.originalname).substring(1).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(400).json({
          error: `Invalid file extension '${ext}'. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        });
      }

      // MIME check
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return res.status(400).json({
          error: `Invalid MIME type '${file.mimetype}'. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`,
        });
      }

      // BUFFER check
      if (!file.buffer || file.buffer.length < 10) {
        return res.status(400).json({
          error: "Invalid or empty file buffer",
        });
      }

      const headerHex = file.buffer.slice(0, 8).toString("hex");
      const header = headerHex.toLowerCase();

      // JPG
      const isJPG = header.startsWith("ffd8ff");

      // PNG
      const isPNG = header.startsWith("89504e47");

      // PDF
      const isPDF = bufferContainsPDF(file.buffer);

      if (ext === "pdf" && !isPDF) {
        return res.status(400).json({
          error: `Invalid or corrupted PDF file '${file.originalname}'.`,
        });
      }

      if (ext === "jpg" || ext === "jpeg") {
        if (!isJPG) {
          return res.status(400).json({
            error: `Invalid JPG signature in '${file.originalname}'.`,
          });
        }
      }

      if (ext === "png") {
        if (!isPNG) {
          return res.status(400).json({
            error: `Invalid PNG signature in '${file.originalname}'.`,
          });
        }
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
