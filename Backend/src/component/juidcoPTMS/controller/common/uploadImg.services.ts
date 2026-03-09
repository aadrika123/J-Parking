import { Request, Response } from "express";

import UploadFileDao from "../../dao/uploadFile/uploadFile.dao";

export default class UploadImgServices {
  imageUpload = async (req: Request, res: Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          error: "No files uploaded",
        });
      }

      const file = await UploadFileDao.upload(req);

      if (!file) {
        return res.status(500).json({
          error: "Failed to upload file",
        });
      }

      return res.status(200).json({
        message: "File uploaded successfully",
        data: file,
      });

    } catch (error: any) {
      console.error("Upload Error:", error);

      return res.status(500).json({
        error: "Internal Server Error",
        message: error?.message,
      });
    }
  };
}